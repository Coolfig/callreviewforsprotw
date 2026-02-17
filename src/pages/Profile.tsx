import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit3, ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Header from "@/components/layout/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import refereeLogo from "@/assets/referee-logo.png";

interface ProfileData {
  username: string;
  bio: string;
  avatar_url: string;
  banner_url: string;
  favorite_teams: string[];
  created_at: string;
  user_id: string;
}

const teamLogos: Record<string, string> = {
  "Patriots": "🏈",
  "Eagles": "🦅",
  "Chiefs": "🏈",
  "Cowboys": "⭐",
  "49ers": "🏈",
  "Lakers": "🏀",
  "Celtics": "☘️",
  "Warriors": "🏀",
  "Heat": "🔥",
  "Bulls": "🐂",
  "Yankees": "⚾",
  "Dodgers": "⚾",
  "Red Sox": "⚾",
  "Cubs": "⚾",
  "Bruins": "🏒",
  "Penguins": "🐧",
  "Maple Leafs": "🍁",
  "Rangers": "🏒",
};

const Profile = () => {
  const { username: paramUsername } = useParams<{ username: string }>();
  const { user, username: authUsername } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editTeams, setEditTeams] = useState("");

  const isOwnProfile = user && profile?.user_id === user.id;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const targetUsername = paramUsername || authUsername;
      if (!targetUsername) { setLoading(false); return; }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", targetUsername)
        .single();

      if (data) {
        setProfile(data as ProfileData);
        setEditBio((data as ProfileData).bio || "");
        setEditTeams(((data as ProfileData).favorite_teams || []).join(", "));

        // Fetch follower counts
        const { count: followers } = await supabase
          .from("followers")
          .select("*", { count: "exact", head: true })
          .eq("following_id", data.user_id);
        setFollowersCount(followers || 0);

        const { count: following } = await supabase
          .from("followers")
          .select("*", { count: "exact", head: true })
          .eq("follower_id", data.user_id);
        setFollowingCount(following || 0);

        // Check if current user follows this profile
        if (user && data.user_id !== user.id) {
          const { data: followData } = await supabase
            .from("followers")
            .select("id")
            .eq("follower_id", user.id)
            .eq("following_id", data.user_id)
            .maybeSingle();
          setIsFollowing(!!followData);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [paramUsername, authUsername, user]);

  const handleFollow = async () => {
    if (!user || !profile) return;
    if (isFollowing) {
      await supabase.from("followers").delete()
        .eq("follower_id", user.id)
        .eq("following_id", profile.user_id);
      setIsFollowing(false);
      setFollowersCount((c) => c - 1);
    } else {
      await supabase.from("followers").insert({
        follower_id: user.id,
        following_id: profile.user_id,
      });
      setIsFollowing(true);
      setFollowersCount((c) => c + 1);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    const teams = editTeams.split(",").map((t) => t.trim()).filter(Boolean);
    await supabase
      .from("profiles")
      .update({ bio: editBio, favorite_teams: teams })
      .eq("user_id", user.id);
    setProfile((p) => p ? { ...p, bio: editBio, favorite_teams: teams } : p);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <img src={refereeLogo} alt="Loading" className="w-16 h-16 animate-pulse" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 text-center text-muted-foreground">Profile not found</div>
      </div>
    );
  }

  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto pt-16">
        {/* Back button */}
        <div className="flex items-center gap-4 px-4 py-3 sticky top-16 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold leading-tight">{profile.username}</h2>
            <p className="text-xs text-muted-foreground">0 posts</p>
          </div>
        </div>

        {/* Banner */}
        <div className="relative">
          <div className="h-48 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary overflow-hidden">
            {profile.banner_url ? (
              <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-secondary flex items-center justify-center">
                <img src={refereeLogo} alt="" className="w-20 h-20 opacity-10" />
              </div>
            )}
          </div>

          {/* Avatar overlapping banner */}
          <div className="absolute -bottom-16 left-4">
            <Avatar className="w-32 h-32 border-4 border-background">
              {profile.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.username} />
              ) : (
                <AvatarFallback className="bg-secondary text-3xl font-bold">
                  {profile.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
        </div>

        {/* Action button row */}
        <div className="flex justify-end px-4 pt-3">
          {isOwnProfile ? (
            <Button
              variant="outline"
              className="rounded-full font-semibold"
              onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
            >
              {isEditing ? "Save" : "Edit Profile"}
            </Button>
          ) : user ? (
            <Button
              variant={isFollowing ? "outline" : "default"}
              className="rounded-full font-semibold"
              onClick={handleFollow}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          ) : null}
        </div>

        {/* Profile info */}
        <div className="px-4 pt-8 pb-4">
          <h1 className="text-xl font-extrabold">{profile.username}</h1>
          <p className="text-muted-foreground text-sm">@{profile.username.toLowerCase()}</p>

          {/* Favorite teams */}
          {!isEditing && profile.favorite_teams && profile.favorite_teams.length > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {profile.favorite_teams.map((team) => (
                <span key={team} className="inline-flex items-center gap-1 text-sm bg-secondary px-2.5 py-1 rounded-full">
                  <span>{teamLogos[team] || "🏅"}</span>
                  <span className="text-secondary-foreground">{team}</span>
                </span>
              ))}
            </div>
          )}

          {/* Bio */}
          {isEditing ? (
            <div className="mt-3 space-y-3">
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Tell fans about yourself..."
                className="w-full bg-secondary rounded-lg p-3 text-sm text-foreground resize-none h-20 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                value={editTeams}
                onChange={(e) => setEditTeams(e.target.value)}
                placeholder="Favorite teams (comma separated): Patriots, Lakers, Yankees"
                className="w-full bg-secondary rounded-lg p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-relaxed">
              {profile.bio || (isOwnProfile ? "Add a bio to tell fans about yourself" : "")}
            </p>
          )}

          {/* Join date & stats */}
          <div className="flex items-center gap-1 text-muted-foreground text-sm mt-3">
            <Calendar className="w-4 h-4" />
            <span>Joined {joinDate}</span>
          </div>

          <div className="flex gap-4 mt-2 text-sm">
            <span>
              <strong className="text-foreground">{followingCount}</strong>{" "}
              <span className="text-muted-foreground">Following</span>
            </span>
            <span>
              <strong className="text-foreground">{followersCount}</strong>{" "}
              <span className="text-muted-foreground">Followers</span>
            </span>
          </div>
        </div>

        {/* Tabbed content */}
        <Tabs defaultValue="posts" className="border-t border-border/50">
          <TabsList className="w-full bg-transparent rounded-none h-12 p-0 border-b border-border/50">
            <TabsTrigger value="posts" className="flex-1 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary h-full">
              Posts
            </TabsTrigger>
            <TabsTrigger value="replies" className="flex-1 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary h-full">
              Replies
            </TabsTrigger>
            <TabsTrigger value="likes" className="flex-1 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary h-full">
              Likes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-0">
            <div className="py-16 text-center text-muted-foreground">
              <img src={refereeLogo} alt="" className="w-12 h-12 mx-auto opacity-20 mb-4" />
              <p className="font-semibold text-foreground">No posts yet</p>
              <p className="text-sm mt-1">When {isOwnProfile ? "you post" : `@${profile.username} posts`}, it'll show up here.</p>
            </div>
          </TabsContent>

          <TabsContent value="replies" className="mt-0">
            <div className="py-16 text-center text-muted-foreground">
              <p className="font-semibold text-foreground">No replies yet</p>
              <p className="text-sm mt-1">Replies to controversy threads will appear here.</p>
            </div>
          </TabsContent>

          <TabsContent value="likes" className="mt-0">
            <div className="py-16 text-center text-muted-foreground">
              <p className="font-semibold text-foreground">No likes yet</p>
              <p className="text-sm mt-1">Liked clips will show up here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
