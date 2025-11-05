import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, Trophy, Flame, Star } from "lucide-react";
import mathHero from "@/assets/math-hero.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-secondary">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Math Quiz</span>
          </div>
          <Button onClick={() => navigate("/auth")} size="lg">
            Get Started
          </Button>
        </nav>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Master Mathematics
              <span className="block text-primary mt-2">One Quiz at a Time</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Challenge yourself, track your progress, and become a math champion with our interactive quiz platform.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => navigate("/auth")} size="lg" className="h-14 px-8 text-lg">
                Start Learning
              </Button>
              <Button onClick={() => navigate("/auth")} variant="outline" size="lg" className="h-14 px-8 text-lg">
                Sign In
              </Button>
            </div>
          </div>

          <div className="relative">
            <img 
              src={mathHero} 
              alt="Students learning mathematics" 
              className="rounded-3xl shadow-2xl w-full"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-card p-8 rounded-2xl shadow-lg border-2 hover:border-primary transition-colors">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Earn Points</h3>
            <p className="text-muted-foreground">
              Complete quizzes and earn points to level up your mathematics skills and unlock achievements.
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-lg border-2 hover:border-primary transition-colors">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4">
              <Flame className="w-6 h-6 text-accent-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Build Streaks</h3>
            <p className="text-muted-foreground">
              Practice daily to maintain your learning streak and build lasting mathematical knowledge.
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-lg border-2 hover:border-primary transition-colors">
            <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-secondary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Track Progress</h3>
            <p className="text-muted-foreground">
              Monitor your improvement with detailed statistics and personalized progress tracking.
            </p>
          </div>
        </div>

        <div className="text-center bg-gradient-to-r from-primary to-primary-dark text-primary-foreground rounded-3xl p-12 shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Math Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students improving their mathematics skills every day.
          </p>
          <Button 
            onClick={() => navigate("/auth")} 
            size="lg" 
            variant="secondary"
            className="h-14 px-12 text-lg"
          >
            Sign Up Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
