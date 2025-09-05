// client/src/components/ChatDrawer.tsx
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSupabaseAuth } from "../store/supabaseAuth";

export default function ChatDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useSupabaseAuth();
  const [messages, setMessages] = useState<
    { id: string; text: string; userId: string; createdAt: string }[]
  >([]);
  const [text, setText] = useState("");
  const socketRef = useRef<Socket | null>(null);

  // Connect socket
  useEffect(() => {
    if (!user || !open) return;
    const token = localStorage.getItem("token");
    const base = import.meta.env.VITE_API_BASE.replace("/api", "");
    const socket = io(base, { auth: { token } });
    socketRef.current = socket;
    socket.emit("joinRoom", "global-chat"); // you can swap with uni/alumni specific room
    socket.on("message", (msg) => setMessages((m) => [...m, msg]));
    return () => {
      socket.disconnect();
    };
  }, [user, open]);

  function send() {
    if (!text.trim()) return;
    socketRef.current?.emit("message", {
      room: "global-chat",
      text,
      userId: user?.id,
    });
    setText("");
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 z-50 flex flex-col
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-semibold text-lg">Alumni Chat</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 text-sm">
          {messages.map((m, i) => (
            <div key={i} className="flex flex-col">
              <span
                className={`font-semibold ${
                  m.userId === user?.id ? "text-blue-600" : "text-gray-800"
                }`}
              >
                {m.userId === user?.id ? "You" : m.userId}
              </span>
              <span className="bg-gray-100 rounded px-2 py-1 mt-1">
                {m.text}
              </span>
            </div>
          ))}
        </div>

        {/* Input */}
        {user ? (
          <div className="p-3 border-t flex gap-2">
            <input
              className="border flex-1 px-2 py-1 rounded"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
            />
            <button
              className="bg-blue-600 text-white px-4 py-1 rounded"
              onClick={send}
            >
              Send
            </button>
          </div>
        ) : (
          <div className="p-4 text-sm text-gray-600 border-t">
            Please log in to chat with alumni.
          </div>
        )}
      </aside>
    </>
  );
}
