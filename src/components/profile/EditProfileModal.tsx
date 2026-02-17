import { useState, useRef } from "react";
import { X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile: {
    username: string;
    bio: string | null;
    avatar_url: string | null;
    banner_url: string | null;
    favorite_teams: string[] | null;
  };
  onSaved: () => void;
}

const EditProfileModal = ({ open, onClose, profile, onSaved }: EditProfileModalProps) => {
  const { user } = useAuth();
  const [bio, setBio] = useState(profile.bio || "");
  const [teams, setTeams] = useState((profile.favorite_teams || []).join(", "));
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url || "");
  const [bannerPreview, setBannerPreview] = useState(profile.banner_url || "");
  const [saving, setSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File, bucket: string) => {
    if (!user) return null;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) return null;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    const url = await uploadFile(file, "avatars");
    if (url) setAvatarPreview(url);
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerPreview(URL.createObjectURL(file));
    const url = await uploadFile(file, "banners");
    if (url) setBannerPreview(url);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const teamsArr = teams.split(",").map((t) => t.trim()).filter(Boolean);
    await supabase.from("profiles").update({
      bio,
      favorite_teams: teamsArr,
      avatar_url: avatarPreview || null,
      banner_url: bannerPreview || null,
    }).eq("user_id", user.id);
    setSaving(false);
    onSaved();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg mx-4 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-lg">Edit profile</h2>
          </div>
          <Button size="sm" className="rounded-full font-semibold px-5" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>

        {/* Banner */}
        <div className="relative h-40 bg-secondary cursor-pointer" onClick={() => bannerInputRef.current?.click()}>
          {bannerPreview ? (
            <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary" />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-background/30 opacity-0 hover:opacity-100 transition-opacity">
            <Camera className="w-6 h-6 text-foreground" />
          </div>
          <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
        </div>

        {/* Avatar */}
        <div className="px-4 -mt-12 relative z-10">
          <div className="relative w-24 h-24 cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
            <Avatar className="w-24 h-24 border-4 border-card">
              {avatarPreview ? <AvatarImage src={avatarPreview} /> : null}
              <AvatarFallback className="bg-secondary text-2xl font-bold">
                {profile.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center bg-background/40 rounded-full opacity-0 hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-foreground" />
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
        </div>

        {/* Fields */}
        <div className="px-4 py-4 space-y-4">
          <div className="border border-border/50 rounded-lg p-3">
            <label className="text-xs text-primary font-medium">Name</label>
            <p className="text-sm text-foreground mt-0.5">{profile.username}</p>
          </div>
          <div className="border border-border/50 rounded-lg p-3">
            <label className="text-xs text-primary font-medium">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell fans about yourself..."
              className="w-full bg-transparent text-sm text-foreground resize-none mt-0.5 outline-none min-h-[60px]"
            />
          </div>
          <div className="border border-border/50 rounded-lg p-3">
            <label className="text-xs text-primary font-medium">Favorite Teams</label>
            <input
              value={teams}
              onChange={(e) => setTeams(e.target.value)}
              placeholder="Patriots, Lakers, Yankees"
              className="w-full bg-transparent text-sm text-foreground mt-0.5 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
