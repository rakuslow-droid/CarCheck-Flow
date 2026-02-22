"use client"

export const dynamic = 'force-dynamic';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  Plus, 
  Car, 
  Calendar, 
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  Upload
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, where } from 'firebase/firestore';

export default function VehiclesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [search, setSearch] = useState('');

  // Use collectionGroup to find all 'vehicles' subcollections across all merchants
  // that belong to this owner. This matches the security rules perfectly.
  const vehiclesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collectionGroup(firestore, 'vehicles'),
      where('merchantOwnerId', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: vehicles, isLoading } = useCollection(vehiclesQuery);

  const filteredVehicles = useMemo(() => {
    if (!vehicles) return [];
    return vehicles.filter(v => 
      v.plateNumber?.toLowerCase().includes(search.toLowerCase()) ||
      v.modelName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [vehicles, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Vehicles & Reminders</h1>
          <p className="text-muted-foreground">Manage your customer's vehicle database and inspection schedules.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Manual Upload
          </Button>
          <Button className="bg-primary">
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search plate or model..." 
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-headline font-bold">Vehicle Model</TableHead>
                  <TableHead className="font-headline font-bold">Plate Number</TableHead>
                  <TableHead className="font-headline font-bold">Inspection Date</TableHead>
                  <TableHead className="font-headline font-bold">Status</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Loading vehicles...</TableCell></TableRow>
                ) : filteredVehicles.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">No vehicles found. Ask customers to scan your QR code!</TableCell></TableRow>
                ) : filteredVehicles.map((v) => (
                  <TableRow key={v.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                          <Car size={16} />
                        </div>
                        <span className="font-medium">{v.modelName || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-white">{v.plateNumber || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-muted-foreground" />
                        <span>{v.inspectionDate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {v.status === 'Healthy' && (
                        <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-tight">
                          <CheckCircle2 size={14} /> Healthy
                        </div>
                      )}
                      {v.status === 'Upcoming' && (
                        <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-tight">
                          <Calendar size={14} /> Upcoming
                        </div>
                      )}
                      {v.status === 'Critical' && (
                        <div className="flex items-center gap-2 text-destructive font-bold text-xs uppercase tracking-tight">
                          <AlertTriangle size={14} /> Critical
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            View Document
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive gap-2">
                            Remove Vehicle
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
