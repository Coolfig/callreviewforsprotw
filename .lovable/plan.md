

## Plan: Update Video Embeds and Remove Two Plays

### Changes to `src/data/sportsVideos.ts`

**1. Update Tuck Rule (id "2")**
- Change `embedUrl` from `"https://www.youtube.com/embed/Kl_VvJTyMwo"` to `"https://www.youtube.com/embed/Kl_VvJTyMwo?start=65"`
- Change `videoSource` to `"youtube"` (already is)

**2. Update Dez Bryant (id "4")**
- Change from native video (`videoUrl: "/videos/dez-bryant-catch.mp4"`, `videoSource: "native"`) to YouTube embed
- Set `embedUrl: "https://www.youtube.com/embed/1khK6is-Bfs?start=65"`
- Set `videoSource: "youtube"`
- Remove `videoUrl` field

**3. Update Jesse James (id "16")**
- Change `embedUrl` from `"https://www.youtube.com/embed/_jcM2E72ZzI"` to `"https://www.youtube.com/embed/_jcM2E72ZzI?start=90"`

**4. Remove two plays entirely**
- Remove id "9" — "Ravens Long Snapper Controversial Rule Application"
- Remove id "11" — "Week 15 Bad Spot Ruled First Down Incorrectly"

### No other files need changes
All video rendering goes through the existing `sportsVideos` array, so removing entries from the array removes them from the feed, search, and all other views automatically.

