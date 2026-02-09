import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pencil, Trash2 } from "lucide-react";

interface Clip {
  id: string;
  clip_title: string;
  start_seconds: number;
  end_seconds: number;
  notes: string | null;
  tags: string[] | null;
}

interface ClipListProps {
  clips: Clip[];
  onPreview: (start: number, end: number) => void;
  onEdit: (clip: Clip) => void;
  onDelete: (id: string) => void;
}

function formatRange(start: number, end: number) {
  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  return `${fmt(start)} – ${fmt(end)} (${end - start}s)`;
}

export default function ClipList({ clips, onPreview, onEdit, onDelete }: ClipListProps) {
  if (!clips.length) {
    return <p className="text-sm text-muted-foreground py-4 text-center">No clips yet. Use the form above to create one.</p>;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">Saved Clips ({clips.length})</h3>
      {clips.map((clip) => (
        <div key={clip.id} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg border border-border/50 group">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{clip.clip_title}</p>
            <p className="text-xs text-muted-foreground font-mono">{formatRange(clip.start_seconds, clip.end_seconds)}</p>
            {clip.tags && clip.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {clip.tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0">{t}</Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onPreview(clip.start_seconds, clip.end_seconds)}>
              <Play className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(clip)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(clip.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
