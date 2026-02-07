import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ReviewQueue from "@/components/admin/ReviewQueue";

const Admin = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-12">
        <ReviewQueue />
      </main>
      <Footer />
    </div>
  );
};

export default Admin;