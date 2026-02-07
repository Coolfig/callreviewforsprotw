import { ArrowRight, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <Bell className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Never Miss a Controversial Call</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Join the Most Objective Sports<br />
            <span className="text-gradient">Debate Community</span>
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Get notified when new controversial plays are added, participate in real-time voting, 
            and build your reputation as an evidence-based analyst.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="text-base px-8 h-12">
              Create Free Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="text-base px-8 h-12">
              Browse as Guest
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-6">
            No credit card required • Join 50,000+ sports analysts
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
