import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Scale } from 'lucide-react';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

export default function LegalNoticePage() {
  const legalItems = [
    { label: 'Distributor', value: '[Your Shop/Company Name]' },
    { label: 'Representative', value: '[Representative Name]' },
    { label: 'Address', value: '[Zip Code, Full Address]' },
    { label: 'Contact', value: '[Email Address] / [Phone Number]' },
    { label: 'Service Fees', value: 'Displayed on the billing page (inclusive of tax where applicable).' },
    { label: 'Additional Costs', value: 'Internet connection fees and data charges are the responsibility of the customer.' },
    { label: 'Payment Method', value: 'Credit Card (processed via Stripe).' },
    { label: 'Service Delivery', value: 'Features are activated immediately upon successful subscription payment.' },
    { label: 'Cancellations/Refunds', value: 'Due to the nature of digital services, refunds are not provided for the current billing period. You can cancel your subscription at any time to prevent future charges.' },
    { label: 'System Requirements', value: 'Requires a modern web browser and a LINE official account for messaging features.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/"><ChevronLeft size={16} /> Back to Home</Link>
        </Button>

        <Card className="border-none shadow-sm">
          <CardHeader className="border-b bg-white">
            <CardTitle className="text-3xl font-headline font-bold flex items-center gap-3">
              <Scale className="text-primary" /> 特定商取引法に基づく表記
            </CardTitle>
            <p className="text-sm text-muted-foreground">Legal Notice (Specified Commercial Transactions Act)</p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableBody>
                  {legalItems.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-bold bg-slate-50 w-1/3">{item.label}</TableCell>
                      <TableCell className="text-slate-600">{item.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="mt-8 text-sm text-muted-foreground">
              Note: This information is required by Japanese law for businesses offering digital services. Please ensure the placeholders are replaced with your actual business details before public launch.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
