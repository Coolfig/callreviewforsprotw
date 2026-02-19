import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface WaybackResult {
  archivedYearUrl: string | null;
  fallbackArchivedUrl: string | null;
  source: "cdx" | "availability" | "none" | "preseeded" | "loading";
  loading: boolean;
}

/**
 * Resolves the best archive.org URL for a given league URL + year.
 * Priority:
 *   1. Pre-seeded archivedPdfUrl from data file
 *   2. Pre-seeded archivedYearUrl from data file
 *   3. CDX lookup via edge function (year-exact)
 *   4. Wayback availability fallback via edge function
 */
export function useWaybackArchive(opts: {
  archivedPdfUrl?: string;
  archivedYearUrl?: string;
  archiveTargetUrl?: string;
  officialRulesUrl: string;
  year: number;
}): WaybackResult {
  const { archivedPdfUrl, archivedYearUrl, archiveTargetUrl, officialRulesUrl, year } = opts;

  const [result, setResult] = useState<WaybackResult>({
    archivedYearUrl: null,
    fallbackArchivedUrl: null,
    source: "loading",
    loading: true,
  });

  useEffect(() => {
    // If we already have pre-seeded data, use it immediately — no network call needed.
    if (archivedPdfUrl || archivedYearUrl) {
      setResult({
        archivedYearUrl: archivedPdfUrl ?? archivedYearUrl ?? null,
        fallbackArchivedUrl: null,
        source: "preseeded",
        loading: false,
      });
      return;
    }

    // Otherwise fetch via the edge function
    const targetUrl = archiveTargetUrl ?? officialRulesUrl;
    let cancelled = false;

    setResult(r => ({ ...r, loading: true, source: "loading" }));

    supabase.functions
      .invoke("wayback-lookup", { body: { targetUrl, year } })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setResult({ archivedYearUrl: null, fallbackArchivedUrl: null, source: "none", loading: false });
          return;
        }
        setResult({
          archivedYearUrl: data.archivedYearUrl ?? null,
          fallbackArchivedUrl: data.fallbackArchivedUrl ?? null,
          source: data.source ?? "none",
          loading: false,
        });
      })
      .catch(() => {
        if (!cancelled)
          setResult({ archivedYearUrl: null, fallbackArchivedUrl: null, source: "none", loading: false });
      });

    return () => { cancelled = true; };
  }, [archivedPdfUrl, archivedYearUrl, archiveTargetUrl, officialRulesUrl, year]);

  return result;
}
