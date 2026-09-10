"use client";

import { useEffect, useRef, useState } from "react";

interface Notification {
  id: string;
  type: "WEATHER" | "CROP_STAGE" | "ADMIN";
  severity: "RED" | "AMBER" | "INFO";
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
}

const SEVERITY_DOT: Record<string, string> = {
  RED: "bg-red-500",
  AMBER: "bg-amber-500",
  INFO: "bg-blue-500",
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const res = await fetch("/api/farmer/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // silent — bell just won't update this cycle
    }
  }

  useEffect(() => {
    // Fetch-on-mount + poll: intentional, not derivable from props/state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function markAllRead() {
    await fetch("/api/farmer/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markAllRead" }),
    });
    load();
  }

  async function markRead(id: string) {
    await fetch("/api/farmer/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markRead", id }),
    });
    load();
  }

  async function dismiss(id: string) {
    await fetch("/api/farmer/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "dismiss", id }),
    });
    load();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-brand-lighter bg-white hover:bg-brand-lighter/60"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] rounded-2xl border border-brand-lighter bg-white p-3 shadow-lg">
          <div className="flex items-center justify-between px-1 pb-2">
            <p className="text-sm font-bold text-brand-dark">Notifications</p>
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs font-semibold text-brand-medium hover:underline"
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-1 py-4 text-center text-sm text-brand-dark/50">No notifications yet.</p>
            )}
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`rounded-xl border p-3 text-sm ${n.readAt ? "border-brand-lighter" : "border-brand-medium bg-brand-lighter/30"}`}
              >
                <div className="flex items-start gap-2">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${SEVERITY_DOT[n.severity]}`} />
                  <div className="flex-1">
                    <p className="font-semibold text-brand-dark">{n.title}</p>
                    <p className="mt-0.5 text-brand-dark/70">{n.message}</p>
                    <div className="mt-2 flex gap-3">
                      {!n.readAt && (
                        <button
                          type="button"
                          onClick={() => markRead(n.id)}
                          className="text-xs font-semibold text-brand-medium hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => dismiss(n.id)}
                        className="text-xs font-semibold text-brand-dark/50 hover:underline"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
