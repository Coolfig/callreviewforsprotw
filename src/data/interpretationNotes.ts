/**
 * Static interpretation notes — bullet points on how officials applied rules each year.
 * Key format: "{league}-{year}" e.g. "nfl-2005"
 */

const notes: Record<string, string[]> = {};

// ── NFL ──────────────────────────────────────────────────────────────────────

notes["nfl-2000"] = [
  "Officials enforced strict helmet-to-helmet contact rules on defenseless receivers for the first time under new emphasis.",
  "Instant replay was reinstated on a three-year trial basis — officials could review scoring plays, turnovers, and boundary calls.",
  "Referees were instructed to more strictly police illegal contact beyond 5 yards on receivers.",
];

notes["nfl-2001"] = [
  "The 'Tuck Rule' was in full effect — officials ruled any forward arm motion as an incomplete pass even if the QB was pulling the ball back.",
  "Replay reviews focused heavily on possession calls and fumble/incomplete pass rulings.",
  "Defensive holding was called more frequently as the league sought to open up passing offenses.",
];

notes["nfl-2002"] = [
  "Officials applied the Tuck Rule prominently after the high-profile Patriots-Raiders playoff game the prior January.",
  "League realignment to 8 divisions brought new scheduling complexity but no rule application changes.",
  "Horse-collar tackles were not yet penalized — officials let several controversial takedowns go unflagged.",
];

notes["nfl-2003"] = [
  "Officials began enforcing illegal contact on receivers more aggressively following the Colts-Patriots AFC Championship.",
  "Pass interference was a major point of contention with several game-altering calls throughout the playoffs.",
  "Replay challenges became more commonly used by coaches, especially on close catch/no-catch rulings.",
];

notes["nfl-2004"] = [
  "The 'Ty Law Rule' emphasis began — officials cracked down on defensive backs making contact with receivers beyond 5 yards.",
  "This season saw a dramatic increase in passing stats as officials enforced illegal contact strictly.",
  "Officials consistently applied the 'going to the ground' catch rule, leading to several overturned receptions.",
];

notes["nfl-2005"] = [
  "Horse-collar tackles were penalized for the first time after Roy Williams' dangerous takedowns the previous season.",
  "Officials strictly enforced the new low-hit protection for quarterbacks in the pocket.",
  "The 'force out' rule was still in effect — officials awarded catches when receivers were pushed out of bounds.",
  "Replay reviews expanded and officials used them more frequently on scoring plays.",
];

notes["nfl-2006"] = [
  "Officials applied new protections for quarterbacks, penalizing hits to the head and neck area more consistently.",
  "The 'force out' rule continued — officials ruled catches complete when receivers were pushed out mid-air.",
  "Defensive pass interference calls increased as the league emphasized protecting receivers downfield.",
];

notes["nfl-2007"] = [
  "Officials began enforcing stricter personal foul penalties for hits on defenseless receivers.",
  "The replay system was used to review more close boundary calls than any previous season.",
  "Illegal contact beyond 5 yards was called at near-record rates, opening up the passing game.",
];

notes["nfl-2008"] = [
  "The 'force out' rule was eliminated — officials no longer awarded catches to receivers pushed out of bounds.",
  "This created several controversial incomplete pass rulings near sidelines that previously would have been catches.",
  "Officials emphasized protecting QBs with new rules against hitting the passer below the knees (Tom Brady rule).",
];

notes["nfl-2009"] = [
  "Officials enforced new protections for defenseless players, especially receivers going over the middle.",
  "Replay was used to overturn several high-profile touchdown calls, increasing scrutiny on the catch process.",
  "The 'going to the ground' catch rule led to multiple overturned receptions that appeared complete to the eye.",
];

notes["nfl-2010"] = [
  "The Calvin Johnson rule became the defining interpretation — officials enforced strict 'complete the process' requirements.",
  "Helmet-to-helmet hits drew automatic ejection discussion after several high-profile concussion-causing plays.",
  "Officials were directed to more strictly enforce defenseless receiver protections.",
];

notes["nfl-2011"] = [
  "Officials enforced stricter guidelines on kickoff returns after the kickoff was moved to the 35-yard line.",
  "Personal foul penalties for hits on defenseless receivers reached record levels.",
  "The lockout-shortened preseason led to some early-season inconsistencies in officiating standards.",
];

notes["nfl-2012"] = [
  "Replacement referees officiated the first three weeks, leading to the infamous 'Fail Mary' game in Week 3.",
  "After the Seahawks-Packers debacle, regular officials returned and immediately enforced tighter standards.",
  "The simultaneous possession rule was hotly debated — officials ruled TD for the offense on simultaneous catches.",
];

notes["nfl-2013"] = [
  "The Tuck Rule was officially abolished — officials now ruled arm-tuck fumbles as actual fumbles.",
  "Officials applied the 'going to the ground' catch rule in several controversial late-season games.",
  "Running back protection rules expanded with the new crown-of-helmet rule on ball carriers outside the tackle box.",
];

notes["nfl-2014"] = [
  "The Dez Bryant catch reversal became the most debated call of the season under the 'going to the ground' rule.",
  "Officials strictly applied the catch process — requiring receivers to maintain control through ground contact.",
  "Extra point distance was experimented with in preseason, previewing the 2015 change.",
];

notes["nfl-2015"] = [
  "Extra points moved to the 15-yard line — officials managed the new PAT distance and two-point conversion dynamics.",
  "The catch rule remained controversial with several overturned receptions generating national debate.",
  "Automatic ejection for flagrant hits was discussed but not yet formally implemented.",
];

notes["nfl-2016"] = [
  "Chop blocks were completely banned — officials flagged any below-the-waist blocks by a second blocker.",
  "Touchback on kickoffs moved to the 25-yard line, changing return dynamics officials had to manage.",
  "Celebration rules were slightly relaxed but officials still flagged group demonstrations.",
];

notes["nfl-2017"] = [
  "The Jesse James TD reversal reignited catch-rule fury — officials applied the 'surviving the ground' standard.",
  "Officials struggled with consistency on catch rulings throughout the season, fueling calls for rule changes.",
  "Ejection for targeted head hits was enforced, with officials given authority to eject for egregious contact.",
];

notes["nfl-2018"] = [
  "The catch rule was overhauled — officials now required control, two feet down, and a 'football move' or time enough to become a runner.",
  "The 'going to the ground' provision was effectively eliminated from the catch definition.",
  "The Saints no-call PI in the NFC Championship was the most consequential non-call of the modern era.",
  "Lowering-the-head-to-initiate-contact was penalized for the first time, creating confusion early in the season.",
];

notes["nfl-2019"] = [
  "Pass interference became reviewable via coach's challenge for the first time — officials rarely overturned calls.",
  "The PI review experiment was widely criticized as officials maintained original calls in the vast majority of challenges.",
  "Officials enforced the simplified catch rule more consistently, reducing catch/no-catch controversies.",
];

notes["nfl-2020"] = [
  "PI review was removed after one season — officials returned to the non-reviewable standard for pass interference.",
  "COVID protocols affected officiating logistics but rule application remained consistent.",
  "Officials enforced new taunting emphasis, leading to several controversial unsportsmanlike conduct flags.",
];

notes["nfl-2021"] = [
  "Taunting penalties were heavily enforced under new league emphasis, generating significant controversy.",
  "Officials applied stricter unnecessary roughness standards, particularly on QB hits.",
  "The spot-foul nature of defensive pass interference continued to create game-altering 40+ yard penalties.",
];

notes["nfl-2022"] = [
  "Officials applied new emergency procedures after the Damar Hamlin cardiac arrest incident.",
  "Roughing-the-passer calls were inconsistent, with several high-profile questionable flags on clean hits.",
  "Hip-drop tackles began drawing attention, though no formal penalty existed yet.",
];

notes["nfl-2023"] = [
  "The hip-drop tackle was banned — officials flagged any wrap-and-roll takedowns involving leg entanglement.",
  "Fair catch on kickoffs allowed for a touchback at the 25, dramatically changing return game officiating.",
  "Officials continued strict enforcement of taunting, though penalties decreased from the initial emphasis.",
];

notes["nfl-2024"] = [
  "New kickoff rules dramatically changed the formation — officials managed a completely redesigned kickoff play.",
  "Officials enforced dynamic kickoff rules requiring specific alignment and movement restrictions.",
  "Pass interference and defensive holding remained the most debated penalty categories.",
  "Several admitted referee errors on key playoff calls drew intense scrutiny.",
];

notes["nfl-2025"] = [
  "Officials applied second-year refinements to the dynamic kickoff, with fewer procedural penalties.",
  "Emphasis on protecting QBs continued with stricter roughing-the-passer enforcement.",
  "Replay assist expanded to help officials with objective calls like spot of the ball.",
];

notes["nfl-2026"] = [
  "Season in progress — officiating standards being established through early games.",
];

// ── NBA ──────────────────────────────────────────────────────────────────────

notes["nba-2000"] = [
  "Officials enforced zone defense restrictions — teams were penalized for illegal defense when leaving their man.",
  "Hand-checking was allowed, giving defenders significant physical advantage on the perimeter.",
  "Flagrant foul classifications were strictly applied to reduce dangerous contact.",
];

notes["nba-2001"] = [
  "Zone defense was legalized — officials stopped calling illegal defense and adapted to new defensive schemes.",
  "Hand-checking continued to be permitted, keeping scoring relatively low.",
  "Officials emphasized travel call consistency, though enforcement varied by crew.",
];

notes["nba-2002"] = [
  "Controversial officiating in Kings-Lakers Western Conference Finals drew intense scrutiny on foul calls.",
  "Officials were accused of home-court bias in playoff foul distribution.",
  "The league began examining officiating consistency more closely after public criticism.",
];

notes["nba-2003"] = [
  "Officials enforced stricter standards on hard fouls after several altercations during games.",
  "Zone defense was now fully integrated, and officials adapted charging/blocking foul calls accordingly.",
  "Three-second defensive violation was enforced to prevent camping in the lane.",
];

notes["nba-2004"] = [
  "The Malice at the Palace prompted massive changes — officials were empowered to eject players immediately for leaving the bench area.",
  "Technical foul standards were tightened significantly in the aftermath.",
  "Officials began ejecting players more quickly for confrontational behavior.",
];

notes["nba-2005"] = [
  "New dress code didn't affect on-court officiating, but the league's emphasis on professionalism extended to players' conduct.",
  "Hand-checking was banned — officials penalized defenders for using hands to impede ball handlers.",
  "This opened up perimeter play significantly and increased free throw rates.",
];

notes["nba-2006"] = [
  "Officials enforced the hand-checking ban strictly in its second year, leading to higher scoring averages.",
  "Flopping became more prevalent as officials struggled to distinguish real fouls from embellishment.",
  "The flagrant foul review system expanded to allow officials to review borderline plays via replay.",
];

notes["nba-2007"] = [
  "The Tim Donaghy scandal rocked officiating credibility — the league overhauled referee oversight.",
  "Officials were placed under closer scrutiny with new evaluation and monitoring systems.",
  "Traveling calls became a point of emphasis, though the 'gather step' remained loosely defined.",
];

notes["nba-2008"] = [
  "Post-Donaghy reforms included new ref training, rotation policies, and accountability measures.",
  "Officials enforced more consistent charge/block foul calls using the restricted area under the basket.",
  "Last-two-minute reports were introduced to increase officiating transparency.",
];

notes["nba-2009"] = [
  "Officials applied tighter restricted-area enforcement — charges inside the arc were consistently ruled blocking fouls.",
  "The gather step in transition was given more leeway, effectively allowing an extra step on drives.",
  "Replay review expanded to include out-of-bounds calls in the final two minutes.",
];

notes["nba-2010"] = [
  "Officials used replay more frequently for close game-ending calls, particularly on buzzer-beaters.",
  "Flopping was increasingly flagged, though no formal penalty existed yet.",
  "Technical fouls for complaining were called at high rates, drawing player criticism.",
];

notes["nba-2011"] = [
  "The lockout-shortened season affected officiating preparation, leading to early-season inconsistencies.",
  "Officials were directed to crack down on off-ball contact and holding.",
  "Charge/block calls in the restricted area became more consistent with video training.",
];

notes["nba-2012"] = [
  "The flopping fine system was introduced — officials reported suspected floppers for post-game review.",
  "Instant replay expanded to include block/charge reviews in restricted area situations.",
  "Officials enforced continuation rules more strictly, limiting and-one opportunities on delayed whistles.",
];

notes["nba-2013"] = [
  "Officials enforced new rules protecting shooters' landing space after several ankle injuries.",
  "The restricted area was used more consistently to determine charge vs. block on drives to the basket.",
  "Clear path fouls were called more frequently, rewarding fast-break opportunities.",
];

notes["nba-2014"] = [
  "Instant replay use expanded significantly — officials could review more play types in crunch time.",
  "Officials emphasized calling moving screens, though enforcement remained inconsistent.",
  "Hack-a-Shaq strategy was widely used, and officials had to manage intentional fouling carefully.",
];

notes["nba-2015"] = [
  "The league implemented the hostile-act review trigger — officials could stop play to review flagrant fouls via replay.",
  "Clear path foul criteria were refined to give officials clearer guidelines.",
  "Officials worked to reduce game length by limiting dead-ball replay reviews.",
];

notes["nba-2016"] = [
  "Intentional fouling of poor free-throw shooters away from the ball was penalized more strictly.",
  "Officials used replay review to correct out-of-bounds and shot-clock violations in close games.",
  "The travel/gather step interpretation continued to be loosely enforced, frustrating purists.",
];

notes["nba-2017"] = [
  "Officials adopted the 'freedom of movement' emphasis, cracking down on grabbing and holding off-ball.",
  "This led to a significant increase in foul calls early in the season before players adjusted.",
  "Replay center in Secaucus took over certain reviews, speeding up the review process.",
];

notes["nba-2018"] = [
  "Officials strictly enforced the new shot-clock reset to 14 seconds on offensive rebounds.",
  "The clear-path foul rule was simplified to reduce lengthy replay reviews.",
  "Officials cracked down on delay-of-game after made baskets, issuing warnings and technical fouls.",
];

notes["nba-2019"] = [
  "Coach's challenge was introduced — coaches could challenge one foul call per game using their timeout.",
  "Officials adjusted to the challenge system, with overturns occurring on about 45% of challenges.",
  "The bubble environment during COVID provided unique officiating conditions with no crowd noise.",
];

notes["nba-2020"] = [
  "The bubble playoffs featured officials working without crowd noise, leading to more consistent foul calls.",
  "Replay review was used extensively in the neutral-site environment.",
  "Officials enforced gathering rules more closely, reducing perceived extra steps on drives.",
];

notes["nba-2021"] = [
  "Non-basketball move foul-drawing tactics were penalized — officials stopped rewarding unnatural motions to draw fouls.",
  "Rip-through moves, jumping into defenders, and abrupt stops were no longer called as shooting fouls.",
  "Free throw rates dropped significantly as officials enforced the new emphasis.",
];

notes["nba-2022"] = [
  "Officials continued the non-basketball move emphasis, with foul-drawing attempts declining further.",
  "Take foul rules were implemented — transition fouls without play on the ball gave the offense free throws plus possession.",
  "Flopping was fined more aggressively through the post-game review process.",
];

notes["nba-2023"] = [
  "Officials applied the take foul rule consistently in its second year, discouraging lazy transition fouls.",
  "The coach's challenge success rate improved as officials and coaches both adapted.",
  "In-Season Tournament games had unique rules officials had to manage, including overtime target scores.",
];

notes["nba-2024"] = [
  "Officials managed expanded coach's challenge scenarios, including out-of-bounds and goaltending reviews.",
  "Non-basketball move emphasis remained, and scoring efficiency stayed high with fewer gimmick fouls.",
  "Replay review times decreased as the Secaucus replay center handled more decisions remotely.",
];

notes["nba-2025"] = [
  "Officials apply continued emphasis on freedom of movement and take-foul enforcement.",
  "Coach's challenges expanded further in scope.",
];

notes["nba-2026"] = [
  "Season in progress — officiating standards being established through early games.",
];

// ── NHL ──────────────────────────────────────────────────────────────────────

notes["nhl-2000"] = [
  "Obstruction was rampant — officials allowed hooking, holding, and interference that slowed the game dramatically.",
  "Goaltender interference calls were inconsistent, varying heavily by crew.",
  "Fighting was still frequently permitted with standard 5-minute major penalties.",
];

notes["nhl-2001"] = [
  "Officials continued to allow significant clutching and grabbing, keeping scoring low.",
  "The trapezoid behind the net did not yet exist — goalies played the puck freely.",
  "Replay was limited to goal/no-goal decisions only.",
];

notes["nhl-2002"] = [
  "Obstruction penalties remained loosely enforced despite growing criticism about low-scoring games.",
  "Officials called goaltender interference inconsistently, a problem that would persist for years.",
  "Fighting penalties were standard with little supplemental discipline for most bouts.",
];

notes["nhl-2003"] = [
  "The dead puck era continued — officials allowed defensive clutching that suppressed scoring.",
  "Two-line pass rule remained in effect, limiting offensive breakout speed.",
  "Icing rules remained touch-icing, creating dangerous races to the puck.",
];

notes["nhl-2004"] = [
  "The lockout season (2004-05) led to massive rule changes for the following year.",
  "Prior to the lockout, officials enforced the same loose obstruction standards.",
  "The league used the break to develop comprehensive officiating reforms.",
];

notes["nhl-2005"] = [
  "Post-lockout, officials dramatically increased obstruction penalties — hooking, holding, and interference were called at record rates.",
  "The two-line pass rule was eliminated, opening up the ice.",
  "Goaltender trapezoid was introduced — officials penalized goalies playing the puck outside restricted areas.",
  "Shootouts were introduced to decide tied games after overtime.",
];

notes["nhl-2006"] = [
  "Officials maintained strict obstruction enforcement in the second post-lockout year.",
  "Power play opportunities remained elevated as players adjusted to the new standard.",
  "The salary cap era began affecting roster construction but not on-ice rule application.",
];

notes["nhl-2007"] = [
  "Obstruction enforcement began to ease slightly as officials found a middle ground.",
  "Goaltender interference remained the most inconsistently called penalty in the league.",
  "Instigator penalties were called more frequently to reduce fighting.",
];

notes["nhl-2008"] = [
  "Officials enforced stricter head-contact rules following several high-profile concussions.",
  "Boarding and charging penalties increased as the league prioritized player safety.",
  "Video review was limited to goal calls — coaches had no challenge system.",
];

notes["nhl-2009"] = [
  "Officials applied tighter standards on hits to the head, though no automatic penalty existed yet.",
  "Diving/embellishment was penalized when officials caught obvious flops.",
  "Icing remained touch-icing, with several dangerous collisions occurring.",
];

notes["nhl-2010"] = [
  "The NHL cracked down on blindside hits to the head with new Rule 48.",
  "Officials could now penalize lateral and blindside head contact regardless of intent.",
  "Goaltender interference challenges did not yet exist — officials made final calls on the ice.",
];

notes["nhl-2011"] = [
  "Rule 48 (blindside hits) was enforced aggressively following the Zdeno Chara hit on Max Pacioretty.",
  "Officials applied stricter boarding penalties to reduce dangerous collisions at the boards.",
  "Goaltender interference remained subjective and inconsistent across different crews.",
];

notes["nhl-2012"] = [
  "The lockout-shortened season affected officiating preparation.",
  "Officials enforced Rule 48 more consistently in the condensed schedule.",
  "Hybrid icing was not yet in place — touch icing continued.",
];

notes["nhl-2013"] = [
  "Hybrid icing was introduced — officials blew play dead when a defending player reached the faceoff dots first.",
  "This eliminated dangerous foot-races to the puck on icing calls.",
  "Officials applied the new icing standard consistently from the start.",
];

notes["nhl-2014"] = [
  "Coach's challenge was introduced for goaltender interference and offside reviews on goals.",
  "Officials adapted to having their calls reviewed, with several high-profile overturns.",
  "The challenge system revealed how inconsistent goaltender interference calls had been.",
];

notes["nhl-2015"] = [
  "Goaltender interference challenges became the most controversial aspect of the challenge system.",
  "Officials struggled with the subjective 'incidental contact' standard on crease plays.",
  "3-on-3 overtime was introduced, creating new officiating dynamics in the extra period.",
];

notes["nhl-2016"] = [
  "Officials applied stricter slashing penalties, particularly on two-handed slashes to the hands and wrists.",
  "This emphasis dramatically reduced hand injuries and increased power play opportunities.",
  "Goaltender interference challenges continued to produce inconsistent results.",
];

notes["nhl-2017"] = [
  "The slashing emphasis continued strongly in its second year.",
  "Officials called more tripping penalties to complement the slashing crackdown.",
  "Video review expanded to include offside challenges on goals, creating several controversial reversals.",
];

notes["nhl-2018"] = [
  "Officials managed new rules allowing challenges on missed double-minor high-sticking penalties.",
  "Goaltender interference rulings from the Situation Room in Toronto remained wildly inconsistent.",
  "The offside challenge was refined to reduce ticky-tack millimeter reversals.",
];

notes["nhl-2019"] = [
  "Officials enforced a new rule allowing the Situation Room to review major penalties.",
  "The hand pass in OT of a playoff game (Sharks-Blues) exposed gaps in reviewable play types.",
  "Goaltender interference challenges were slightly more consistent but remained controversial.",
];

notes["nhl-2020"] = [
  "Bubble playoffs in Edmonton and Toronto featured officiating without crowd influence.",
  "Officials called fewer penalties overall in the playoff bubble environment.",
  "The coaching challenge penalty (loss of timeout) was adjusted to reduce frivolous challenges.",
];

notes["nhl-2021"] = [
  "Cross-checking penalties were called at much higher rates under new enforcement emphasis.",
  "Officials targeted cross-checks in front of the net that had been ignored for years.",
  "This emphasis significantly changed net-front battles and power play rates.",
];

notes["nhl-2022"] = [
  "Cross-checking enforcement continued from the prior year at slightly reduced rates.",
  "Officials managed the challenge system with minor tweaks to offside review standards.",
  "Boarding and checking-from-behind penalties were called more frequently for safety.",
];

notes["nhl-2023"] = [
  "Officials enforced stricter penalties on hits from behind and dangerous boarding.",
  "Goaltender interference reviews were streamlined with clearer guidelines from the league.",
  "Net-front cross-checking continued to be penalized at elevated rates.",
];

notes["nhl-2024"] = [
  "Officials applied updated standards on incidental goaltender contact during scramble plays.",
  "The challenge system was refined to speed up reviews and reduce delays.",
  "Player safety emphasis continued with stricter enforcement on dangerous hits.",
];

notes["nhl-2025"] = [
  "Officials enforce continued emphasis on cross-checking and player safety hits.",
  "Goaltender interference review standards were further clarified.",
];

notes["nhl-2026"] = [
  "Season in progress — officiating standards being established through early games.",
];

// ── MLB ──────────────────────────────────────────────────────────────────────

notes["mlb-2000"] = [
  "Officials called a wide strike zone, favoring pitchers in what was still the 'steroid era.'",
  "Umpires had significant individual strike zone variation with no electronic monitoring.",
  "Replay review did not exist — all calls were final on the field.",
];

notes["mlb-2001"] = [
  "MLB directed umpires to enforce the 'high strike' more consistently, raising the top of the zone.",
  "Individual umpire strike zones continued to vary significantly from game to game.",
  "Home run boundary calls were the only plays reviewable, and only in postseason.",
];

notes["mlb-2002"] = [
  "The All-Star Game tie controversy highlighted officiating preparedness issues.",
  "Umpires continued with individual strike zone interpretation with little standardization.",
  "Balk calls were enforced inconsistently, particularly on deceptive pickoff moves.",
];

notes["mlb-2003"] = [
  "Umpires applied the rulebook strike zone more closely, though individual variation persisted.",
  "Interference and obstruction calls on baserunning plays were frequent topics of debate.",
  "No replay expansion — all safe/out calls remained final on the field.",
];

notes["mlb-2004"] = [
  "Steroid era scrutiny increased, but on-field rule application remained largely unchanged.",
  "Umpires continued to have wide discretion on the strike zone with no technology oversight.",
  "Trapped-ball vs. catch calls on diving plays were a recurring controversy.",
];

notes["mlb-2005"] = [
  "Home plate collision rules did not exist — umpires allowed violent collisions at the plate.",
  "The strike zone remained umpire-dependent with significant variation by crew.",
  "Fair/foul calls down the lines had no replay review and created several controversies.",
];

notes["mlb-2006"] = [
  "Umpires enforced balk rules more consistently after several high-profile missed calls.",
  "Neighborhood play at second base was accepted — middle infielders didn't need to touch the bag on double plays.",
  "No expansion of replay review occurred.",
];

notes["mlb-2007"] = [
  "Umpires applied the check-swing rule inconsistently — appeals to base umpires produced varying results.",
  "Strike zone consistency became a growing fan and media concern.",
  "Home run reviews were the only replay use, and only in limited circumstances.",
];

notes["mlb-2008"] = [
  "Instant replay was introduced for home run boundary calls — umpires could review fair/foul and whether a ball left the park.",
  "This was the first significant replay expansion in MLB history.",
  "All other calls remained unreviewable, including trapped balls and tag plays.",
];

notes["mlb-2009"] = [
  "Replay for home run calls was used more frequently in its second year.",
  "Umpires applied the infield fly rule in standard situations, though it would become controversial in later years.",
  "Tag play and safe/out calls at bases remained unreviewable despite several blown calls.",
];

notes["mlb-2010"] = [
  "Armando Galarraga's imperfect game (blown call by Jim Joyce) became the catalyst for replay expansion.",
  "The incident generated massive pressure on MLB to adopt broader instant replay.",
  "Umpires still had no mechanism to correct obvious errors beyond home run calls.",
];

notes["mlb-2011"] = [
  "Umpires applied the infield fly rule controversially in the NL Wild Card game (Braves vs. Cardinals).",
  "The play generated enormous debate about when infield fly should be called with runners on base.",
  "Pressure for expanded replay continued to build.",
];

notes["mlb-2012"] = [
  "The infield fly controversy in the Braves-Cardinals Wild Card game dominated rule discussions.",
  "Umpires were directed to call the infield fly rule more proactively on pop-ups with runners on.",
  "Expanded replay remained under discussion but was not yet implemented.",
];

notes["mlb-2013"] = [
  "Umpires prepared for the incoming expanded replay system announced for 2014.",
  "Home plate collisions remained legal but drew increasing safety concerns.",
  "Transfer rules on catches were loosely defined, leading to dropped-ball-on-transfer controversies.",
];

notes["mlb-2014"] = [
  "Expanded instant replay launched — managers could challenge safe/out, fair/foul, catch/trap, and other objective calls.",
  "Umpires adapted to having their calls reviewed, with significant overturns on tag plays.",
  "Home plate collision rule (Buster Posey rule) was introduced, banning catchers from blocking the plate.",
  "The neighborhood play at second base was still not reviewable.",
];

notes["mlb-2015"] = [
  "Replay challenges became a standard part of the game — managers used them strategically.",
  "Umpires adjusted to the pace-of-play push with between-inning timing enforced.",
  "The transfer rule was clarified — a ball dropped during the transfer from glove to hand was still a catch.",
];

notes["mlb-2016"] = [
  "The neighborhood play was eliminated via replay — middle infielders now had to touch second base on double plays.",
  "Chase Utley slide rule was enforced — runners had to slide directly into the base, not the fielder.",
  "These changes significantly altered how umpires officiated double-play situations.",
];

notes["mlb-2017"] = [
  "Umpires applied stricter rules on intentional walks — a simple dugout signal replaced four pitches.",
  "Replay review times were shortened with a 2-minute limit on most reviews.",
  "Strike zone robot (ABS) technology was tested in minor leagues.",
];

notes["mlb-2018"] = [
  "Umpires enforced new restrictions on mound visits, limiting non-pitching-change visits to six per game.",
  "Pace-of-play initiatives affected umpire timing between innings.",
  "The automated ball-strike system continued testing in the minors.",
];

notes["mlb-2019"] = [
  "Umpires managed three-batter minimum for relievers (implemented mid-discussion, effective 2020).",
  "Replay review continued to be refined with shorter review times.",
  "Robot umpires were tested in the Atlantic League, though not in MLB games.",
];

notes["mlb-2020"] = [
  "COVID rules introduced the runner-on-second extra-innings rule — umpires managed the new ghost runner.",
  "Universal DH was temporarily adopted, removing double-switch strategy umpires managed.",
  "Seven-inning doubleheaders changed game management dynamics.",
];

notes["mlb-2021"] = [
  "Umpires enforced new sticky substance checks on pitchers — mandatory glove and cap inspections between innings.",
  "Foreign substance enforcement dramatically changed pitching performance mid-season.",
  "The runner-on-second rule continued in extra innings.",
];

notes["mlb-2022"] = [
  "Umpires managed the final season before pitch clock implementation.",
  "Shift restrictions were announced for 2023 but not yet enforced.",
  "The runner-on-second rule became permanent for extra innings.",
];

notes["mlb-2023"] = [
  "The pitch clock was enforced — umpires called automatic balls and strikes for timer violations.",
  "Shift restrictions required two infielders on each side of second base.",
  "Bigger bases (18 inches) were introduced, and umpires managed new pickoff/disengagement limits.",
  "Game times dropped dramatically as umpires enforced clock rules strictly.",
];

notes["mlb-2024"] = [
  "Pitch clock enforcement continued in its second year with fewer violations as players adapted.",
  "Umpires applied the new slide rules and base-size adjustments consistently.",
  "Robot umpire testing expanded to Triple-A, with potential MLB implementation discussed.",
];

notes["mlb-2025"] = [
  "Umpires apply pitch clock and shift rules with increased consistency.",
  "Automated ball-strike system testing continues in the minor leagues.",
];

notes["mlb-2026"] = [
  "Season in progress — officiating standards being established through early games.",
];

export function getInterpretationNotes(league: string, year: number): string[] {
  const key = `${league.toLowerCase()}-${year}`;
  return notes[key] ?? [];
}
