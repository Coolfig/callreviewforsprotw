import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Users, UserPlus, Edit3, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Header from "@/components/layout/Header";
import EditProfileModal from "@/components/profile/EditProfileModal";
import PostItem from "@/components/post/PostItem";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
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
  const [startingChat, setStartingChat] = useState(false);

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
      <main className="max-w-3xl mx-auto pt-20 px-4 pb-12">
        {/* Back button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Profile Hero Card */}
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden mb-6">
          {/* Banner */}
          <div className="h-36 bg-gradient-to-br from-primary/30 via-accent/10 to-secondary relative">
            {profile.banner_url ? (
              <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <img src={refereeLogo} alt="" className="w-16 h-16 opacity-10" />
              </div>
            )}
          </div>

          {/* Profile info section */}
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-12 mb-4">
              <Avatar className="w-24 h-24 border-4 border-card ring-2 ring-primary/20 shadow-lg">
                {profile.avatar_url ? <AvatarImage src={profile.avatar_url} alt={profile.username} /> : (
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {profile.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1" />
              {isOwnProfile ? (
                <Button variant="outline" size="sm" className="rounded-lg gap-2" onClick={() => setShowEditModal(true)}>
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Profile
                </Button>
              ) : user ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    disabled={startingChat}
                    onClick={async () => {
                      if (!profile || startingChat) return;
                      setStartingChat(true);
                      try {
                        // Check for existing 1-on-1 conversation first
                        const { data: myMemberships } = await supabase
                          .from("conversation_members")
                          .select("conversation_id")
                          .eq("user_id", user.id);

                        if (myMemberships?.length) {
                          for (const m of myMemberships) {
                            const { data: convo } = await supabase
                              .from("conversations")
                              .select("id, is_group")
                              .eq("id", m.conversation_id)
                              .eq("is_group", false)
                              .single();
                            if (!convo) continue;
                            const { data: otherMember } = await supabase
                              .from("conversation_members")
                              .select("user_id")
                              .eq("conversation_id", convo.id)
                              .eq("user_id", profile.user_id)
                              .single();
                            if (otherMember) {
                              navigate(`/messages?convo=${convo.id}`);
                              return;
                            }
                          }
                        }

                        // Create new conversation
                        const { data: newConvo, error: convoErr } = await supabase
                          .from("conversations")
                          .insert({ created_by: user.id, is_group: false })
                          .select("id")
                          .single();

                        if (convoErr || !newConvo) {
                          console.error("Create convo error:", convoErr);
                          toast({ title: "Error", description: "Could not start chat. Please try again.", variant: "destructive" });
                          return;
                        }

                        const { error: memberErr } = await supabase.from("conversation_members").insert([
                          { conversation_id: newConvo.id, user_id: user.id },
                          { conversation_id: newConvo.id, user_id: profile.user_id },
                        ]);

                        if (memberErr) {
                          console.error("Insert members error:", memberErr);
                          toast({ title: "Error", description: "Could not add members. Please try again.", variant: "destructive" });
                          return;
                        }

                        navigate(`/messages?convo=${newConvo.id}`);
                      } catch (err) {
                        console.error("Message button error:", err);
                        toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
                      } finally {
                        setStartingChat(false);
                      }
                    }}
                    title="Message"
                  >
                    {startingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                  </Button>
                  <Button variant={isFollowing ? "outline" : "default"} size="sm" className="rounded-lg gap-2" onClick={handleFollow}>
                    <UserPlus className="w-3.5 h-3.5" />
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                </div>
              ) : null}
            </div>

            <h1 className="text-2xl font-extrabold">{profile.username}</h1>

            {profile.bio && (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-lg">
                {profile.bio}
              </p>
            )}
            {!profile.bio && isOwnProfile && (
              <p className="mt-2 text-sm text-muted-foreground italic">Add a bio to tell fans about yourself</p>
            )}

            {/* Stats row */}
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Joined {joinDate}</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-1 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <strong className="text-foreground">{followingCount}</strong>
                <span className="text-muted-foreground">Following</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <strong className="text-foreground">{followersCount}</strong>
                <span className="text-muted-foreground">Followers</span>
              </div>
            </div>

            {/* Favorite teams */}
            {profile.favorite_teams && profile.favorite_teams.length > 0 && (
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                {profile.favorite_teams.map((team) => (
                  <span key={team} className="inline-flex items-center gap-1.5 text-xs bg-secondary/80 px-3 py-1.5 rounded-lg border border-border/30">
                    <span>{teamLogos[team] || "🏅"}</span>
                    <span className="text-secondary-foreground font-medium">{team}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="posts">
          <TabsList className="w-full bg-card border border-border/50 rounded-xl h-11 p-1 mb-4">
            <TabsTrigger value="posts" className="flex-1 rounded-lg text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
              Posts ({userPosts.length})
            </TabsTrigger>
            <TabsTrigger value="replies" className="flex-1 rounded-lg text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
              Replies
            </TabsTrigger>
            <TabsTrigger value="likes" className="flex-1 rounded-lg text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
              Likes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-0">
            {userPosts.length === 0 ? (
              <div className="py-16 text-center bg-card rounded-xl border border-border/50">
                <img src={refereeLogo} alt="" className="w-12 h-12 mx-auto opacity-20 mb-4" />
                <p className="font-semibold text-foreground">No posts yet</p>
                <p className="text-sm mt-1 text-muted-foreground">
                  When {isOwnProfile ? "you post" : `${profile.username} posts`}, it'll show up here.
                </p>
              </div>
            ) : (
              userPosts.map((post) => (
                <PostItem key={post.id} {...post} onDelete={fetchProfile} onLikeToggle={fetchProfile} />
              ))
            )}
          </TabsContent>

          <TabsContent value="replies" className="mt-0">
            <div className="py-16 text-center bg-card rounded-xl border border-border/50">
              <p className="font-semibold text-foreground">No replies yet</p>
              <p className="text-sm mt-1 text-muted-foreground">Replies to posts will appear here.</p>
            </div>
          </TabsContent>

          <TabsContent value="likes" className="mt-0">
            {likedPosts.length === 0 ? (
              <div className="py-16 text-center bg-card rounded-xl border border-border/50">
                <p className="font-semibold text-foreground">No likes yet</p>
                <p className="text-sm mt-1 text-muted-foreground">Liked posts will show up here.</p>
              </div>
            ) : (
              likedPosts.map((post) => (
                <PostItem key={post.id} {...post} onDelete={fetchProfile} onLikeToggle={fetchProfile} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

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
