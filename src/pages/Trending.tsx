import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TopThisWeek from "@/components/home/TopThisWeek";
import Seo from "@/components/seo/Seo";

const Trending = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo title='Trending Calls This Week | Under Review' description='The most argued-about plays right now. See which calls fans are voting on and where the crowd stands this week.' path="/trending" jsonLd={{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Trending Calls", description: 'The most argued-about plays right now. See which calls fans are voting on and where the crowd stands this week.', url: "https://undereview.com/trending" }} />
      <Header />
      <main className="pt-[40px] md:pt-[112px]">
        <TopThisWeek />
      </main>
      <Footer />
    </div>
  );
};

export default Trending;
