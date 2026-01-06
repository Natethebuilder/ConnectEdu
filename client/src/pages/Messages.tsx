import { useEffect, useState } from "react";
import http from "../api/http";
import { Link } from "react-router-dom";

type InboxItem = {
  userId: string;     // you
  otherId: string;    // other user
  lastMessage: string;
  lastTimestamp: string;
  unread: number;
};

type ProfileLite = {
  userId: string;
  name: string;
  imageUrl?: string;
  headline?: string;
};

export default function Messages() {
  const [list, setList] = useState<InboxItem[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});

  useEffect(() => {
    http.get("/api/connections").then(async (res) => {
      const items: InboxItem[] = res.data || [];
      setList(items);

      // fetch mentor/student profile for each otherId
      const ids = [...new Set(items.map((i) => i.otherId))];

      const profileMap: Record<string, ProfileLite> = {};
      for (const id of ids) {
        try {
          const res = await http.get(`/api/mentors/by-user/${id}`);
          profileMap[id] = res.data;
        } catch {
          profileMap[id] = { userId: id, name: id };
        }
      }

      setProfiles(profileMap);
    });
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>

      <div className="space-y-4">
        {list.map((conn) => {
          const p = profiles[conn.otherId];

          return (
            <Link
              key={conn.otherId}
              to={`/chat/${conn.otherId}`}
              className="flex items-center gap-4 p-4 bg-white rounded-xl shadow hover:shadow-lg transition"
            >
              {/* avatar */}
              {p?.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center font-bold text-gray-700">
                  {p?.name?.[0] || "?"}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {p?.name || conn.otherId}
                </p>

                <p className="text-gray-500 text-sm truncate">
                  {conn.lastMessage}
                </p>
              </div>

              {conn.unread > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {conn.unread}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
