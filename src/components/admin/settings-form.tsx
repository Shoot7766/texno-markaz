"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicStats, Settings as SettingsRow } from "@/lib/types";
import { savePublicStats, upsertSettings } from "@/lib/actions/crm";
import { Loader2 } from "lucide-react";
import { LogoUpload } from "@/components/admin/logo-upload";

type Props = {
  settings: SettingsRow;
  stats: Pick<
    PublicStats,
    | "students_count"
    | "graduated_count"
    | "employed_count"
    | "applications_count"
    | "active_students_count"
  >;
};

export function SettingsForm({ settings, stats }: Props) {
  const router = useRouter();
  const [s, setS] = useState(settings);
  const [st, setSt] = useState(stats);
  const [loading, setLoading] = useState(false);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await upsertSettings({
        center_name: s.center_name,
        phone: s.phone,
        telegram: s.telegram,
        instagram: s.instagram,
        address: s.address,
        seo_title: s.seo_title,
        seo_description: s.seo_description,
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function saveStats(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await savePublicStats({
        students_count: st.students_count,
        graduated_count: st.graduated_count,
        employed_count: st.employed_count,
        applications_count: st.applications_count,
        active_students_count: st.active_students_count,
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <LogoUpload currentUrl={s.logo_url || ""} />
        <form
          onSubmit={saveSettings}
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="font-semibold text-slate-900">Markaz va SEO</h2>
          {(
            [
              ["center_name", "Markaz nomi"],
              ["phone", "Telefon"],
              ["telegram", "Telegram URL"],
              ["instagram", "Instagram URL"],
              ["address", "Manzil"],
              ["seo_title", "SEO title"],
              ["seo_description", "SEO description"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-sm">
              {label}
              {key === "seo_description" ? (
                <textarea
                  value={String(s[key as keyof SettingsRow] ?? "")}
                  onChange={(e) => setS({ ...s, [key]: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              ) : (
                <input
                  value={String(s[key as keyof SettingsRow] ?? "")}
                  onChange={(e) => setS({ ...s, [key]: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              )}
            </label>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Saqlash
          </button>
        </form>
      </div>

      <form
        onSubmit={saveStats}
        className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="font-semibold text-slate-900">Bosh sahifa statistikasi</h2>
        <p className="text-xs text-slate-500">
          Haqiqiy raqamlarni kiriting (marketing va ishonch uchun).
        </p>
        <label className="block text-sm">
          Arizalar soni
          <input
            type="number"
            min={0}
            value={st.applications_count}
            onChange={(e) => setSt({ ...st, applications_count: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Faol o‘quvchilar
          <input
            type="number"
            min={0}
            value={st.active_students_count}
            onChange={(e) => setSt({ ...st, active_students_count: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Jami o‘quvchilar (ko‘rsatish)
          <input
            type="number"
            min={0}
            value={st.students_count}
            onChange={(e) => setSt({ ...st, students_count: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Bitirganlar
          <input
            type="number"
            min={0}
            value={st.graduated_count}
            onChange={(e) => setSt({ ...st, graduated_count: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Ishga joylashganlar
          <input
            type="number"
            min={0}
            value={st.employed_count}
            onChange={(e) => setSt({ ...st, employed_count: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Statistikani saqlash
        </button>
      </form>
    </div>
  );
}
