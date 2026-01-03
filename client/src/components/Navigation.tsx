import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/80 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="text-2xl font-bold text-primary hover-elevate active-elevate-2 px-3 py-2 rounded-md transition-all" data-testid="link-home">
            DealControl
          </a>

          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-foreground hover:text-primary transition-colors font-medium" data-testid="link-nav-home">
              Home
            </a>
            <a href="/library" className="text-foreground hover:text-primary transition-colors font-medium" data-testid="link-nav-library">
              Asset Library
            </a>
            
            {isLoading ? (
              <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-4">
                <a href="/dashboard" className="text-foreground hover:text-primary transition-colors font-medium" data-testid="link-nav-dashboard">
                  Dashboard
                </a>
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.email || "User"} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    data-testid="button-logout"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <Button asChild variant="default" data-testid="button-login">
                <Link href="/login">Log In</Link>
              </Button>
            )}
          </div>

          <button
            className="md:hidden p-2 hover-elevate active-elevate-2 rounded-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur-lg">
          <div className="px-4 py-4 space-y-3">
            <a href="/" className="block px-3 py-2 text-foreground hover:text-primary font-medium hover-elevate rounded-md" data-testid="link-mobile-home">
              Home
            </a>
            <a href="/library" className="block px-3 py-2 text-foreground hover:text-primary font-medium hover-elevate rounded-md" data-testid="link-mobile-library">
              Asset Library
            </a>
            
            {isAuthenticated ? (
              <>
                <a href="/dashboard" className="block px-3 py-2 text-foreground hover:text-primary font-medium hover-elevate rounded-md" data-testid="link-mobile-dashboard">
                  Dashboard
                </a>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLogout}
                  data-testid="button-mobile-logout"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button asChild variant="default" className="w-full" data-testid="button-mobile-login">
                <Link href="/login">Log In</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
