import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Scale, BookOpen, Users, Shield } from "lucide-react";
import Seo from "@/components/seo/Seo";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo title='About Under Review — The Sports Court for Blown Calls' description='Under Review is where fans review plays like officials: watch the clip, check the rule, and vote on whether the call was right.' path="/about" />
      <Header />
      <main className="pt-[144px] pb-16">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="mb-12">
            <h1 className="text-3xl font-bold mb-4">About Under Review</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We're building the platform where fans review plays like officials — with evidence, not emotion.
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                icon: Scale,
                title: "Evidence Over Opinion",
                body: "Every analysis is backed by rule citations and video timestamps. We reward depth, not hot takes.",
              },
              {
                icon: BookOpen,
                title: "Structured Rulebook",
                body: "Rules are indexed, searchable, and linked to real plays. No more digging through PDFs — find the exact clause in seconds.",
              },
              {
                icon: Users,
                title: "Community of Analysts",
                body: "From casual fans to former officials, everyone contributes to the same evidence-based discussion.",
              },
              {
                icon: Shield,
                title: "Expert Verification",
                body: "Verified analysts and rule specialists help surface the best interpretations and resolve disputes.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold mb-1 text-base">{title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
