"use client"

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Calendar, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, orderBy } from 'firebase/firestore';
import { format, addDays, differenceInDays, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function RemindersPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Find the merchant owned by this user
  const merchantsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'merchants'),
      where('ownerId', '==', user.uid),
      limit(1)
    );
  }, [firestore, user]);

  const { data: merchants } = useCollection(merchantsQuery);
  const activeMerchant = merchants?.[0];

  // 2. Query vehicles for reminders
  const vehiclesQuery = useMemoFirebase(() => {
    if (!firestore || !activeMerchant) return null;
    return query(
      collection(firestore, 'merchants', activeMerchant.id, 'vehicles'),
      orderBy('inspectionDate', 'asc')
    );
  }, [firestore, activeMerchant]);

  const { data: vehicles, isLoading } = useCollection(vehiclesQuery);

  const upcomingReminders = useMemo(() => {
    if (!vehicles) return [];
    const today = new Date();
    return vehicles
      .map(v => {
        const expiry = parseISO(v.inspectionDate);
        const daysLeft = differenceInDays(expiry, today);
        return { ...v, daysLeft };
      })
      .filter(v => v.daysLeft >= 0 && v.daysLeft <= 90);
  }, [vehicles]);

  const handleManualTrigger = async () => {
    setIsProcessing(true);
    try {
      // For the prototype, we trigger the local API route
      const response = await fetch('/api/cron/reminders');
      const result = await response.json();
      
      toast({
        title: "Reminders Processed",
        description: `Successfully sent ${result.results?.sent || 0} notifications.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Process Failed",
        description: "Could not trigger the reminder engine.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Reminder Engine</h1>
          <p className="text-muted-foreground">Automated LINE notifications based on inspection expiration dates.</p>
        </div>
        <Button 
          className="bg-primary font-bold gap-2" 
          onClick={handleManualTrigger}
          disabled={isProcessing || upcomingReminders.length === 0}
        >
          {isProcessing ? <Loader2 className="animate-spin" /> : <Send size={18} />}
          Process Today's Reminders
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase text-muted-foreground flex items-center gap-2">
              <Clock size={16} />
              Upcoming (90 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-headline font-bold">{upcomingReminders.length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase text-amber-700 flex items-center gap-2">
              <AlertCircle size={16} />
              Critical (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-headline font-bold text-amber-700">
              {upcomingReminders.filter(r => r.daysLeft <= 30).length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase text-green-700 flex items-center gap-2">
              <CheckCircle2 size={16} />
              Avg. Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-headline font-bold text-green-700">64%</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="font-headline">Scheduled Notifications</CardTitle>
          <CardDescription>Customers queued for automated LINE reminders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading schedules...</div>
            ) : upcomingReminders.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-xl">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">No reminders scheduled for the next 90 days.</p>
              </div>
            ) : upcomingReminders.map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between p-4 rounded-xl border bg-white/50 hover:bg-white transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${reminder.daysLeft <= 30 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="font-bold">{reminder.modelName || 'Vehicle'}</p>
                    <p className="text-xs text-muted-foreground">LINE ID: {reminder.lineUserId?.substring(0, 8)}...</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase text-muted-foreground">Expires In</p>
                    <p className={`font-headline font-bold ${reminder.daysLeft <= 30 ? 'text-destructive' : 'text-foreground'}`}>
                      {reminder.daysLeft} Days
                    </p>
                  </div>
                  <Badge variant={reminder.daysLeft <= 30 ? "destructive" : "secondary"} className="uppercase font-bold tracking-tighter">
                    {reminder.daysLeft <= 30 ? "Urgent" : "Soft Reminder"}
                  </Badge>
                  <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                    <ChevronRight size={18} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
