
-- Rule interpretation database: tables + indexes + trigger + RLS
CREATE TABLE public.rule_years (
  id                   UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league               TEXT NOT NULL CHECK (league IN ('nfl', 'nba', 'nhl', 'mlb')),
  year                 INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2026),
  overview_summary     TEXT,
  interpretation_notes TEXT,
  created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (league, year)
);

CREATE TABLE public.rule_changes (
  id              UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_year_id    UUID NOT NULL REFERENCES public.rule_years(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  what_changed    TEXT,
  previous_rule   TEXT,
  impact          TEXT,
  source_citation TEXT,
  source_url      TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.rule_related_reviews (
  id           UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_year_id UUID NOT NULL REFERENCES public.rule_years(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  url          TEXT NOT NULL,
  rule_tags    TEXT[] NOT NULL DEFAULT '{}',
  verdict      TEXT NOT NULL CHECK (verdict IN ('Correct', 'Missed', 'Questionable', '50-50')),
  teams        TEXT,
  review_date  TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_rule_years_league_year          ON public.rule_years(league, year);
CREATE INDEX idx_rule_changes_rule_year_id       ON public.rule_changes(rule_year_id, sort_order);
CREATE INDEX idx_rule_related_reviews_year_id    ON public.rule_related_reviews(rule_year_id, sort_order);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_rule_years_updated_at    BEFORE UPDATE ON public.rule_years    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_rule_changes_updated_at  BEFORE UPDATE ON public.rule_changes  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- RLS
ALTER TABLE public.rule_years           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rule_changes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rule_related_reviews ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public read rule_years"           ON public.rule_years           FOR SELECT USING (true);
CREATE POLICY "Public read rule_changes"         ON public.rule_changes         FOR SELECT USING (true);
CREATE POLICY "Public read rule_related_reviews" ON public.rule_related_reviews FOR SELECT USING (true);

-- Admin write (correct arg order: _user_id uuid, _role app_role)
CREATE POLICY "Admin insert rule_years"   ON public.rule_years   FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin update rule_years"   ON public.rule_years   FOR UPDATE USING     (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin delete rule_years"   ON public.rule_years   FOR DELETE USING     (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admin insert rule_changes" ON public.rule_changes FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin update rule_changes" ON public.rule_changes FOR UPDATE USING     (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin delete rule_changes" ON public.rule_changes FOR DELETE USING     (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admin insert rule_related_reviews" ON public.rule_related_reviews FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin update rule_related_reviews" ON public.rule_related_reviews FOR UPDATE USING     (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admin delete rule_related_reviews" ON public.rule_related_reviews FOR DELETE USING     (public.has_role(auth.uid(), 'admin'::public.app_role));
