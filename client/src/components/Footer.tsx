import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-accent/30 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold text-primary mb-4" data-testid="text-footer-brand">
              DealControl
            </h3>
            <p className="text-muted-foreground" data-testid="text-footer-description">
              Tools for When Deals Matter
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4" data-testid="text-footer-products-title">
              <Link href="/library">
                <a className="hover:text-primary transition-colors">Assets</a>
              </Link>
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/library">
                  <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-library">
                    Asset Library
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/library?filter=bundles">
                  <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-bundles">
                    Risk Control Bundles
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/library?filter=sops">
                  <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-sops">
                    SOPs & Checklists
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4" data-testid="text-footer-company-title">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-about">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-contact">
                  Contact
                </a>
              </li>
              <li>
                <Link href="/terms">
                  <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-terms">
                    Terms of Use
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4" data-testid="text-footer-connect-title">
              Connect
            </h4>
            <div className="flex gap-3">
              <Button variant="outline" size="icon" data-testid="button-social-facebook">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" data-testid="button-social-twitter">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" data-testid="button-social-instagram">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" data-testid="button-social-linkedin">
                <Linkedin className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t pt-8 space-y-4">
          <p className="text-sm text-muted-foreground text-center max-w-3xl mx-auto" data-testid="text-footer-disclaimer">
            All materials are provided for educational and operational support purposes only. 
            They do not constitute legal advice. Users are responsible for compliance with local, state, and federal laws. 
            Brokerage and office license assets are intended for internal use only.
          </p>
          <p className="text-center text-muted-foreground" data-testid="text-footer-copyright">
            © 2026 DealControl All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
