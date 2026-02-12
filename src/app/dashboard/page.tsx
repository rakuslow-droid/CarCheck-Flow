import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Car, 
  Calendar, 
  Users, 
  ArrowUpRight, 
  Clock, 
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function DashboardOverview() {
  const stats = [
    { label: 'Total Vehicles', value: '1,284', icon: <Car className="text-blue-500" />, trend: '+12% this month' },
    { label: 'Active Reminders', value: '342', icon: <Clock className="text-amber-500" />, trend: '+5 today' },
    { label: 'Customers', value: '892', icon: <Users className="text-indigo-500" />, trend: '+3% this month' },
    { label: 'Completion Rate', value: '94%', icon: <AlertCircle className="text-green-500" />, trend: 'Target: 90%' },
  ];

  const recentVehicles = [
    { id: '1', name: 'Toyota Prius', plate: 'ABC-123', expiry: '2024-08-15', status: 'Upcoming' },
    { id: '2', name: 'Honda Civic', plate: 'XYZ-789', expiry: '2024-06-20', status: 'Expiring Soon' },
    { id: '3', name: 'Nissan Leaf', plate: 'LEF-001', expiry: '2024-12-05', status: 'Active' },
    { id: '4', name: 'Subaru Impreza', plate: 'SUB-456', expiry: '2025-01-10', status: 'Active' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome back, Minato Auto Service. Here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Download Report</Button>
          <Button size="sm" className="bg-primary">Manage Reminders</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-background group-hover:bg-primary/5 transition-colors">
                  {stat.icon}
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-headline font-bold">{stat.value}</p>
              </div>
              <p className="text-xs text-green-600 mt-4 font-bold">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-headline font-bold">Recent Vehicle Inspections</CardTitle>
                <CardDescription>Latest vehicle data extracted via LINE AI</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-primary font-bold">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentVehicles.map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-4 rounded-xl border bg-white/50 hover:bg-white hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Car size={20} />
                      </div>
                      <div>
                        <p className="font-bold">{v.name}</p>
                        <p className="text-xs text-muted-foreground uppercase">{v.plate}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-6">
                      <div className="hidden sm:block">
                        <p className="text-xs text-muted-foreground uppercase font-medium">Expires On</p>
                        <p className="font-medium text-sm">{v.expiry}</p>
                      </div>
                      <Badge 
                        variant={v.status === 'Expiring Soon' ? 'destructive' : 'secondary'}
                        className="font-headline text-[10px] uppercase tracking-wider"
                      >
                        {v.status}
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

        {/* Sidebar Analytics Area */}
        <div className="space-y-8">
          <Card className="border-none shadow-sm bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="font-headline font-bold text-lg">Reminder Efficiency</CardTitle>
              <CardDescription className="text-primary-foreground/70">Performance of your automated LINE flows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Message Open Rate</span>
                  <span className="font-bold">92%</span>
                </div>
                <Progress value={92} className="h-2 bg-white/20" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Booking Conversion</span>
                  <span className="font-bold">68%</span>
                </div>
                <Progress value={68} className="h-2 bg-white/20" />
              </div>
              <Button variant="secondary" className="w-full font-headline font-bold mt-2">
                View Detailed Analytics
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline font-bold text-lg">LINE Integration Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Messaging API: Online</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Linked Customers</span>
                <span className="font-bold">842</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Messages Sent (Mo)</span>
                <span className="font-bold">2,410</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
