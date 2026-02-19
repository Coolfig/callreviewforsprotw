
-- Add category_tags to rule_changes
ALTER TABLE public.rule_changes
  ADD COLUMN IF NOT EXISTS category_tags TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_rule_changes_category_tags
  ON public.rule_changes USING GIN(category_tags);
