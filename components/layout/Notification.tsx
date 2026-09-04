"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Cookies from "js-cookie";
import {
  AlertCircle,
  Bell,
  CheckCheck,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

interface AdminNotification {
  id: string;
  data?: {
    message?: string;
    title?: string;
    company_name?: string;
    type?: string;
  };
  created_at: string;
  read_at: string | null;
}

const token = () => {
  const value =
    Cookies.get("authToken") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("authToken");
  return value?.replace(/["']/g, "") || null;
};
const headers = () => ({
  Authorization: `Bearer ${token()}`,
  Accept: "application/json",
});

export default function Notification() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const load = useCallback(async (quiet = false) => {
    if (!token()) return;
    if (!quiet) setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/notifications", {
        headers: headers(),
        cache: "no-store",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(payload?.message || "Chargement impossible.");
      const data = payload?.data ?? payload;
      setItems(Array.isArray(data) ? data : []);
    } catch (caught) {
      if (!quiet)
        setError(
          caught instanceof Error ? caught.message : "Chargement impossible.",
        );
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    void load();
    const interval = window.setInterval(() => void load(true), 60_000);
    return () => window.clearInterval(interval);
  }, [load]);
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !panelRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      )
        setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const markAll = async () => {
    setBusy("all");
    try {
      const response = await fetch("/api/v1/notifications/mark-as-read", {
        method: "POST",
        headers: headers(),
      });
      if (response.ok) {
        const now = new Date().toISOString();
        setItems((current) =>
          current.map((item) => ({ ...item, read_at: item.read_at || now })),
        );
      }
    } finally {
      setBusy(null);
    }
  };
  const remove = async (id: string) => {
    setBusy(id);
    try {
      const response = await fetch(`/api/v1/notifications/${id}`, {
        method: "DELETE",
        headers: headers(),
      });
      if (response.ok)
        setItems((current) => current.filter((item) => item.id !== id));
    } finally {
      setBusy(null);
    }
  };
  const unread = items.filter((item) => !item.read_at).length;

  return (
    <div>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Notifications${unread ? `, ${unread} non lues` : ""}`}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[10px] font-bold text-white dark:border-slate-950">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {mounted &&
        open &&
        createPortal(
          <section
            ref={panelRef}
            className="fixed right-3 top-20 z-[100] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 sm:right-5"
            style={{ width: "min(390px, calc(100vw - 24px))" }}
          >
            <header className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white px-4 py-3.5 dark:border-slate-800 dark:from-emerald-950/40 dark:to-slate-950">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Notifications admin
                  </h2>
                  {unread > 0 && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {unread} nouvelle{unread > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Activités nécessitant votre attention
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="max-h-[480px] overflow-y-auto">
              {loading ? (
                <div className="flex h-44 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                </div>
              ) : error ? (
                <div className="px-6 py-10 text-center">
                  <AlertCircle className="mx-auto h-7 w-7 text-red-500" />
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={() => void load()}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Réessayer
                  </button>
                </div>
              ) : items.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <ShieldCheck className="mx-auto h-8 w-8 text-emerald-500" />
                  <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                    Aucune alerte
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    La plateforme est à jour.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className={`group relative p-4 pr-12 ${item.read_at ? "bg-white dark:bg-slate-950" : "bg-emerald-50/50 dark:bg-emerald-950/20"}`}
                    >
                      <div className="flex gap-3">
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                            {item.data?.title ||
                              item.data?.company_name ||
                              "Activité FaceJob"}
                          </p>
                          <p className="mt-1 line-clamp-3 break-words text-xs leading-5 text-slate-600 dark:text-slate-300">
                            {item.data?.message ||
                              "Une nouvelle activité a été enregistrée."}
                          </p>
                          <time className="mt-2 block text-[10px] text-slate-400">
                            {new Date(item.created_at).toLocaleString("fr-FR", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </time>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => void remove(item.id)}
                        disabled={busy === item.id}
                        aria-label="Supprimer"
                        className="absolute right-2 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-600"
                      >
                        {busy === item.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {unread > 0 && (
              <footer className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-right dark:border-slate-800 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => void markAll()}
                  disabled={busy === "all"}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
                >
                  {busy === "all" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCheck className="h-3.5 w-3.5" />
                  )}
                  Tout marquer comme lu
                </button>
              </footer>
            )}
          </section>,
          document.body,
        )}
    </div>
  );
}
