import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ShieldAlert } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/"><ChevronLeft size={16} /> Back to Home</Link>
        </Button>

        <Card className="border-none shadow-sm">
          <CardHeader className="border-b bg-white">
            <CardTitle className="text-3xl font-headline font-bold">Terms of Service</CardTitle>
            <p className="text-sm text-muted-foreground italic">Last Updated: May 2024</p>
          </CardHeader>
          <CardContent className="p-8 prose prose-slate max-w-none">
            <section className="space-y-4">
              <h2 className="text-xl font-bold font-headline">1. Acceptance of Terms</h2>
              <p>By registering for and using CarCheck Flow (the "Service"), you agree to be bound by these Terms of Service. If you are using the Service on behalf of a business, you represent that you have the authority to bind that business.</p>
            </section>

            <div className="my-8 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg flex gap-4">
              <ShieldAlert className="text-amber-600 shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-amber-800 font-headline">Important: AI Accuracy Disclaimer</h3>
                <p className="text-sm text-amber-700 leading-relaxed">
                  Our Service utilizes Artificial Intelligence (AI) to extract information from vehicle documents. While we strive for high precision, **AI-based analysis is not 100% accurate.** You acknowledge and agree that it is your sole responsibility to verify all extracted data (such as inspection expiration dates and plate numbers) before taking any action. The Service provider shall not be liable for any errors resulting from incorrect AI interpretations.
                </p>
              </div>
            </div>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-bold font-headline">2. Subscription and Payments</h2>
              <p>CarCheck Flow offers subscription-based services. Payments are processed securely via Stripe. Fees are non-refundable except where required by law. Failure to pay may result in immediate suspension of AI features and LINE messaging automation.</p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-bold font-headline">3. Prohibited Activities</h2>
              <p>You may not use the Service for any illegal purpose or to send spam messages via the LINE Messaging API. Any abuse of the AI extraction system or attempts to reverse engineer the platform will result in immediate termination.</p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-bold font-headline">4. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, CarCheck Flow shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service or reliance on AI-generated data.</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
