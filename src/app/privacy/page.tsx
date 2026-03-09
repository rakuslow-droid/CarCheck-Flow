import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Lock } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/"><ChevronLeft size={16} /> Back to Home</Link>
        </Button>

        <Card className="border-none shadow-sm">
          <CardHeader className="border-b bg-white">
            <CardTitle className="text-3xl font-headline font-bold flex items-center gap-3">
              <Lock className="text-primary" /> Privacy Policy
            </CardTitle>
            <p className="text-sm text-muted-foreground italic">Effective Date: May 2024</p>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <section className="space-y-4">
              <h2 className="text-xl font-bold font-headline">1. Information We Collect</h2>
              <p className="text-slate-600 leading-relaxed">
                When you use CarCheck Flow, we collect information necessary to provide our services:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li><strong>Merchant Data:</strong> Shop name, email address, and owner credentials.</li>
                <li><strong>Vehicle Data:</strong> Images of vehicle inspection certificates/stickers and extracted text.</li>
                <li><strong>LINE Data:</strong> LINE User IDs of your customers for message delivery.</li>
                <li><strong>Payment Data:</strong> Subscription status and Stripe customer identifiers.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold font-headline">2. How We Use Data</h2>
              <p className="text-slate-600 leading-relaxed">
                Data is used solely for identifying vehicle inspection expiration dates, managing reminders, and processing subscriptions. We do not sell your data or your customers' data to third parties.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold font-headline">3. Data Sharing and Third Parties</h2>
              <p className="text-slate-600 leading-relaxed">
                We share data with the following essential service providers:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li><strong>Google Cloud/Firebase:</strong> For data storage and AI processing (Gemini API).</li>
                <li><strong>LINE Corporation:</strong> For sending notifications via the Messaging API.</li>
                <li><strong>Stripe:</strong> For secure payment processing.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold font-headline">4. Data Security</h2>
              <p className="text-slate-600 leading-relaxed">
                Vehicle document images are stored securely in Firebase Storage. We implement industry-standard encryption and access controls to protect sensitive information.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold font-headline">5. Contact Us</h2>
              <p className="text-slate-600 leading-relaxed">
                If you have questions about this policy, please contact us at: [Your Contact Email]
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
