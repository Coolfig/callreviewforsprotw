export type LeagueKey = "nfl" | "nba" | "nhl" | "mlb";
export type Verdict = "Correct" | "Missed" | "Questionable" | "50-50";

export interface KeyChange {
  title: string;
  summary: string;
  sourceUrl?: string;
}

export interface RelatedReview {
  title: string;
  url: string;
  tags: string[];
  verdict: Verdict;
  teams?: string;
  date?: string;
}

export interface QuickRef {
  rule: string;
  summary: string;
  sourceUrl?: string;
}

export interface YearData {
  year: number;
  /** Direct link to the official year-specific page or PDF on the league's own domain */
  officialUrl?: string;
  /** Preferred direct PDF from the official source (optional, nullable) */
  yearSpecificPdfUrl?: string;
  /**
   * Primary CDX-resolved archive.org snapshot URL for THIS exact year.
   * Use a specific Wayback timestamp URL: https://web.archive.org/web/{timestamp}/{url}
   */
  archivedYearUrl?: string;
  /** Archived PDF from archive.org (shown preferentially over archivedYearUrl) */
  archivedPdfUrl?: string;
  /**
   * Closest-available fallback from Wayback availability API.
   * Populated at runtime by the wayback-lookup edge function.
   */
  fallbackArchivedUrl?: string;
  /**
   * The URL to query the CDX API against when no archivedYearUrl is pre-seeded.
   * Defaults to the league's officialRulesUrl.
   */
  archiveTargetUrl?: string;
  keyChanges: KeyChange[];
  relatedReviews: RelatedReview[];
  quickRefs: QuickRef[];
}

export interface LeagueData {
  key: LeagueKey;
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  description: string;
  officialRulesUrl: string;
  ruleChangesUrl: string;
  years: Record<number, YearData>;
}

// ─── Helper to generate blank years ──────────────────────────────────────────
function blankYears(from = 2000, to = 2026): Record<number, YearData> {
  const out: Record<number, YearData> = {};
  for (let y = from; y <= to; y++) {
    out[y] = { year: y, keyChanges: [], relatedReviews: [], quickRefs: [] };
  }
  return out;
}

// ─── NFL ─────────────────────────────────────────────────────────────────────
const nflYears = blankYears();

Object.assign(nflYears[2014], {
  officialUrl: "https://operations.nfl.com/the-rules/nfl-rulebook/",
  yearSpecificPdfUrl: "https://operations.nfl.com/media/3047/2014-nfl-rulebook.pdf",
  archivedPdfUrl: "https://web.archive.org/web/20141201120000/https://operations.nfl.com/media/3047/2014-nfl-rulebook.pdf",
  archiveTargetUrl: "https://operations.nfl.com/media/3047/2014-nfl-rulebook.pdf",
  keyChanges: [
    { title: "Extra Point Distance Moved to 15-Yard Line", summary: "The NFL moved the extra-point attempt to the 15-yard line on a one-year experimental basis, making the kick a 33-yarder. Two-point conversions stayed at the 2-yard line.", sourceUrl: "https://operations.nfl.com/the-rules/rule-changes/" },
    { title: "Chop Blocks Restricted", summary: "Certain chop blocks in the open field were restricted to reduce lower-leg injuries to defenders.", sourceUrl: "https://operations.nfl.com/the-rules/rule-changes/" },
    { title: "Peel-Back Blocks Expanded", summary: "The prohibition on peel-back blocks was expanded to include all offensive players in motion.", sourceUrl: "https://operations.nfl.com/the-rules/rule-changes/" },
  ],
  quickRefs: [
    { rule: "Catch Rule (Rule 8-1-3)", summary: "A player must control the ball, get two feet or body part down, and perform a 'football act' to complete a catch.", sourceUrl: "https://operations.nfl.com/the-rules/nfl-rulebook/" },
    { rule: "Pass Interference", summary: "Contact beyond 5 yards of the line of scrimmage that restricts the receiver's ability to make the catch is illegal.", sourceUrl: "https://operations.nfl.com/the-rules/nfl-rulebook/" },
    { rule: "Replay Review Standard", summary: "A play is reversed only when there is clear and conclusive visual evidence to overturn the on-field ruling.", sourceUrl: "https://operations.nfl.com/the-rules/nfl-rulebook/" },
  ],
  relatedReviews: [
    { title: "Dez Bryant Catch/No-Catch – Cowboys vs Packers", url: "/feed", tags: ["catch rule", "replay"], verdict: "Questionable", teams: "DAL vs GB", date: "Jan 11, 2015" },
  ],
} as Partial<YearData>);

Object.assign(nflYears[2012], {
  officialUrl: "https://operations.nfl.com/the-rules/nfl-rulebook/",
  archivedYearUrl: "https://web.archive.org/web/20121101000000*/https://operations.nfl.com/the-rules/nfl-rulebook/",
  archiveTargetUrl: "https://operations.nfl.com/the-rules/nfl-rulebook/",
  keyChanges: [
    { title: "Horse-Collar Tackle – Expanded Coverage", summary: "The rule was expanded to apply when a defender grabs a runner inside the collar of the jersey at any area of the back or side.", sourceUrl: "https://operations.nfl.com/the-rules/rule-changes/" },
    { title: "Replacement Referees Season", summary: "The NFL used replacement officials at the start of the 2012 season due to a lockout, leading to the infamous 'Fail Mary' play.", sourceUrl: "https://operations.nfl.com/the-rules/rule-changes/" },
  ],
  quickRefs: [
    { rule: "Catch Rule", summary: "Control + two feet (or body part) + football act required.", sourceUrl: "https://operations.nfl.com/the-rules/nfl-rulebook/" },
    { rule: "Simultaneous Possession", summary: "When two opponents simultaneously hold the ball, possession is awarded to the player who first had it, or offense if truly simultaneous.", sourceUrl: "https://operations.nfl.com/the-rules/nfl-rulebook/" },
  ],
  relatedReviews: [
    { title: "The 'Fail Mary' – Seahawks vs Packers", url: "/feed", tags: ["simultaneous catch", "touchdown ruling"], verdict: "Missed", teams: "SEA vs GB", date: "Sep 24, 2012" },
  ],
} as Partial<YearData>);

Object.assign(nflYears[2019], {
  officialUrl: "https://operations.nfl.com/the-rules/nfl-rulebook/",
  archiveTargetUrl: "https://operations.nfl.com/the-rules/nfl-rulebook/",
  keyChanges: [
    { title: "Pass Interference Now Reviewable", summary: "For one season (2019), offensive and defensive pass interference became reviewable via instant replay challenge.", sourceUrl: "https://operations.nfl.com/the-rules/rule-changes/" },
    { title: "Helmet Rule Enforcement", summary: "Lowering the head to initiate contact with the helmet became a penalty for all players — offense and defense.", sourceUrl: "https://operations.nfl.com/the-rules/rule-changes/" },
    { title: "Overtime Rules Adjusted", summary: "Both teams guaranteed possession in OT if the first score is a field goal.", sourceUrl: "https://operations.nfl.com/the-rules/rule-changes/" },
  ],
  quickRefs: [
    { rule: "Pass Interference (Reviewable in 2019)", summary: "Coaches could challenge PI calls or non-calls in 2019 only — the rule was not renewed in 2020.", sourceUrl: "https://operations.nfl.com/the-rules/nfl-rulebook/" },
  ],
} as Partial<YearData>);

// ─── NBA ─────────────────────────────────────────────────────────────────────
const nbaYears = blankYears();

Object.assign(nbaYears[2002], {
  officialUrl: "https://official.nba.com/rulebook/",
  archiveTargetUrl: "https://official.nba.com/rulebook/",
  keyChanges: [
    { title: "Zone Defense Legalized", summary: "The NBA officially allowed zone defenses after banning them for decades; teams had previously used illegal defense rules that mandated man coverage.", sourceUrl: "https://official.nba.com/rule-changes/" },
  ],
  quickRefs: [
    { rule: "Defensive Three-Second Rule", summary: "A defensive player may not remain in the lane for more than 3 seconds unless actively guarding an opponent.", sourceUrl: "https://official.nba.com/rulebook/" },
    { rule: "Flagrant Foul Classifications", summary: "Flagrant 1: unnecessary contact. Flagrant 2: unnecessary and excessive contact — ejection required.", sourceUrl: "https://official.nba.com/rulebook/" },
  ],
} as Partial<YearData>);

Object.assign(nbaYears[2004], {
  officialUrl: "https://official.nba.com/rulebook/",
  archiveTargetUrl: "https://official.nba.com/rulebook/",
  keyChanges: [
    { title: "Hand-Check Rule Crackdown", summary: "Officials were instructed to call hand-checking fouls more aggressively on perimeter defenders, opening up the game for scorers.", sourceUrl: "https://official.nba.com/rule-changes/" },
    { title: "Malice at the Palace Rule Reforms", summary: "Following the brawl, the NBA strengthened its player conduct policies and altered security positioning.", sourceUrl: "https://official.nba.com/rule-changes/" },
  ],
} as Partial<YearData>);

Object.assign(nbaYears[2023], {
  officialUrl: "https://official.nba.com/rulebook/",
  archiveTargetUrl: "https://official.nba.com/rulebook/",
  keyChanges: [
    { title: "Take Foul Rule", summary: "A flagrant-1 equivalent penalty (one free throw + possession) is now assessed for transition take fouls, preventing 'tactical fouls' on fast breaks.", sourceUrl: "https://official.nba.com/rule-changes/" },
    { title: "Flopping Penalty Increased", summary: "Repeat floppers now face escalating fines throughout the regular season.", sourceUrl: "https://official.nba.com/rule-changes/" },
  ],
  quickRefs: [
    { rule: "Take Foul (2023+)", summary: "Defensive player commits a foul to stop a clear path fast break: 1 FT + possession awarded to offense.", sourceUrl: "https://official.nba.com/rulebook/" },
    { rule: "Challenge Rule", summary: "Each team gets one coach's challenge per game, used to challenge out-of-bounds, goaltending, or flagrant foul calls.", sourceUrl: "https://official.nba.com/rulebook/" },
  ],
} as Partial<YearData>);

// ─── NHL ─────────────────────────────────────────────────────────────────────
const nhlYears = blankYears();

Object.assign(nhlYears[2005], {
  officialUrl: "https://www.nhl.com/info/nhl-rulebook",
  archiveTargetUrl: "https://www.nhl.com/info/nhl-rulebook",
  keyChanges: [
    { title: "Shootout Introduced (Post-Lockout)", summary: "After the cancelled 2004-05 season, the NHL returned with major rule changes including the shootout to eliminate tie games.", sourceUrl: "https://www.nhl.com/info/nhl-rulebook" },
    { title: "Two-Line Pass Eliminated", summary: "The two-line pass rule was eliminated, dramatically opening up the game and allowing more offensive plays from deep in the defensive zone.", sourceUrl: "https://www.nhl.com/info/nhl-rulebook" },
    { title: "Tag-Up Offside Restored", summary: "Tag-up offside (players can 'tag up' at the blue line to negate offside) was restored after years without it.", sourceUrl: "https://www.nhl.com/info/nhl-rulebook" },
    { title: "Obstruction Crackdown", summary: "Officials were mandated to strictly call interference, hooking, and holding to open up the game.", sourceUrl: "https://www.nhl.com/info/nhl-rulebook" },
  ],
  quickRefs: [
    { rule: "Offside", summary: "Both skates must be over the blue line before the puck to be onside. Video review is used for close calls.", sourceUrl: "https://www.nhl.com/info/nhl-rulebook" },
    { rule: "Icing", summary: "A player shoots the puck from behind the center red line and it crosses the opposing goal line untouched — icing is called. The faceoff returns to the offending team's zone.", sourceUrl: "https://www.nhl.com/info/nhl-rulebook" },
  ],
} as Partial<YearData>);

Object.assign(nhlYears[2014], {
  officialUrl: "https://www.nhl.com/info/nhl-rulebook",
  archiveTargetUrl: "https://www.nhl.com/info/nhl-rulebook",
  keyChanges: [
    { title: "Coach's Challenge Precursor", summary: "Video reviews on goalie interference and offside were expanded, setting the stage for the Coach's Challenge introduced in 2015-16.", sourceUrl: "https://www.nhl.com/info/nhl-rulebook" },
  ],
} as Partial<YearData>);

// ─── MLB ─────────────────────────────────────────────────────────────────────
const mlbYears = blankYears();

Object.assign(mlbYears[2014], {
  officialUrl: "https://www.mlb.com/official-information/official-rules",
  archiveTargetUrl: "https://www.mlb.com/official-information/official-rules",
  keyChanges: [
    { title: "Instant Replay Expanded", summary: "MLB introduced expanded instant replay, allowing managers to challenge most fair/foul, safe/out, and boundary calls via a central replay office in New York.", sourceUrl: "https://www.mlb.com/official-information/official-rules" },
    { title: "Collision Rule at Home Plate", summary: "Rule 7.13 was added, prohibiting catchers from blocking home plate and runners from deliberately colliding with catchers.", sourceUrl: "https://www.mlb.com/official-information/official-rules" },
  ],
  quickRefs: [
    { rule: "Infield Fly Rule", summary: "A fair fly ball (not a bunt or line drive) that an infielder can catch with ordinary effort, with runners on first and second or bases loaded, and fewer than two outs — batter is automatically out.", sourceUrl: "https://www.mlb.com/official-information/official-rules" },
    { rule: "Manager Challenge", summary: "Each manager gets one challenge per game (additional if successful). Plays reviewed by MLB in New York.", sourceUrl: "https://www.mlb.com/official-information/official-rules" },
  ],
} as Partial<YearData>);

Object.assign(mlbYears[2023], {
  officialUrl: "https://www.mlb.com/official-information/official-rules",
  archiveTargetUrl: "https://www.mlb.com/official-information/official-rules",
  keyChanges: [
    { title: "Pitch Clock Introduced", summary: "A 15-second pitch clock (20 seconds with runners on base) was added to speed up games. Violation results in automatic ball (pitcher) or automatic strike (batter).", sourceUrl: "https://www.mlb.com/official-information/official-rules" },
    { title: "Shift Ban", summary: "Infield alignments now require two infielders on each side of second base when the pitch is thrown.", sourceUrl: "https://www.mlb.com/official-information/official-rules" },
    { title: "Larger Bases", summary: "Bases were increased from 15-inch to 18-inch squares to improve player safety and encourage stolen base attempts.", sourceUrl: "https://www.mlb.com/official-information/official-rules" },
  ],
  quickRefs: [
    { rule: "Pitch Clock", summary: "15 sec (bases empty) / 20 sec (runners on). Violation: automatic ball (pitcher) or automatic strike (batter).", sourceUrl: "https://www.mlb.com/official-information/official-rules" },
    { rule: "Shift Restriction", summary: "Must have 2 infielders on each side of 2B at pitch delivery. All 4 infielders must have both feet in infield dirt.", sourceUrl: "https://www.mlb.com/official-information/official-rules" },
  ],
} as Partial<YearData>);

// ─── League master data ───────────────────────────────────────────────────────
export const LEAGUES: Record<LeagueKey, LeagueData> = {
  nfl: {
    key: "nfl",
    name: "National Football League",
    shortName: "NFL",
    color: "text-primary",
    bgColor: "bg-primary/10",
    description: "Official NFL rulebooks from 2000–2026, including annual rule changes, enforcement directives, and officiating points of emphasis.",
    officialRulesUrl: "https://operations.nfl.com/the-rules/nfl-rulebook/",
    ruleChangesUrl: "https://operations.nfl.com/the-rules/rule-changes/",
    years: nflYears,
  },
  nba: {
    key: "nba",
    name: "National Basketball Association",
    shortName: "NBA",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    description: "NBA rulebooks and officiating guidelines from 2000–2026, covering everything from shot clock violations to flagrant foul standards.",
    officialRulesUrl: "https://official.nba.com/rulebook/",
    ruleChangesUrl: "https://official.nba.com/rule-changes/",
    years: nbaYears,
  },
  nhl: {
    key: "nhl",
    name: "National Hockey League",
    shortName: "NHL",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    description: "NHL rulebooks from 2000–2026, including major post-lockout changes, Coach's Challenge introduction, and video review expansions.",
    officialRulesUrl: "https://www.nhl.com/info/nhl-rulebook",
    ruleChangesUrl: "https://www.nhl.com/info/nhl-rulebook",
    years: nhlYears,
  },
  mlb: {
    key: "mlb",
    name: "Major League Baseball",
    shortName: "MLB",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    description: "MLB official rulebooks from 2000–2026, from expanded replay in 2014 to the pitch clock and shift ban era starting in 2023.",
    officialRulesUrl: "https://www.mlb.com/official-information/official-rules",
    ruleChangesUrl: "https://www.mlb.com/official-information/official-rules",
    years: mlbYears,
  },
};

export const YEARS = Array.from({ length: 27 }, (_, i) => 2000 + i);

export const LEAGUE_KEYS: LeagueKey[] = ["nfl", "nba", "nhl", "mlb"];

export const LEAGUE_EMOJIS: Record<LeagueKey, string> = {
  nfl: "🏈",
  nba: "🏀",
  nhl: "🏒",
  mlb: "⚾",
};

export function getLeague(key: string): LeagueData | null {
  return LEAGUES[key as LeagueKey] ?? null;
}

export function getYearData(league: LeagueData, year: number): YearData {
  return league.years[year] ?? { year, keyChanges: [], relatedReviews: [], quickRefs: [] };
}
