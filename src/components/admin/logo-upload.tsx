"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { upsertSettings } from "@/lib/actions/crm";
import { Loader2, Upload } from "lucide-react";

type Props = {
  currentUrl: string;
};

export function LogoUpload({ currentUrl }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(currentUrl);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Fayl hajmi 5 MB dan oshmasin");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Avval tizimga kiring");
        return;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const safe = ext.replace(/[^a-z0-9]/g, "") || "png";
      const path = `${user.id}/${Date.now()}.${safe}`;
      const { error: upErr } = await supabase.storage.from("logos").upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("logos").getPublicUrl(path);
      const publicUrl = data.publicUrl;
      await upsertSettings({ logo_url: publicUrl });
      setPreview(publicUrl);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Yuklashda xato");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-slate-900">Logo</p>
      <p className="mt-1 text-xs text-slate-500">
        PNG, JPG, WebP, SVG (max 5 MB). Sayt boshqaruvi va kirish sahifasida chiqadi.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex h-16 min-w-[120px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4">
          {preview ? (
            <Image
              src={preview}
              alt="Logo"
              width={160}
              height={48}
              className="max-h-12 w-auto object-contain"
            />
          ) : (
            <span className="text-sm font-semibold text-slate-400">Texno Markaz</span>
          )}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Yuklash
          <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={loading} />
        </label>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {preview && (
        <p className="mt-3 break-all text-xs text-slate-500">{preview}</p>
      )}
    </div>
  );
}
