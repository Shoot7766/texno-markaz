"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Menu } from "lucide-react";
import { AdminNav } from "./admin-nav";
import { useState } from "react";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-56 transform border-r border-slate-200 bg-white shadow-sm transition md:relative md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex h-14 items-center border-b border-slate-200 px-4">
          <Link href="/admin" className="font-semibold text-slate-900">
            CRM
          </Link>
        </div>
        <AdminNav />
      </aside>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          aria-label="Yopish"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
          <button
            type="button"
            className="rounded-lg p-2 md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Menyu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex flex-1 items-center justify-end gap-3">
            <Link href="/" className="text-sm text-slate-600 hover:text-blue-600">
              Saytga o‘tish
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              Chiqish
            </button>
          </div>
        </header>
        <div className="flex-1 bg-slate-100 p-4 text-slate-900 md:p-8">{children}</div>
      </div>
    </div>
  );
}
