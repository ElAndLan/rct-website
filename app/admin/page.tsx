
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Ticket, Users, Calendar, Megaphone } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Shows
            </CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              +1 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Auditions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              12 Signups today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Members
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <p className="text-xs text-muted-foreground">
              +18 this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              News Posts
            </CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Last post 2 days ago
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               {/* Placeholder for activity feed */}
               <div className="flex items-center gap-4 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <p>New audition signup: <strong>Sarah Jones</strong> for <em>SpongeBob Musical</em></p>
                  <span className="ml-auto text-muted-foreground text-xs">2m ago</span>
               </div>
               <div className="flex items-center gap-4 text-sm">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <p>Page updated: <strong>About Us</strong></p>
                  <span className="ml-auto text-muted-foreground text-xs">1h ago</span>
               </div>
               <div className="flex items-center gap-4 text-sm">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <p>New sponsor added: <strong>Local Coffee Shop</strong></p>
                  <span className="ml-auto text-muted-foreground text-xs">3h ago</span>
               </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
           <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
           </CardHeader>
           <CardContent className="space-y-2">
             <div className="p-3 border rounded-md hover:bg-muted cursor-pointer transition-colors flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                <span>Post News Announcement</span>
             </div>
             <div className="p-3 border rounded-md hover:bg-muted cursor-pointer transition-colors flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                <span>Add New Show</span>
             </div>
           </CardContent>
        </Card>
      </div>
    </div>
  )
}
