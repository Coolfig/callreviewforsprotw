import { Video, BookOpen, Users, BarChart3, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Frame-by-Frame Analysis",
    description: "Scrub through plays at 0.1x speed, pause on any frame, and zoom in on the critical moments that decided the call."
  },
  {
    icon: BookOpen,
    title: "Official Rule References",
    description: "Every play is paired with the exact league rule that applies, with key clauses highlighted for easy comparison."
  },
  {
    icon: Users,
    title: "Evidence-Based Discussion",
    description: "Comments require rule citations or timestamp references—no more shouting matches, just analysis."
  },
  {
    icon: BarChart3,
    title: "Community Consensus",
    description: "See how thousands of fans interpret each call with real-time voting and demographic breakdowns."
  },
  {
    icon: Shield,
    title: "Multi-League Coverage",
    description: "NFL, NBA, MLB, and NHL—all officiating controversies analyzed under one platform."
  },
  {
    icon: Zap,
    title: "Real-Time Updates",
    description: "New controversial plays added within hours of games, so you can weigh in while the debate is fresh."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Review Like an Official
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We give you the same tools and rulebook access that replay officials use—
            so your analysis is based on facts, not frustration.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
