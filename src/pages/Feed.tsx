import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FeedSection from "@/components/home/FeedSection";
import LiveScoresTicker from "@/components/scores/LiveScoresTicker";

const Feed = () => {
  return (
    <div className="min-h-screen bg-background">
      <LiveScoresTicker />
      <Header />
      <main className="pt-26">
        <FeedSection />
      </main>
      <Footer />
    </div>
  );
};

export default Feed;
