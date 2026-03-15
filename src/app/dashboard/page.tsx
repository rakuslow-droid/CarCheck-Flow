"use client"; // クライアント側でデータを取得するために必要

import { useEffect, useState } from "react";
import { initializeFirebase } from "@/firebase/init";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, Clock, Users, AlertCircle, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// 車両データの型定義
interface Vehicle {
  id: string;
  plateNumber: string;
  inspectionDate: string;
  status: string;
}

export default function DashboardOverview() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { firestore, auth } = initializeFirebase();
    if (!firestore || !auth) return;

    // 1. ログインユーザーの状態を監視
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 2. ログインユーザーのIDに紐づく車両データを取得
        // ※ テスト用に固定IDを使用。本来は user.uid を使用します。
        const merchantId = "soOG3EGzFjJlQIIDozoB";
        const vehiclesRef = collection(
          firestore,
          "merchants",
          merchantId,
          "vehicles",
        );
        const q = query(vehiclesRef, orderBy("createdAt", "desc"));

        const unsubscribeVehicles = onSnapshot(q, (snapshot) => {
          const vehicleData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Vehicle[];

          setVehicles(vehicleData);
          setLoading(false);
        });

        return () => unsubscribeVehicles();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 統計データ（車両数は取得したデータの数に連動）
  const stats = [
    {
      label: "Total Vehicles",
      value: vehicles.length.toString(),
      icon: <Car className="text-blue-500" />,
      trend: "Real-time",
    },
    {
      label: "Active Reminders",
      value: "342",
      icon: <Clock className="text-amber-500" />,
      trend: "+5 today",
    },
    {
      label: "Customers",
      value: "892",
      icon: <Users className="text-indigo-500" />,
      trend: "+3% this month",
    },
    {
      label: "Completion Rate",
      value: "94%",
      icon: <AlertCircle className="text-green-500" />,
      trend: "Target: 90%",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-bold text-foreground">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground">
            Welcome back. Here's what's happening today.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-background group-hover:bg-primary/5">
                  {stat.icon}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium uppercase">
                  {stat.label}
                </p>
                <p className="text-2xl font-headline font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Recent Vehicle Inspections</CardTitle>
              <CardDescription>
                Latest vehicle data extracted via LINE AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p>Loading vehicles...</p>
                ) : vehicles.length === 0 ? (
                  <p className="text-muted-foreground">
                    No vehicles found in Firestore.
                  </p>
                ) : (
                  vehicles.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between p-4 rounded-xl border bg-white/50 hover:bg-white transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-primary">
                          <Car size={20} />
                        </div>
                        <div>
                          <p className="font-bold">Vehicle: {v.plateNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            ID: {v.id}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-6">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-medium">
                            Expires On
                          </p>
                          <p className="font-medium text-sm">
                            {v.inspectionDate}
                          </p>
                        </div>
                        <Badge className="font-headline text-[10px] uppercase tracking-wider">
                          {v.status || "Upcoming"}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-sm bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="font-headline font-bold text-lg">
                Reminder Efficiency
              </CardTitle>
              <CardDescription className="text-primary-foreground/70">
                Performance of your automated LINE flows
              </CardDescription>
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
              <Button
                variant="secondary"
                className="w-full font-headline font-bold mt-2"
              >
                View Detailed Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
