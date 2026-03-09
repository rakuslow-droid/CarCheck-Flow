"use client"

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
  Upload,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { useFirestore, useUser, useCollection, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, where, limit, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function VehiclesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  
  // States for Edit Modal
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    modelName: '',
    plateNumber: '',
    inspectionDate: '',
    status: 'Upcoming'
  });

  // States for Delete Alert
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<any>(null);

  // 1. Find the merchant owned by this user
  const merchantsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'merchants'),
      where('ownerId', '==', user.uid),
      limit(1)
    );
  }, [firestore, user]);

  const { data: merchants, isLoading: isLoadingMerchant } = useCollection(merchantsQuery);
  const activeMerchant = merchants?.[0];

  // 2. Query vehicles for the specific merchant
  const vehiclesQuery = useMemoFirebase(() => {
    if (!firestore || !activeMerchant) return null;
    return collection(firestore, 'merchants', activeMerchant.id, 'vehicles');
  }, [firestore, activeMerchant]);

  const { data: vehicles, isLoading: isLoadingVehicles } = useCollection(vehiclesQuery);

  const filteredVehicles = useMemo(() => {
    if (!vehicles) return [];
    const searchLower = search.toLowerCase();
    return vehicles.filter(v => 
      (v.plateNumber || '').toLowerCase().includes(searchLower) ||
      (v.modelName || '').toLowerCase().includes(searchLower)
    );
  }, [vehicles, search]);

  const handleEditClick = (vehicle: any) => {
    setEditingVehicle(vehicle);
    setEditFormData({
      modelName: vehicle.modelName || '',
      plateNumber: vehicle.plateNumber || '',
      inspectionDate: vehicle.inspectionDate || '',
      status: vehicle.status || 'Upcoming'
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateVehicle = () => {
    if (!firestore || !activeMerchant || !editingVehicle) return;

    const vehicleRef = doc(firestore, 'merchants', activeMerchant.id, 'vehicles', editingVehicle.id);
    updateDocumentNonBlocking(vehicleRef, editFormData);
    
    setIsEditDialogOpen(false);
    toast({
      title: "Vehicle Updated",
      description: "The vehicle record has been successfully modified.",
    });
  };

  const handleDeleteClick = (vehicle: any) => {
    setVehicleToDelete(vehicle);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!firestore || !activeMerchant || !vehicleToDelete) return;

    const vehicleRef = doc(firestore, 'merchants', activeMerchant.id, 'vehicles', vehicleToDelete.id);
    deleteDocumentNonBlocking(vehicleRef);
    
    setIsDeleteDialogOpen(false);
    toast({
      title: "Vehicle Deleted",
      description: "The vehicle record has been removed from your fleet.",
    });
  };

  const isLoading = isUserLoading || isLoadingMerchant || isLoadingVehicles;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
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
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading vehicle data...</TableCell></TableRow>
                ) : !activeMerchant && !isLoadingMerchant ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No shop profile found. Please set up your shop in Settings.</TableCell></TableRow>
                ) : filteredVehicles.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No vehicles found matching your search.</TableCell></TableRow>
                ) : filteredVehicles.map((v) => (
                  <TableRow key={v.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                          <Car size={16} />
                        </div>
                        <span className="font-medium">{v.modelName || 'Unknown Model'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-white">{v.plateNumber || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-muted-foreground" />
                        <span>{v.inspectionDate || 'Not set'}</span>
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
                          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleEditClick(v)}>
                            <Edit size={14} /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive gap-2 cursor-pointer" onClick={() => handleDeleteClick(v)}>
                            <Trash2 size={14} /> Delete Record
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

      {/* Edit Vehicle Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">Edit Vehicle Info</DialogTitle>
            <DialogDescription>
              Update the details for this vehicle. Changes are saved immediately to your database.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="model">Model Name</Label>
              <Input 
                id="model" 
                value={editFormData.modelName} 
                onChange={(e) => setEditFormData({...editFormData, modelName: e.target.value})} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="plate">Plate Number</Label>
              <Input 
                id="plate" 
                value={editFormData.plateNumber} 
                onChange={(e) => setEditFormData({...editFormData, plateNumber: e.target.value})} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Inspection Expiration Date</Label>
              <Input 
                id="date" 
                type="date"
                value={editFormData.inspectionDate} 
                onChange={(e) => setEditFormData({...editFormData, inspectionDate: e.target.value})} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateVehicle}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the vehicle record for 
              <span className="font-bold"> {vehicleToDelete?.modelName || 'this vehicle'}</span> and remove all associated reminder schedules.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleConfirmDelete}>
              Delete Vehicle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
