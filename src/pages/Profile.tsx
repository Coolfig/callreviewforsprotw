import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Header from "@/components/layout/Header";
import EditProfileModal from "@/components/profile/EditProfileModal";
import PostItem from "@/components/post/PostItem";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import refereeLogo from "@/assets/referee-logo.png";

interface ProfileData {
  username: string;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  favorite_teams: string[] | null;
  created_at: string;
  user_id: string;
}

const teamLogos: Record<string, string> = {
  "Patriots": "🏈", "Eagles": "🦅", "Chiefs": "🏈", "Cowboys": "⭐", "49ers": "🏈",
  "Lakers": "🏀", "Celtics": "☘️", "Warriors": "🏀", "Heat": "🔥", "Bulls": "🐂",
  "Yankees": "⚾", "Dodgers": "⚾", "Red Sox": "⚾", "Cubs": "⚾",
  "Bruins": "🏒", "Penguins": "🐧", "Maple Leafs": "🍁", "Rangers": "🏒",
};

interface PostWithProfile {
  id: string; content: string; created_at: string; user_id: string;
  username: string; avatar_url: string | null;
  likes_count: number; replies_count: number; is_liked: boolean;
}

const Profile = () => {
  const { username: paramUsername } = useParams<{ username: string }>();
  const { user, username: authUsername } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userPosts, setUserPosts] = useState<PostWithProfile[]>([]);
  const [likedPosts, setLikedPosts] = useState<PostWithProfile[]>([]);

  const isOwnProfile = user && profile?.user_id === user.id;

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const targetUsername = paramUsername || authUsername;
    if (!targetUsername) { setLoading(false); return; }

    const { data } = await supabase
      .from("profiles").select("*").eq("username", targetUsername).single();

    if (data) {
      const p = data as ProfileData;
      setProfile(p);

      const [{ count: followers }, { count: following }] = await Promise.all([
        supabase.from("followers").select("*", { count: "exact", head: true }).eq("following_id", p.user_id),
        supabase.from("followers").select("*", { count: "exact", head: true }).eq("follower_id", p.user_id),
      ]);
      setFollowersCount(followers || 0);
      setFollowingCount(following || 0);

      if (user && p.user_id !== user.id) {
        const { data: followData } = await supabase
          .from("followers").select("id").eq("follower_id", user.id).eq("following_id", p.user_id).maybeSingle();
        setIsFollowing(!!followData);
      }

      // Fetch user's posts
      const { data: posts } = await supabase
        .from("posts").select("*").eq("user_id", p.user_id).order("created_at", { ascending: false });

      if (posts) {
        const postIds = posts.map((po) => po.id);
        const [{ data: likesData }, { data: repliesData }] = await Promise.all([
          supabase.from("post_likes").select("post_id").in("post_id", postIds.length ? postIds : [""]),
          supabase.from("post_replies").select("post_id").in("post_id", postIds.length ? postIds : [""]),
        ]);

        const likeCounts = new Map<string, number>();
        likesData?.forEach((l) => likeCounts.set(l.post_id, (likeCounts.get(l.post_id) || 0) + 1));
        const replyCounts = new Map<string, number>();
        repliesData?.forEach((r) => replyCounts.set(r.post_id, (replyCounts.get(r.post_id) || 0) + 1));

        let userLikes = new Set<string>();
        if (user) {
          const { data: myLikes } = await supabase.from("post_likes").select("post_id").eq("user_id", user.id).in("post_id", postIds.length ? postIds : [""]);
          userLikes = new Set(myLikes?.map((l) => l.post_id) || []);
        }

        setUserPosts(posts.map((po) => ({
          id: po.id, content: po.content, created_at: po.created_at, user_id: po.user_id,
          username: p.username, avatar_url: p.avatar_url,
          likes_count: likeCounts.get(po.id) || 0, replies_count: replyCounts.get(po.id) || 0,
          is_liked: userLikes.has(po.id),
        })));
      }

      // Fetch liked posts
      if (user && p.user_id === user.id) {
        const { data: likedData } = await supabase.from("post_likes").select("post_id").eq("user_id", p.user_id);
        if (likedData && likedData.length > 0) {
          const likedPostIds = likedData.map((l) => l.post_id);
          const { data: likedPostsData } = await supabase.from("posts").select("*").in("id", likedPostIds);
          if (likedPostsData) {
            const uids = [...new Set(likedPostsData.map((po) => po.user_id))];
            const { data: profs } = await supabase.from("profiles").select("user_id, username, avatar_url").in("user_id", uids);
            const profMap = new Map(profs?.map((pr) => [pr.user_id, pr]) || []);
            setLikedPosts(likedPostsData.map((po) => ({
              id: po.id, content: po.content, created_at: po.created_at, user_id: po.user_id,
              username: profMap.get(po.user_id)?.username || "Unknown",
              avatar_url: profMap.get(po.user_id)?.avatar_url || null,
              likes_count: 0, replies_count: 0, is_liked: true,
            })));
          }
        }
      }
    }
    setLoading(false);
  }, [paramUsername, authUsername, user]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleFollow = async () => {
    if (!user || !profile) return;
    if (isFollowing) {
      await supabase.from("followers").delete().eq("follower_id", user.id).eq("following_id", profile.user_id);
      setIsFollowing(false);
      setFollowersCount((c) => c - 1);
    } else {
      await supabase.from("followers").insert({ follower_id: user.id, following_id: profile.user_id });
      setIsFollowing(true);
      setFollowersCount((c) => c + 1);
    }
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

  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto pt-16">
        {/* Top bar */}
        <div className="flex items-center gap-4 px-4 py-3 sticky top-16 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold leading-tight">{profile.username}</h2>
            <p className="text-xs text-muted-foreground">{userPosts.length} posts</p>
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
          <div className="absolute -bottom-16 left-4">
            <Avatar className="w-32 h-32 border-4 border-background">
              {profile.avatar_url ? <AvatarImage src={profile.avatar_url} alt={profile.username} /> : (
                <AvatarFallback className="bg-secondary text-3xl font-bold">
                  {profile.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-end px-4 pt-3">
          {isOwnProfile ? (
            <Button variant="outline" className="rounded-full font-semibold" onClick={() => setShowEditModal(true)}>
              Edit Profile
            </Button>
          ) : user ? (
            <Button variant={isFollowing ? "outline" : "default"} className="rounded-full font-semibold" onClick={handleFollow}>
              {isFollowing ? "Following" : "Follow"}
            </Button>
          ) : null}
        </div>

        {/* Profile info */}
        <div className="px-4 pt-8 pb-4">
          <h1 className="text-xl font-extrabold">{profile.username}</h1>
          <p className="text-muted-foreground text-sm">@{profile.username.toLowerCase()}</p>

          {profile.favorite_teams && profile.favorite_teams.length > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {profile.favorite_teams.map((team) => (
                <span key={team} className="inline-flex items-center gap-1 text-sm bg-secondary px-2.5 py-1 rounded-full">
                  <span>{teamLogos[team] || "🏅"}</span>
                  <span className="text-secondary-foreground">{team}</span>
                </span>
              ))}
            </div>
          )}

          <p className="mt-3 text-sm leading-relaxed">
            {profile.bio || (isOwnProfile ? "Add a bio to tell fans about yourself" : "")}
          </p>

          <div className="flex items-center gap-1 text-muted-foreground text-sm mt-3">
            <Calendar className="w-4 h-4" />
            <span>Joined {joinDate}</span>
          </div>

          <div className="flex gap-4 mt-2 text-sm">
            <span><strong className="text-foreground">{followingCount}</strong> <span className="text-muted-foreground">Following</span></span>
            <span><strong className="text-foreground">{followersCount}</strong> <span className="text-muted-foreground">Followers</span></span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="border-t border-border/50">
          <TabsList className="w-full bg-transparent rounded-none h-12 p-0 border-b border-border/50">
            <TabsTrigger value="posts" className="flex-1 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary h-full">Posts</TabsTrigger>
            <TabsTrigger value="replies" className="flex-1 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary h-full">Replies</TabsTrigger>
            <TabsTrigger value="likes" className="flex-1 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary h-full">Likes</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-0">
            {userPosts.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <img src={refereeLogo} alt="" className="w-12 h-12 mx-auto opacity-20 mb-4" />
                <p className="font-semibold text-foreground">No posts yet</p>
                <p className="text-sm mt-1">When {isOwnProfile ? "you post" : `@${profile.username} posts`}, it'll show up here.</p>
              </div>
            ) : (
              userPosts.map((post) => (
                <PostItem key={post.id} {...post} onDelete={fetchProfile} onLikeToggle={fetchProfile} />
              ))
            )}
          </TabsContent>

          <TabsContent value="replies" className="mt-0">
            <div className="py-16 text-center text-muted-foreground">
              <p className="font-semibold text-foreground">No replies yet</p>
              <p className="text-sm mt-1">Replies to posts will appear here.</p>
            </div>
          </TabsContent>

          <TabsContent value="likes" className="mt-0">
            {likedPosts.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <p className="font-semibold text-foreground">No likes yet</p>
                <p className="text-sm mt-1">Liked posts will show up here.</p>
              </div>
            ) : (
              likedPosts.map((post) => (
                <PostItem key={post.id} {...post} onDelete={fetchProfile} onLikeToggle={fetchProfile} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit modal */}
      {profile && showEditModal && (
        <EditProfileModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          profile={profile}
          onSaved={fetchProfile}
        />
      )}
    </div>
  );
};

export default Profile;
