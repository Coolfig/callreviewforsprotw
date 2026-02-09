import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Save, AlertTriangle, X } from "lucide-react";

interface ClipFormData {
  clip_title: string;
  start_seconds: number;
  end_seconds: number;
  notes: string;
  tags: string[];
}

interface ClipFormProps {
  startSeconds: number;
  endSeconds: number;
  editingClip?: { id: string; clip_title: string; start_seconds: number; end_seconds: number; notes: string | null; tags: string[] | null } | null;
  onSave: (data: ClipFormData) => void;
  onCancel?: () => void;
  saving?: boolean;
}

export default function ClipForm({ startSeconds, endSeconds, editingClip, onSave, onCancel, saving }: ClipFormProps) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (editingClip) {
      setTitle(editingClip.clip_title);
      setNotes(editingClip.notes || "");
      setTags(editingClip.tags || []);
    }
  }, [editingClip]);

  const duration = endSeconds - startSeconds;
  const isValid = title.trim() && endSeconds > startSeconds;

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput("");
  };

  const handleSubmit = () => {
    if (!isValid) return;
    onSave({
      clip_title: title.trim(),
      start_seconds: startSeconds,
      end_seconds: endSeconds,
      notes: notes.trim(),
      tags,
    });
    if (!editingClip) {
      setTitle("");
      setNotes("");
      setTags([]);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
      <h3 className="text-sm font-semibold text-foreground">
        {editingClip ? "Edit Clip" : "New Clip"}
      </h3>

      <div className="space-y-2">
        <Label htmlFor="clip-title">Clip Title *</Label>
        <Input id="clip-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Dez Bryant catch reversal" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Start (s)</Label>
          <div className="bg-secondary px-3 py-2 rounded-md text-sm font-mono">{startSeconds}</div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">End (s)</Label>
          <div className="bg-secondary px-3 py-2 rounded-md text-sm font-mono">{endSeconds}</div>
        </div>
      </div>

      {endSeconds <= startSeconds && startSeconds > 0 && (
        <p className="text-xs text-destructive">End must be after start.</p>
      )}

      {duration > 30 && (
        <div className="flex items-center gap-1 text-xs text-warning">
          <AlertTriangle className="h-3.5 w-3.5" />
          Clip is {duration}s — longer than recommended 30s
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="clip-notes">Notes</Label>
        <Textarea id="clip-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." rows={2} />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            placeholder="Add tag..."
            className="flex-1"
          />
          <Button variant="outline" size="sm" onClick={addTag} type="button">Add</Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((t) => (
              <Badge key={t} variant="secondary" className="gap-1">
                {t}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setTags(tags.filter((x) => x !== t))} />
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={!isValid || saving} className="flex-1">
          <Save className="h-4 w-4 mr-1" />
          {saving ? "Saving..." : editingClip ? "Update Clip" : "Save Clip"}
        </Button>
        {editingClip && onCancel && (
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        )}
      </div>
    </div>
  );
}
