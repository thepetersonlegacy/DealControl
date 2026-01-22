import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-foreground mb-8" data-testid="text-terms-title">
            Terms of Use & License Agreement
          </h1>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>License Grant</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  By purchasing any digital asset from DealControl, you are granted a non-exclusive, 
                  non-transferable license to use the purchased materials according to your selected license tier.
                </p>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-foreground">Solo License ($129)</h4>
                    <p>Licensed for use by one individual professional within their own business operations. 
                    May not be shared with team members, colleagues, or third parties.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Pro License ($219)</h4>
                    <p>Licensed for use by one business entity and its immediate internal team. 
                    May be used by employees of the licensed business but may not be distributed to external parties, 
                    clients, or franchisees.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Office License ($699/year)</h4>
                    <p>Annual license for organization-wide internal use. Includes all updates during the license term. 
                    May be used by all employees and agents affiliated with the licensed brokerage or organization. 
                    May not be sublicensed or distributed outside the organization.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Permitted Uses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use materials for internal business operations within license scope</li>
                  <li>Print copies for personal or internal team reference</li>
                  <li>Adapt or customize materials for your specific business needs (internal use only)</li>
                  <li>Reference materials when developing your own procedures</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prohibited Uses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Resale, redistribution, or sublicensing of materials</li>
                  <li>Sharing with unlicensed parties, including clients, competitors, or other businesses</li>
                  <li>Publishing or posting materials publicly (including on social media or websites)</li>
                  <li>Using materials as training content for external audiences</li>
                  <li>Claiming authorship or removing proprietary notices</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Important Disclaimers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p className="font-semibold text-foreground">
                  This is a procedural asset, not legal advice.
                </p>
                <p>
                  All DealControl products are designed as operational tools and reference materials for 
                  licensed Texas real estate professionals. They do not constitute legal, tax, or professional 
                  advice. Users should consult with appropriate licensed professionals (attorneys, accountants, 
                  compliance officers) for specific situations.
                </p>
                <p>
                  DealControl and its creators are not responsible for any outcomes resulting from the use 
                  or misuse of these materials. Users assume full responsibility for ensuring compliance with 
                  applicable laws, regulations, and professional standards in their jurisdiction.
                </p>
                <p>
                  Materials are provided "as is" without warranty of any kind. While we strive for accuracy, 
                  laws and regulations change. Users are responsible for verifying current requirements with 
                  authoritative sources.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Texas Real Estate Focus</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  All DealControl products are specifically designed for Texas real estate transactions and 
                  reference Texas-specific laws, regulations, and practices. These materials may not be 
                  suitable for use in other jurisdictions without significant modification and legal review.
                </p>
                <p>
                  Users operating in other states should consult with local legal counsel before adapting 
                  any Texas-specific procedures for use elsewhere.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Refund Policy (Digital Products)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p className="font-semibold text-foreground italic">
                  Due to the nature of digital products, all sales are final.
                </p>
                <p>
                  Once materials are accessed or downloaded, refunds are not provided.
                </p>
                <p>
                  If a file is corrupted, incomplete, or inaccessible due to a technical issue, DealControl will provide a replacement file or alternate access. Refunds are not issued for successfully delivered digital materials.
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
                  Once materials have been accessed or downloaded, the license is considered delivered, activated, and non-refundable.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chargebacks and Payment Disputes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  By completing a purchase, you agree not to initiate a chargeback or payment dispute for materials that have been accessed or downloaded.
                </p>
                <p>
                  Unauthorized chargebacks may result in termination of access and license rights.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Digital Delivery Confirmation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Delivery of digital materials is deemed complete when download access is provided, regardless of whether the purchaser chooses to download or open the files.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>No Trial Use</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  DealControl materials are not provided on a trial basis. Purchasers are responsible for reviewing product descriptions and license scope prior to purchase.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Intellectual Property</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  All materials, including but not limited to SOPs, checklists, scripts, playbooks, and guides, 
                  are protected by copyright and remain the intellectual property of DealControl. Your license 
                  grants usage rights only; it does not transfer ownership of the underlying intellectual property.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  For questions about licensing, permitted uses, or to report unauthorized distribution, 
                  please contact us through the DealControl platform.
                </p>
              </CardContent>
            </Card>

            <div className="text-center text-sm text-muted-foreground pt-8">
              <p>Last Updated: January 2026</p>
              <p className="mt-2">© 2026 DealControl a <a href="https://petersonproservices.com/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground underline">Peterson Pro Services, LLC</a> Product. All rights reserved.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
