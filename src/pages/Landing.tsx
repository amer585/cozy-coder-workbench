import { Button } from '@/components/ui/button';
import { Code2, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-primary/10">
      {/* Header */}
      <header className="h-16 border-b border-border/30 backdrop-blur-sm bg-background/80 flex items-center px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Code2 className="w-8 h-8 text-primary" />
            <Sparkles className="w-4 h-4 text-primary-glow absolute -top-1 -right-1 animate-pulse" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            AI Code Studio
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-4xl w-full text-center space-y-8 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm text-foreground">Introducing AI-Powered Development</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="block mb-2">Build something</span>
            <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent animate-gradient">
              Lovable
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Create apps and websites by chatting with AI
          </p>

          {/* CTA */}
          <div className="pt-4">
            <Link to="/studio">
              <Button 
                size="lg"
                className="h-14 px-8 text-lg bg-gradient-to-r from-primary via-primary-glow to-primary hover:shadow-[0_0_40px_hsl(var(--primary)/0.4)] transition-all duration-300 hover:scale-105 group"
              >
                <span>Get Started</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all hover:scale-105">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <Code2 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">AI Code Generation</h3>
              <p className="text-sm text-muted-foreground">
                Let AI write, debug, and optimize your code with natural language commands
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all hover:scale-105">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Instant Preview</h3>
              <p className="text-sm text-muted-foreground">
                See your changes in real-time with live code execution and preview
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all hover:scale-105">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <ArrowRight className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Smart Assistance</h3>
              <p className="text-sm text-muted-foreground">
                Get intelligent suggestions and explanations as you build
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border/30 text-center text-sm text-muted-foreground">
        <p>Powered by OpenRouter AI • Built with React + Vite</p>
      </footer>
    </div>
  );
}
