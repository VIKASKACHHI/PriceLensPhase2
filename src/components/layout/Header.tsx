import { Link, useNavigate } from 'react-router-dom';
import { MapPin, User, Store, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground shadow-card group-hover:shadow-glow transition-shadow duration-300">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold hero-text">PriceLens</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/search" className="text-muted-foreground hover:text-foreground transition-colors">
            Find Prices
          </Link>
          {user ? (
            <>
              {profile?.user_type === 'shopkeeper' ? (
                <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <Store className="h-4 w-4" />
                  Dashboard
                </Link>
              ) : (
                <Link to="/profile" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth?type=customer">
                <Button variant="ghost" size="sm">Customer Login</Button>
              </Link>
              <Link to="/auth?type=shopkeeper">
                <Button size="sm">Shopkeeper Login</Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 animate-slide-up">
          <nav className="flex flex-col gap-4">
            <Link 
              to="/search" 
              className="text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Find Prices
            </Link>
            {user ? (
              <>
                {profile?.user_type === 'shopkeeper' ? (
                  <Link 
                    to="/dashboard" 
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Store className="h-4 w-4" />
                    Dashboard
                  </Link>
                ) : (
                  <Link 
                    to="/profile" 
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                )}
                <Button variant="ghost" onClick={handleSignOut} className="justify-start gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/auth?type=customer" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full">Customer Login</Button>
                </Link>
                <Link to="/auth?type=shopkeeper" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Shopkeeper Login</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
