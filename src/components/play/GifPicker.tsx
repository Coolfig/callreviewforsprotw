import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface GifPickerProps {
  onSelect: (url: string) => void;
}

const TENOR_KEY = "AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ";

const GifPicker = ({ onSelect }: GifPickerProps) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchGifs = async (query: string) => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const url = `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${TENOR_KEY}&client_key=callreview&limit=20`;
      const res = await fetch(url);
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      console.error("GIF search failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    setLoading(true);
    try {
      const url = `https://tenor.googleapis.com/v2/featured?key=${TENOR_KEY}&client_key=callreview&limit=20`;
      const res = await fetch(url);
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      console.error("GIF fetch failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2 bg-card border border-border rounded-xl p-3 max-h-72 overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") searchGifs(search); }}
          placeholder="Search GIFs…"
          className="flex-1 bg-secondary/50 border-none rounded-lg px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none"
          autoFocus
        />
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => searchGifs(search)}>Search</Button>
      </div>
      {results.length === 0 && !loading && (
        <button onClick={fetchTrending} className="text-xs text-primary hover:underline mb-2">Load trending GIFs</button>
      )}
      <div className="overflow-y-auto subtle-scroll flex-1">
        {loading ? (
          <p className="text-xs text-muted-foreground text-center py-4">Loading…</p>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {results.map((gif: any) => {
              const url = gif.media_formats?.tinygif?.url || gif.media_formats?.gif?.url || "";
              return (
                <button
                  key={gif.id}
                  onClick={() => onSelect(url)}
                  className="rounded overflow-hidden hover:opacity-80 transition-opacity"
                >
                  <img src={url} alt="" className="w-full h-20 object-cover" loading="lazy" />
                </button>
              );
            })}
          </div>
        )}
      </div>
      <p className="text-[9px] text-muted-foreground mt-1 text-right">Powered by Tenor</p>
    </div>
  );
};

export default GifPicker;
