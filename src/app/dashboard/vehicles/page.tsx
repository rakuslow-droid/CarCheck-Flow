"use client"

import { useState } from 'react';
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
  FileText,
  Upload
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { extractInspectionDateFromImage } from '@/ai/flows/extract-inspection-date-from-image-flow';
import { useToast } from '@/hooks/use-toast';

export default function VehiclesPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const vehicles = [
    { id: '1', customer: 'Ken Tanaka', model: 'Toyota RAV4', plate: 'SHI-2022', inspection: '2024-11-20', status: 'Healthy' },
    { id: '2', customer: 'Yumi Ito', model: 'Honda N-BOX', plate: 'K-9912', inspection: '2024-06-05', status: 'Critical' },
    { id: '3', customer: 'Hiroshi Sato', model: 'Nissan X-Trail', plate: 'T-5510', inspection: '2025-02-14', status: 'Healthy' },
    { id: '4', customer: 'Maki Suzuki', model: 'Mazda CX-5', plate: 'M-3321', inspection: '2024-09-30', status: 'Upcoming' },
    { id: '5', customer: 'Toru Yamamoto', model: 'Lexus RX', plate: 'L-0001', inspection: '2024-05-12', status: 'Healthy' },
  ];

  const handleSimulateExtraction = async () => {
    setIsProcessing(true);
    toast({
      title: "Processing Image",
      description: "Gemini AI is analyzing the inspection document...",
    });

    try {
      // In a real app, this would be a data URI from a file upload or LINE event
      // Using a placeholder base64-like string for the demo
      const result = await extractInspectionDateFromImage({ 
        imageDataUri: 'data:image/jpeg;base64,mock' 
      });
      
      toast({
        title: "Extraction Complete",
        description: `Found inspection date: ${result.inspectionDate || 'Not found'}. Confidence: ${Math.round((result.confidence || 0) * 100)}%`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extract data from image.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Vehicles & Reminders</h1>
          <p className="text-muted-foreground">Manage your customer's vehicle database and inspection schedules.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSimulateExtraction} disabled={isProcessing}>
            <Upload className="mr-2 h-4 w-4" />
            {isProcessing ? 'Processing...' : 'Simulate AI Extraction'}
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
                placeholder="Search plate, model or customer..." 
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
              <Button variant="outline" size="sm">
                Export
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
                  <TableHead className="font-headline font-bold">Customer</TableHead>
                  <TableHead className="font-headline font-bold">Inspection Date</TableHead>
                  <TableHead className="font-headline font-bold">Status</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((v) => (
                  <TableRow key={v.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                          <Car size={16} />
                        </div>
                        <span className="font-medium">{v.model}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-white">{v.plate}</Badge>
                    </TableCell>
                    <TableCell>{v.customer}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-muted-foreground" />
                        <span>{v.inspection}</span>
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
                            <FileText size={14} /> View Document
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Calendar size={14} /> Edit Schedule
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
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">Showing {vehicles.length} of {vehicles.length} vehicles</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
