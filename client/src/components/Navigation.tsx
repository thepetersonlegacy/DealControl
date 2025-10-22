import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/80 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <a className="text-2xl font-bold text-primary hover-elevate active-elevate-2 px-3 py-2 rounded-md transition-all" data-testid="link-home">
              ProductHub
            </a>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <a className="text-foreground hover:text-primary transition-colors font-medium" data-testid="link-nav-home">
                Home
              </a>
            </Link>
            <Link href="/library">
              <a className="text-foreground hover:text-primary transition-colors font-medium" data-testid="link-nav-library">
                Master Library
              </a>
            </Link>
            <Button asChild variant="default" data-testid="button-get-started">
              <Link href="/library">
                <a>Get Started</a>
              </Link>
            </Button>
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
            <Link href="/">
              <a className="block px-3 py-2 text-foreground hover:text-primary font-medium hover-elevate rounded-md" data-testid="link-mobile-home">
                Home
              </a>
            </Link>
            <Link href="/library">
              <a className="block px-3 py-2 text-foreground hover:text-primary font-medium hover-elevate rounded-md" data-testid="link-mobile-library">
                Master Library
              </a>
            </Link>
            <Button asChild variant="default" className="w-full" data-testid="button-mobile-get-started">
              <Link href="/library">
                <a>Get Started</a>
              </Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
