import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Trophy, Award, Target, MessageSquare } from "lucide-react";

const Leaderboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">Leaderboard</h1>
            </div>
            <p className="text-muted-foreground">
              Top analysts ranked by evidence quality, not popularity.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Award className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              The leaderboard will rank analysts by their evidence score — rewarding rule citations, timestamp evidence, and accuracy over simple popularity.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Leaderboard;
