import Header from "@/components/layout/Header";
import PostFeed from "@/components/post/PostFeed";

const Community = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto pt-16">
        <div className="px-4 py-4 border-b border-border/50">
          <h1 className="text-xl font-bold">Community</h1>
          <p className="text-sm text-muted-foreground">Share your sports opinions</p>
        </div>
        <PostFeed />
      </main>
    </div>
  );
};

export default Community;
