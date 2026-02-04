"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { SessionProvider } from "next-auth/react";

function AdminGuardContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
       router.push("/api/auth/signin?callbackUrl=/admin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
       <div className="h-screen w-full flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
    );
  }

  if (status === "unauthenticated") {
      return null; // Will redirect
  }
  
  // Check role if needed. Assuming 'role' is on user object.
  // Note: Types might need extension in next-auth.d.ts but for now we cast or ignore
  // @ts-ignore
  if (session?.user?.role !== "ADMIN") {
       return (
           <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-background">
               <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
               <p className="text-muted-foreground">You do not have permission to view this page.</p>
               <button 
                  onClick={() => router.push("/")}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
               >
                  Go Home
               </button>
           </div>
       )
  }

  return <>{children}</>;
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
   return (
       <SessionProvider>
           <AdminGuardContent>{children}</AdminGuardContent>
       </SessionProvider>
   )
}
