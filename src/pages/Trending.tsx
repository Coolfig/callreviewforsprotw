import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TopThisWeek from "@/components/home/TopThisWeek";

const Trending = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-[40px] md:pt-[112px]">
        <TopThisWeek />
      </main>
      <Footer />
    </div>
  );
};

export default Trending;
