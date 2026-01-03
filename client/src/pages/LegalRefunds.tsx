import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export default function LegalRefunds() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-foreground mb-8" data-testid="text-refunds-title">
            Refund Policy
          </h1>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Digital Product Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p className="font-semibold text-foreground text-lg italic">
                  Due to the nature of digital products, all sales are final.
                </p>
                <p>
                  Once materials are accessed or downloaded, refunds are not provided.
                </p>
                <p>
                  If a file is corrupted, incomplete, or inaccessible due to a technical issue, 
                  DealControl will provide a replacement file or alternate access. Refunds are not 
                  issued for successfully delivered digital materials.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>License Activation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Access to and use of DealControl materials begins immediately upon download or access.
                </p>
                <p>
                  Once materials have been accessed or downloaded, the license is considered delivered, 
                  activated, and non-refundable.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Confirmation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Delivery of digital materials is deemed complete when download access is provided, 
                  regardless of whether the purchaser chooses to download or open the files.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technical Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  If you experience technical issues accessing your purchased materials:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Contact DealControl support with your order details</li>
                  <li>Describe the specific technical issue you're experiencing</li>
                  <li>We will provide replacement files or alternate access methods</li>
                </ul>
                <p>
                  Replacement-only for technical access issues. No refunds for successfully delivered materials.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Disputes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  By completing a purchase, you agree not to initiate a chargeback or payment dispute 
                  for materials that have been accessed or downloaded.
                </p>
                <p>
                  Unauthorized chargebacks may result in termination of access and license rights.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>No Trial Use</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  DealControl materials are not provided on a trial basis. Purchasers are responsible 
                  for reviewing product descriptions and license scope prior to purchase.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Office License Cancellation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Office License subscriptions may be cancelled at any time. Upon cancellation:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access continues until the end of the current billing period</li>
                  <li>No refunds are provided for partial billing periods</li>
                  <li>Previously downloaded materials remain yours under the original license terms</li>
                  <li>Access to future updates is discontinued upon cancellation</li>
                </ul>
              </CardContent>
            </Card>

            <div className="text-center pt-8">
              <p className="text-sm text-muted-foreground mb-4">
                For the complete license agreement, see our{" "}
                <Link href="/terms">
                  <a className="text-primary hover:underline" data-testid="link-terms">Terms of Use</a>
                </Link>
                .
              </p>
              <p className="text-sm text-muted-foreground">Last Updated: January 2026</p>
              <p className="mt-2 text-sm text-muted-foreground">© 2026 DealControl. All rights reserved.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
