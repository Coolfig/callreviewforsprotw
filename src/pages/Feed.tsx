import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FeedSection from "@/components/home/FeedSection";

const Feed = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <FeedSection />
      </main>
      <Footer />
    </div>
  );
};

export default Feed;
