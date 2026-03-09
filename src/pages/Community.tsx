import Header from "@/components/layout/Header";
import PostFeed from "@/components/post/PostFeed";
import { Scale } from "lucide-react";

const Community = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto pt-20 px-4 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Community</h1>
            <p className="text-xs text-muted-foreground">Share your sports opinions and hot takes</p>
          </div>
        </div>
        <PostFeed />
      </main>
    </div>
  );
};

export default Community;
