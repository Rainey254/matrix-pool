import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, ChartLine, Smartphone, Settings } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import TradingDashboard from "@/components/trading/TradingDashboard";
import { authService } from "@/services/authService";

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Check if user is already logged in
  useEffect(() => {
    if (authService.isLoggedIn()) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    setIsAuthModalOpen(false);
  };

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  if (isLoggedIn) {
    return <TradingDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ChartLine className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">Matrix-pool</span>
          </div>
          <div className="flex gap-4 items-center">
            <Button variant="ghost" onClick={() => openAuth('login')} className="text-white hover:bg-white/10">
              Login
            </Button>
            <Button onClick={() => openAuth('signup')} className="bg-purple-600 hover:bg-purple-700">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-purple-600/20 text-purple-300 border-purple-500/30">
            24/7 Synthetic Markets
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Mine Synthetic
            <span className="text-purple-400"> Indices</span>
            <br />
            Around the Clock
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience 24/7 mining in synthetic markets. Start with a demo account and mine real money when you're ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => openAuth('signup')} className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-4">
              Start Demo Mining
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => openAuth('login')} className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-4">
              Login to Mine
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-black/20">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            Why Choose matrix-pool?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <ChartLine className="h-12 w-12 text-purple-400 mb-4" />
                <CardTitle className="text-white">24/7 Markets</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Mine synthetic indices that never close. Market opportunities around the clock.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <Users className="h-12 w-12 text-purple-400 mb-4" />
                <CardTitle className="text-white">Demo First</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Start risk-free with demo accounts. Perfect your strategy before mine real money.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <Smartphone className="h-12 w-12 text-purple-400 mb-4" />
                <CardTitle className="text-white">Mobile Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Responsive design works perfectly on all devices. Mine anywhere, anytime.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <Settings className="h-12 w-12 text-purple-400 mb-4" />
                <CardTitle className="text-white">Easy Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Simple registration and KYC process. Start mining in minutes, not hours.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Mining?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of miners who choose synthetic markets for consistent opportunities.
          </p>
          <Button size="lg" onClick={() => openAuth('signup')} className="bg-purple-600 hover:bg-purple-700 text-lg px-12 py-4">
            Create Free Account
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Index;
