import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Shield, Bell, User, ExternalLink, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-headline font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your shop profile, team access, and LINE integration credentials.</p>
      </div>

      <Tabs defaultValue="integration" className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="profile" className="rounded-lg px-6">Profile</TabsTrigger>
          <TabsTrigger value="integration" className="rounded-lg px-6">Integration</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg px-6">Reminders</TabsTrigger>
          <TabsTrigger value="team" className="rounded-lg px-6">Team</TabsTrigger>
        </TabsList>

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
                    <code className="text-sm">https://carcheck-flow-api.web.app/line-webhook</code>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-2">
                    Copy URL <ExternalLink size={14} />
                  </Button>
                </div>
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
