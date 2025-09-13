import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";

interface TermsAndConditionsProps {
  trigger?: React.ReactNode;
  className?: string;
}

export const TermsAndConditions = ({ trigger, className }: TermsAndConditionsProps) => {
  const defaultTrigger = (
    <Button variant="ghost" size="sm" className={className}>
      <FileText className="h-4 w-4 mr-2" />
      Terms & Conditions
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Terms and Conditions</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h3>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using this trading platform, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">2. Trading Risks</h3>
              <p className="text-muted-foreground leading-relaxed">
                Trading in financial instruments carries a high level of risk and may not be suitable for all investors. 
                You should carefully consider your investment objectives, level of experience, and risk appetite before making any trading decisions.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">3. Account Types</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                We offer two types of accounts:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li><strong>Demo Account:</strong> Virtual money for practice trading without real financial risk</li>
                <li><strong>Real Account:</strong> Live trading with real money and actual market conditions</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">8. Deposits and Withdrawals</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                <strong>Withdrawal Eligibility:</strong> Only active accounts can make withdrawals. Inactive accounts are not permitted to process withdrawal requests.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                All deposits and withdrawals are processed through secure payment methods including M-Pesa. 
                Processing times may vary depending on the payment method selected. Minimum deposit amounts apply.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">5. Privacy and Data Protection</h3>
              <p className="text-muted-foreground leading-relaxed">
                We are committed to protecting your privacy and personal information. All data is encrypted and stored securely. 
                We do not share your personal information with third parties without your explicit consent.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">6. Platform Availability</h3>
              <p className="text-muted-foreground leading-relaxed">
                While we strive to maintain 24/7 platform availability, we cannot guarantee uninterrupted service. 
                Scheduled maintenance and unexpected technical issues may temporarily affect platform access.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">7. User Responsibilities</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Users are responsible for:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Maintaining the confidentiality of their account credentials</li>
                <li>All trading activities performed under their account</li>
                <li>Ensuring compliance with applicable laws and regulations</li>
                <li>Providing accurate and up-to-date information</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">8. Prohibited Activities</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                The following activities are strictly prohibited:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Fraudulent or manipulative trading practices</li>
                <li>Money laundering or financing illegal activities</li>
                <li>Sharing account credentials with third parties</li>
                <li>Using automated trading systems without prior approval</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">9. Limitation of Liability</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our liability is limited to the maximum extent permitted by law. We are not liable for any indirect, 
                incidental, or consequential damages arising from your use of the platform or trading activities.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">10. Deposits and Withdrawals Policy</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                <strong>Important:</strong> Only active accounts are permitted to make withdrawals. Inactive accounts cannot process withdrawal requests.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                All deposits and withdrawals are processed through secure payment methods including M-Pesa. 
                Processing times may vary depending on the payment method selected. Minimum deposit amounts apply.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">11. Modification of Terms</h3>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms and conditions at any time. Users will be notified of 
                significant changes, and continued use of the platform constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">12. Contact Information</h3>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms and Conditions, please contact our support team through 
                the platform's help section or customer service channels.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};