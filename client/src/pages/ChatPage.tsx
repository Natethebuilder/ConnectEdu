import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Send } from "lucide-react";
import http from "../api/http";
import { useSupabaseAuth } from "../store/supabaseAuth";

type ChatMessage = {
  _id: string;
  senderId: string;
  recipientId: string;
  text: string;
  createdAt: string;
};

type MentorLite = {
  userId: string;
  name: string;
  headline?: string;
  imageUrl?: string;
};

export default function ChatPage() {
  const { otherId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSupabaseAuth();

  const [mentor, setMentor] = useState<MentorLite | null>(
    (location.state as any)?.mentor ?? null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Load mentor if not passed via state (optional)
  useEffect(() => {
    if (!otherId) return;
    if (mentor) return;

    (async () => {
      try {
        const res = await http.get(`/api/mentors/by-user/${otherId}`);
        setMentor(res.data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [otherId, mentor]);

  // Fetch conversation + poll every 3s
  useEffect(() => {
    if (!otherId || !user) return;

    let active = true;

    const fetchMessages = async () => {
      try {
        const res = await http.get(
          `/api/messages/conversation/${otherId}`
        );
        if (!active) return;
        setMessages(res.data || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        if (active) setLoading(false);
      }
    };

    fetchMessages();
    const id = setInterval(fetchMessages, 3000);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, [otherId, user]);

 // Mark messages as read whenever user opens this chat
  useEffect(() => {
    if (!otherId || !user) return;

    http.post(`/api/connections/read/${otherId}`).catch(console.error);
  }, [otherId, user]);
 
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otherId || !user) return;
    const text = input.trim();
    if (!text) return;

    const tempId = `temp-${Date.now()}`;
    const optimistic: ChatMessage = {
      _id: tempId,
      senderId: user.id,
      recipientId: otherId,
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setSending(true);

    try {
      const res = await http.post("/api/messages", {
        recipientId: otherId,
        text,
      });
      const real = res.data as ChatMessage;

      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? real : m))
      );
    } catch (err) {
      console.error(err);
      // rollback optimistic
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const handleDownload = () => {
    if (!messages.length) return;

    const mentorName = mentor?.name || "mentor";
    const lines = messages.map((m) => {
      const who = m.senderId === user?.id ? "You" : mentorName;
      const time = new Date(m.createdAt).toLocaleString();
      return `[${time}] ${who}: ${m.text}`;
    });

    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${mentorName}-conversation.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const youId = user?.id;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 sm:px-8 py-6">
      {/* Back button + header */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-gray-200 shadow-sm text-xs font-medium text-gray-700 hover:bg-white"
        >
          <Download className="w-3.5 h-3.5" />
          Download conversation
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_24px_80px_rgba(15,23,42,0.18)] rounded-3xl flex flex-col h-[80vh] overflow-hidden">
        {/* Top bar: mentor info */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50/80 via-white to-blue-50/80">
          {mentor?.imageUrl ? (
            <img
              src={mentor.imageUrl}
              alt={mentor.name}
              className="w-10 h-10 rounded-2xl object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
              {mentor?.name?.[0] ?? "M"}
            </div>
          )}

          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {mentor?.name || "Mentor"}
            </p>
            {mentor?.headline && (
              <p className="text-xs text-gray-500 truncate">
                {mentor.headline}
              </p>
            )}
          </div>

          <div className="ml-auto text-[11px] text-gray-400">
            Messages are kept for 14 days and then deleted.
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 bg-gradient-to-br from-slate-50/60 via-white to-purple-50/60">
          {loading && (
            <div className="text-center text-xs text-gray-400 mt-4">
              Loading conversation…
            </div>
          )}

          {!loading && !messages.length && (
            <div className="text-center text-xs text-gray-400 mt-4">
              Say hi to start the conversation ✨
            </div>
          )}

          {messages.map((m) => {
            const isMe = m.senderId === youId;
            return (
              <div
                key={m._id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    isMe
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                      : "bg-white text-gray-800 border border-gray-100"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  <p
                    className={`mt-1 text-[10px] ${
                      isMe ? "text-white/70" : "text-gray-400"
                    }`}
                  >
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="border-t border-gray-100 bg-white/90 px-4 sm:px-6 py-3 flex items-end gap-3"
        >
          <textarea
            className="flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent max-h-32"
            rows={1}
            placeholder="Type a message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <motion.button
            type="submit"
            whileHover={{ scale: sending ? 1 : 1.05 }}
            whileTap={{ scale: sending ? 1 : 0.97 }}
            disabled={sending || !input.trim()}
            className="inline-flex items-center justify-center rounded-2xl px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold shadow disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 mr-1.5" />
            Send
          </motion.button>
        </form>
      </div>
    </div>
  );
}
