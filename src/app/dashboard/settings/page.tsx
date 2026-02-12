
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Shield, Bell, User, ExternalLink, RefreshCw, QrCode, Copy } from 'lucide-react';
import Image from 'next/image';

export default function SettingsPage() {
  const lineBotUrl = "https://line.me/R/ti/p/@carcheck_flow"; // Placeholder URL

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-headline font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your shop profile, team access, and LINE integration credentials.</p>
      </div>

      <Tabs defaultValue="integration" className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-xl w-full sm:w-auto overflow-x-auto justify-start">
          <TabsTrigger value="profile" className="rounded-lg px-6">Profile</TabsTrigger>
          <TabsTrigger value="integration" className="rounded-lg px-6">Integration</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg px-6">Reminders</TabsTrigger>
          <TabsTrigger value="customer-entry" className="rounded-lg px-6">Customer Entry</TabsTrigger>
        </TabsList>

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
              <div className="bg-white p-6 rounded-2xl shadow-xl border-4 border-primary/10">
                <Image 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(lineBotUrl)}`}
                  alt="LINE Registration QR Code"
                  width={250}
                  height={250}
                  className="rounded-lg"
                />
                <div className="mt-4 text-center">
                  <Badge className="bg-primary text-white font-bold">SCAN TO JOIN</Badge>
                </div>
              </div>
              <div className="space-y-6 flex-1">
                <div className="space-y-2">
                  <h4 className="font-bold text-lg">Direct Link</h4>
                  <p className="text-sm text-muted-foreground">Share this link directly with customers or use it in email campaigns.</p>
                  <div className="flex gap-2">
                    <Input value={lineBotUrl} readOnly className="bg-muted/50 font-mono text-xs" />
                    <Button variant="outline" size="icon">
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
                    <li>Automated reminders are scheduled based on your preferences.</li>
                  </ol>
                </div>
                <Button className="w-full bg-primary font-bold">Download QR Kit (.zip)</Button>
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
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="channel-id">Channel ID</Label>
                  <Input id="channel-id" value="1656784321" readOnly className="bg-muted/50" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="channel-secret">Channel Secret</Label>
                  <Input id="channel-secret" type="password" value="••••••••••••••••" readOnly className="bg-muted/50" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="access-token">Channel Access Token</Label>
                  <div className="flex gap-2">
                    <Input id="access-token" type="password" value="••••••••••••••••••••••••••••••••" readOnly className="bg-muted/50 flex-1" />
                    <Button variant="outline" size="icon">
                      <RefreshCw size={16} />
                    </Button>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Shield size={16} />
                  Webhook Settings
                </h4>
                <div className="p-4 rounded-xl border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase text-muted-foreground">Webhook URL</p>
                    <code className="text-sm">https://carcheck-flow.web.app/api/line-webhook</code>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-2">
                    Copy URL <ExternalLink size={14} />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">Region: asia-northeast1 (Tokyo)</p>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 py-4 flex justify-between">
              <p className="text-xs text-muted-foreground italic">Last verified: 2024-05-18 14:30 JST</p>
              <Button size="sm">Update Integration</Button>
            </CardFooter>
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
            <CardFooter className="justify-end">
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <User size={20} className="text-primary" />
                Shop Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shop-name">Display Name</Label>
                  <Input id="shop-name" defaultValue="Minato Auto Service" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shop-phone">Contact Phone</Label>
                  <Input id="shop-phone" defaultValue="03-1234-5678" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shop-address">Business Address</Label>
                <Input id="shop-address" defaultValue="1-2-3 Minato-ku, Tokyo, Japan" />
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button>Save Profile</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
