export const dynamic = 'force-dynamic';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
      <div className="text-center space-y-4">
        <div className="bg-primary/10 p-4 rounded-full inline-block mb-4">
          <div className="bg-primary p-3 rounded-xl text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
          </div>
        </div>
        <h1 className="text-4xl font-headline font-bold text-primary">CarCheck Flow</h1>
        <p className="text-xl text-muted-foreground">Server Connectivity Test: <span className="text-green-600 font-bold">Successful</span></p>
        <div className="mt-8 flex gap-4 justify-center">
          <a href="/login" className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors">Merchant Login</a>
          <a href="/dashboard" className="px-6 py-3 border border-primary text-primary rounded-lg font-bold hover:bg-primary/5 transition-colors">Go to Dashboard</a>
        </div>
      </div>
    </div>
  );
}
