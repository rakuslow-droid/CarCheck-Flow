
"use client"

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Shield, Bell, User, ExternalLink, RefreshCw, QrCode, Copy, Save, Loader2, Download } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where, limit, doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { QRCodeCanvas } from 'qrcode.react';

export default function SettingsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // Merchant state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inviteCode: '',
  });

  const merchantQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'merchants'),
      where('ownerId', '==', user.uid),
      limit(1)
    );
  }, [firestore, user]);

  const { data: merchants, isLoading: isLoadingMerchant } = useCollection(merchantQuery);
  const merchant = merchants?.[0];

  useEffect(() => {
    if (merchant) {
      setFormData({
        name: merchant.name || merchant.displayName || '',
        email: merchant.email || '',
        inviteCode: merchant.inviteCode || '',
      });
    }
  }, [merchant]);

  const handleSaveProfile = async () => {
    if (!firestore || !user) return;
    setIsSaving(true);

    try {
      if (merchant) {
        const merchantRef = doc(firestore, 'merchants', merchant.id);
        updateDocumentNonBlocking(merchantRef, {
          ...formData,
          updatedAt: serverTimestamp(),
        });
      } else {
        const merchantsRef = collection(firestore, 'merchants');
        await addDocumentNonBlocking(merchantsRef, {
          ...formData,
          ownerId: user.uid,
          createdAt: serverTimestamp(),
        });
      }
      
      toast({
        title: "Settings Saved",
        description: "Your shop profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "There was an error updating your profile.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Generate LINE URL with ref parameter
  const lineBotId = "@carcheck_flow";
  const inviteCode = formData.inviteCode || merchant?.id || "default";
  const lineBotUrl = `https://line.me/R/ti/p/${lineBotId}?ref=${encodeURIComponent(inviteCode)}`;

  const downloadQRCode = () => {
    const canvas = document.getElementById('merchant-qr-code') as HTMLCanvasElement;
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `CarCheck-Flow-QR-${inviteCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "QR Code Downloaded",
      description: "You can now print this code for your shop.",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Link Copied",
      description: "URL has been copied to your clipboard.",
    });
  };

  if (isLoadingMerchant) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-headline font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your shop profile, team access, and LINE integration credentials.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-xl w-full sm:w-auto overflow-x-auto justify-start">
          <TabsTrigger value="profile" className="rounded-lg px-6">Profile</TabsTrigger>
          <TabsTrigger value="integration" className="rounded-lg px-6">Integration</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg px-6">Reminders</TabsTrigger>
          <TabsTrigger value="customer-entry" className="rounded-lg px-6">Customer Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <User size={20} className="text-primary" />
                Shop Profile
              </CardTitle>
              <CardDescription>Update your shop's public identity and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shop-name">Shop Name</Label>
                  <Input 
                    id="shop-name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Minato Auto Service" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shop-email">Contact Email</Label>
                  <Input 
                    id="shop-email" 
                    type="email"
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="shop@example.com" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-code">Shop Invite Code (Used for QR Tracking)</Label>
                <div className="flex gap-2">
                  <Input 
                    id="invite-code" 
                    value={formData.inviteCode} 
                    onChange={(e) => setFormData({...formData, inviteCode: e.target.value})}
                    placeholder="MINATO-2024" 
                  />
                  <Button variant="outline" size="icon" title="Generate New Code" onClick={() => setFormData({...formData, inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase()})}>
                    <RefreshCw size={16} />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">This code is embedded in your QR code to track referrals.</p>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t pt-6 bg-muted/10 rounded-b-lg">
              <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="customer-entry" className="space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 pb-8">
              <div className="flex items-center gap-2 mb-2">
                <QrCode className="text-primary" />
                <CardTitle className="font-headline">Customer Registration</CardTitle>
              </div>
              <CardDescription>
                Place this QR code in your shop for customers to link their vehicle inspection data via LINE.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center gap-12 pt-8">
              <div className="bg-white p-6 rounded-2xl shadow-xl border-4 border-primary/10 flex flex-col items-center gap-4">
                <div ref={qrRef} className="p-2 bg-white">
                  <QRCodeCanvas 
                    id="merchant-qr-code"
                    value={lineBotUrl} 
                    size={240}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                      src: "https://picsum.photos/seed/car/40/40",
                      x: undefined,
                      y: undefined,
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                </div>
                <div className="text-center">
                  <Badge className="bg-primary text-white font-bold">SCAN TO JOIN</Badge>
                </div>
              </div>
              <div className="space-y-6 flex-1 w-full">
                <div className="space-y-2">
                  <h4 className="font-bold text-lg">Direct Link</h4>
                  <p className="text-sm text-muted-foreground">Share this link directly with customers or use it in email campaigns.</p>
                  <div className="flex gap-2">
                    <Input value={lineBotUrl} readOnly className="bg-muted/50 font-mono text-[10px]" />
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(lineBotUrl)}>
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                  <p className="text-sm font-bold flex items-center gap-2 mb-2">
                    <MessageSquare size={16} className="text-primary" />
                    How it works
                  </p>
                  <ol className="text-xs space-y-2 text-muted-foreground list-decimal list-inside">
                    <li>Customer scans the QR code to add your shop on LINE.</li>
                    <li>They send a photo of their inspection certificate or sticker.</li>
                    <li>Our AI extracts the date and adds them to your dashboard.</li>
                    <li>Referral tag <strong>{inviteCode}</strong> is automatically recorded.</li>
                  </ol>
                </div>
                <Button className="w-full bg-primary font-bold gap-2 h-12" onClick={downloadQRCode}>
                  <Download size={18} />
                  Download QR Kit (.png)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="font-headline flex items-center gap-2">
                    <MessageSquare size={20} className="text-primary" />
                    LINE Messaging API
                  </CardTitle>
                  <CardDescription>Connect your shop's LINE Official Account</CardDescription>
                </div>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold">Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-xl border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase text-muted-foreground">Webhook URL</p>
                  <code className="text-sm break-all">https://carcheck-flow.web.app/api/line-webhook</code>
                </div>
                <Button variant="ghost" size="sm" className="gap-2 whitespace-nowrap" onClick={() => copyToClipboard("https://carcheck-flow.web.app/api/line-webhook")}>
                  Copy URL <ExternalLink size={14} />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">Deployment Region: asia-northeast1 (Tokyo)</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Bell size={20} className="text-primary" />
                Reminder Schedules
              </CardTitle>
              <CardDescription>Configure when customers receive LINE notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border">
                  <div className="space-y-1">
                    <p className="font-bold">3 Month Warning</p>
                    <p className="text-sm text-muted-foreground">Initial soft reminder about upcoming inspection</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border">
                  <div className="space-y-1">
                    <p className="font-bold">1 Month Critical Reminder</p>
                    <p className="text-sm text-muted-foreground">Urgent reminder with direct booking link</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border">
                  <div className="space-y-1">
                    <p className="font-bold">7 Day Final Alert</p>
                    <p className="text-sm text-muted-foreground">Final notice before legal expiration</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
