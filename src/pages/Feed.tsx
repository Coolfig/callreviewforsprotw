import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FeedSection from "@/components/home/FeedSection";
import LiveScoresTicker from "@/components/scores/LiveScoresTicker";
import Seo from "@/components/seo/Seo";

const Feed = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo title='Debate Feed — Blown Calls & Hot Takes | Under Review' description='Scroll the live feed of controversial sports calls, watch each clip, read the rule, and cast your vote alongside other fans.' path="/feed" jsonLd={{ "@context": "https://schema.org", "@type": "CollectionPage", name: 'Debate Feed — Blown Calls & Hot Takes | Under Review'.replace(/\|.*$/, "").trim(), description: 'Scroll the live feed of controversial sports calls, watch each clip, read the rule, and cast your vote alongside other fans.', url: "https://undereview.com/feed" }} />
      <LiveScoresTicker />
      <Header />
      <main className="pt-[120px]">
        <FeedSection />
      </main>
      <Footer />
    </div>
  );
};

export default Feed;
