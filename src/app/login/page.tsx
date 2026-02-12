import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Car } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="bg-primary p-2 rounded-lg text-white">
              <Car className="w-6 h-6" />
            </div>
            <span className="text-2xl font-headline font-bold tracking-tight text-primary">CarCheck Flow</span>
          </Link>
          <h1 className="text-3xl font-headline font-bold">Merchant Portal</h1>
          <p className="text-muted-foreground">Login to manage your vehicle reminders</p>
        </div>

        <Card className="border-none shadow-2xl">
          <CardHeader>
            <CardTitle className="font-headline">Sign In</CardTitle>
            <CardDescription>Enter your email and password to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="shop@example.com" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-primary hover:underline font-medium">Forgot password?</Link>
              </div>
              <Input id="password" type="password" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Link href="/dashboard" className="w-full">
              <Button className="w-full font-headline font-bold bg-primary py-6">Login</Button>
            </Link>
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account? <Link href="/register" className="text-primary font-bold hover:underline">Register your shop</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
