
"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, ShieldCheck, Zap, Loader2, AlertCircle } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function BillingPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const merchantQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'merchants'),
      where('ownerId', '==', user.uid),
      limit(1)
    );
  }, [firestore, user]);

  const { data: merchants, isLoading: isMerchantLoading } = useCollection(merchantQuery);
  const merchant = merchants?.[0];

  const handleSubscribe = async () => {
    if (!merchant) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: merchant.id,
          ownerId: user?.uid,
        }),
      });

      const { url, error } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error(error);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Checkout Error",
        description: error.message || "Could not initialize Stripe Checkout.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = merchant?.subscriptionStatus === 'active';

  if (isMerchantLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-headline font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your plan and payment settings to keep your AI automated.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className={`border-2 ${isActive ? 'border-primary shadow-lg' : 'border-border shadow-sm'}`}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-headline">Pro Monthly Plan</CardTitle>
                <CardDescription>Full access to AI extraction and LINE automation</CardDescription>
              </div>
              <Badge variant={isActive ? "default" : "secondary"} className="uppercase font-bold">
                {isActive ? "Active Plan" : "Available"}
              </Badge>
            </div>
            <div className="mt-4">
              <span className="text-4xl font-headline font-bold">¥5,000</span>
              <span className="text-muted-foreground ml-2">/ month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <ul className="space-y-3">
              {[
                "Unlimited AI Document Extractions",
                "Automated LINE Reminders",
                "Administrative LINE Commands",
                "Unlimited Vehicle Records",
                "Priority Email Support"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <Check size={18} className="text-green-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            {!isActive ? (
              <Button 
                onClick={handleSubscribe} 
                disabled={isLoading}
                className="w-full h-12 font-bold bg-primary text-lg"
              >
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Zap className="mr-2 h-5 w-5" />}
                Upgrade to Pro
              </Button>
            ) : (
              <Button variant="outline" className="w-full h-12 font-bold" disabled>
                Manage in Stripe Portal
              </Button>
            )}
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-accent/5">
            <CardHeader>
              <CardTitle className="text-lg font-headline flex items-center gap-2">
                <ShieldCheck size={20} className="text-primary" />
                Subscription Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Current Plan</span>
                <span className="font-bold">{isActive ? "Pro Monthly" : "Free (Limited)"}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Status</span>
                <span className={`font-bold uppercase ${isActive ? 'text-green-600' : 'text-amber-600'}`}>
                  {merchant?.subscriptionStatus || "none"}
                </span>
              </div>
              {!isActive && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex gap-3">
                  <AlertCircle className="text-amber-600 shrink-0" size={18} />
                  <p className="text-xs text-amber-700 leading-relaxed font-medium">
                    Your features are currently limited. Upgrade to activate AI extraction and automated LINE messaging.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-headline flex items-center gap-2">
                <CreditCard size={20} className="text-primary" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground italic">
                {isActive ? "Payment info is managed securely via Stripe." : "No payment method on file."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
