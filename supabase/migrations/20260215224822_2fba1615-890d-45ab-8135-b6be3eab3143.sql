
-- Rules table for structured rule indexing
CREATE TABLE public.rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id TEXT NOT NULL UNIQUE, -- e.g. NFL-3-2-7
  league TEXT NOT NULL,
  rule_number TEXT NOT NULL, -- e.g. "Rule 3, Section 2, Article 7"
  title TEXT NOT NULL,
  plain_english_summary TEXT NOT NULL,
  official_text TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  example_play_ids TEXT[] NOT NULL DEFAULT '{}',
  season TEXT, -- which season/year this rule version applies to
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rules"
ON public.rules FOR SELECT USING (true);

CREATE INDEX idx_rules_league ON public.rules(league);
CREATE INDEX idx_rules_tags ON public.rules USING GIN(tags);
CREATE INDEX idx_rules_rule_id ON public.rules(rule_id);
