"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const STORAGE_KEY = "tm_visitor_id";

export function VisitorTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let vid = localStorage.getItem(STORAGE_KEY);
    if (!vid) {
      vid = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, vid);
    }

    const pathParts = pathname.split("/").filter(Boolean);
    const package_slug =
      pathParts[0] === "paketlar" && pathParts[1] ? pathParts[1] : null;
    const course_slug =
      pathParts[0] === "kurslar" && pathParts[1] ? pathParts[1] : null;

    const body = {
      visitor_id: vid,
      page_path: pathname || "/",
      referrer_path: typeof document !== "undefined" ? document.referrer : "",
      package_slug,
      course_slug,
      utm_source: searchParams.get("utm_source") ?? "",
      utm_medium: searchParams.get("utm_medium") ?? "",
      utm_campaign: searchParams.get("utm_campaign") ?? "",
    };

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {});
  }, [pathname, searchParams]);

  return null;
}
