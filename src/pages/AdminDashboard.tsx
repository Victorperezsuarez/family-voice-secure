import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Database, Activity, DollarSign } from "lucide-react"

export default function AdminDashboard() {
  const stats = [
    { title: "Total Users", value: "1,234", icon: Users, change: "+12%" },
    { title: "Storage Used", value: "456 GB", icon: Database, change: "+8%" },
    { title: "Active Sessions", value: "89", icon: Activity, change: "+5%" },
    { title: "Revenue", value: "$12,345", icon: DollarSign, change: "+15%" }
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-green-600">{stat.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-muted-foreground">User action {i}</span>
                  <span className="ml-auto text-xs">{i}m ago</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Monitor system status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>API Status</span>
                <span className="text-green-600 font-semibold">Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Database</span>
                <span className="text-green-600 font-semibold">Healthy</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Storage</span>
                <span className="text-yellow-600 font-semibold">Warning</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
