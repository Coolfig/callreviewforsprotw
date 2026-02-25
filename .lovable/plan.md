## Plan: Update Tuck Rule Game and dez bryant catch Video Embeds replace the two videos with the the newly provided embeeded section

The user provided two YouTube embeds for the Tuck Rule Game, both starting at the 65-second mark where the actual play happens:

1. `Kl_VvJTyMwo?start=65` (original video, now with precise timestamp)
2. `1khK6is-Bfs?start=65` (alternate angle/clip)

**Current state:** Line 108 has `embedUrl: "https://www.youtube.com/embed/Kl_VvJTyMwo"` — no timestamp.

**Changes:**

### `src/data/sportsVideos.ts` (line 108)

- Update the `embedUrl` to include the `?start=65` timestamp parameter so the video starts at the exact moment of the controversial play instead of the beginning of the full clip.
- The second video (`1khK6is-Bfs?start=65`) can be noted but the current data model only supports a single `embedUrl` per entry. I'll update to the first video with the timestamp, since it's the primary clip already in use.

This is a single-line change. 

add this:**Patriots-Steelers Jesse James Catch Reversal**

Jesse James appeared to score a game-winning touchdown, but the catch was reversed under the 'going to the ground' rule, echoing the Dez Bryant controversy.

**Patriots vs Steelers**·Q4 - Potential Game-Winning TD

<iframe width="560" height="315" src="[https://www.youtube.com/embed/_jcM2E72ZzI?si=onbRLKLu_lNHtBcP&amp;start=90](https://www.youtube.com/embed/_jcM2E72ZzI?si=onbRLKLu_lNHtBcP&amp;start=90)" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

take this out of the website **avens Long Snapper Controversial Rule Application**

A bizarre and controversial application of rules involving the long snapper that caught everyone off guard.

**Ravens**·Special Teams Controversy

take this out of the website **Week 15 Bad Spot Ruled First Down Incorrectly**

A clearly incorrect first-down spot that wasn't challenged, giving the offense an undeserved new set of downs.

**Week 15 Game**·Week 15 - Bad Spot