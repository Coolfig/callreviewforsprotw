import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import YouTubePlayer from "@/components/clipper/YouTubePlayer";
import ClipForm from "@/components/clipper/ClipForm";
import ClipList from "@/components/clipper/ClipList";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { extractYouTubeId, upsertVideo, saveClip, updateClip, deleteClip, fetchClipsForVideo } from "@/lib/api/clips";
import { Video, Loader2 } from "lucide-react";

export default function AdminClipper() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [urlInput, setUrlInput] = useState("");
  const [video, setVideo] = useState<{ id: string; youtube_id: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [startSec, setStartSec] = useState(0);
  const [endSec, setEndSec] = useState(0);
  const [previewRange, setPreviewRange] = useState<{ start: number; end: number } | null>(null);
  const [editingClip, setEditingClip] = useState<any>(null);

  const { data: clips = [], isLoading: clipsLoading } = useQuery({
    queryKey: ["clips", video?.id],
    queryFn: () => fetchClipsForVideo(video!.id),
    enabled: !!video?.id,
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) =>
      editingClip ? updateClip({ id: editingClip.id, ...data }) : saveClip({ video_id: video!.id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clips", video?.id] });
      setEditingClip(null);
      toast({ title: editingClip ? "Clip updated" : "Clip saved" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clips", video?.id] });
      toast({ title: "Clip deleted" });
    },
  });

  const loadVideo = async () => {
    const ytId = extractYouTubeId(urlInput.trim());
    if (!ytId) {
      toast({ title: "Invalid YouTube URL", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const v = await upsertVideo(urlInput.trim(), ytId);
      setVideo(v);
      setStartSec(0);
      setEndSec(0);
      setPreviewRange(null);
      setEditingClip(null);
    } catch (e: any) {
      toast({ title: "Error loading video", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = useCallback((start: number, end: number) => {
    setPreviewRange({ start, end });
    // Small delay to let state update, then trigger preview
    setTimeout(() => setPreviewRange({ start, end }), 50);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Video className="h-6 w-6 text-primary" />
          Clip Editor
        </h1>

        {/* URL Input */}
        <div className="flex gap-2 mb-6">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste YouTube URL (e.g. https://youtu.be/abc123)"
            onKeyDown={(e) => e.key === "Enter" && loadVideo()}
            className="flex-1"
          />
          <Button onClick={loadVideo} disabled={loading || !urlInput.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load Video"}
          </Button>
        </div>

        {video && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Player */}
            <div className="lg:col-span-3">
              <YouTubePlayer
                youtubeId={video.youtube_id}
                onSetStart={setStartSec}
                onSetEnd={setEndSec}
                previewRange={previewRange}
              />
            </div>

            {/* Right: Form + List */}
            <div className="lg:col-span-2 space-y-4 max-h-[80vh] overflow-y-auto">
              <ClipForm
                startSeconds={startSec}
                endSeconds={endSec}
                editingClip={editingClip}
                onSave={(data) => saveMutation.mutate(data)}
                onCancel={() => setEditingClip(null)}
                saving={saveMutation.isPending}
              />

              {clipsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ClipList
                  clips={clips}
                  onPreview={handlePreview}
                  onEdit={(clip) => {
                    setEditingClip(clip);
                    setStartSec(clip.start_seconds);
                    setEndSec(clip.end_seconds);
                  }}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              )}
            </div>
          </div>
        )}

        {!video && !loading && (
          <div className="text-center py-20 text-muted-foreground">
            <Video className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Paste a YouTube URL above to get started</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
