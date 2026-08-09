import { sportsVideos, type SportVideo } from "@/data/sportsVideos";

/** URL-safe slug from arbitrary text. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Stable, human-readable slug for a play: title + id keeps it unique. */
export function getPlaySlug(video: Pick<SportVideo, "id" | "title">): string {
  return `${slugify(video.title)}-${video.id}`;
}

export function getPlayPath(video: Pick<SportVideo, "id" | "title">): string {
  return `/call/${getPlaySlug(video)}`;
}

export function findPlayBySlug(slug: string): SportVideo | undefined {
  return sportsVideos.find((v) => getPlaySlug(v) === slug || v.id === slug);
}
