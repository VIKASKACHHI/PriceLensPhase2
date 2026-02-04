import { Link } from 'react-router-dom';
import { MapPin, Search, Store, TrendingDown, Navigation, Bell, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <TrendingDown className="h-4 w-4" />
              Save money on every purchase
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Find the <span className="hero-text">Best Prices</span> Near You
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Compare prices from local stores in your area. Get real-time sale alerts and navigate directly to the best deals.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/search">
                <Button size="lg" className="gap-2 shadow-lg hover:shadow-glow transition-shadow">
                  <Search className="h-5 w-5" />
                  Start Comparing
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth?type=shopkeeper">
                <Button size="lg" variant="outline" className="gap-2">
                  <Store className="h-5 w-5" />
                  I'm a Shopkeeper
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              PriceLens makes it easy to find the best prices at stores near you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-card rounded-2xl p-8 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Location Based</h3>
              <p className="text-muted-foreground">
                Set your location and search radius to find stores within your preferred distance
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card rounded-2xl p-8 text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <TrendingDown className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Price Comparison</h3>
              <p className="text-muted-foreground">
                Compare prices across multiple stores and find the best deals instantly
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card rounded-2xl p-8 text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Navigation className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Easy Navigation</h3>
              <p className="text-muted-foreground">
                Get directions to the store with Google Maps integration
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Shopkeepers Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
                <Store className="h-4 w-4" />
                For Shopkeepers
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Reach More Customers
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                List your products, manage your shop, and attract customers in your area with real-time sale alerts.
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Store className="h-4 w-4 text-primary" />
                  </div>
                  <span>Easy shop and product management</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <Bell className="h-4 w-4 text-accent" />
                  </div>
                  <span>Real-time sale alerts to customers</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-success" />
                  </div>
                  <span>Location-based visibility</span>
                </li>
              </ul>

              <Link to="/auth?type=shopkeeper">
                <Button size="lg" className="gap-2">
                  Register Your Shop
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="glass-card rounded-2xl p-8">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Store className="h-20 w-20 text-primary/50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Saving Today
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of smart shoppers who compare prices before they buy
          </p>
          <Link to="/auth?type=customer">
            <Button size="lg" variant="secondary" className="gap-2">
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
