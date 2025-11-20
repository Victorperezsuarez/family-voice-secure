import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Rocket, Server, Globe } from "lucide-react"

export default function VelaDeployment() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Vela Deployment</h1>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Deployment Status</CardTitle>
              <CardDescription>Current deployment information</CardDescription>
            </div>
            <Badge className="bg-green-600">Active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Server Status</p>
                <p className="text-sm text-muted-foreground">Running on Vercel</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Domain</p>
                <p className="text-sm text-muted-foreground">your-app.vercel.app</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Rocket className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Last Deployment</p>
                <p className="text-sm text-muted-foreground">Nov 20, 2025 at 2:00 AM</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deployment Actions</CardTitle>
          <CardDescription>Manage your deployment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full">
            <Rocket className="w-4 h-4 mr-2" />
            Deploy New Version
          </Button>
          <Button variant="outline" className="w-full">View Logs</Button>
          <Button variant="outline" className="w-full">Rollback Deployment</Button>
        </CardContent>
      </Card>
    </div>
  )
}
