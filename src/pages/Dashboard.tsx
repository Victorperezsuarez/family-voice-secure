import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recordings</CardTitle>
            <CardDescription>Manage your audio recordings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/recordings")} className="w-full">
              View Recordings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
            <CardDescription>Browse your photo gallery</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/photos")} className="w-full">
              View Photos
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Family</CardTitle>
            <CardDescription>Manage family members</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/family")} className="w-full">
              View Family
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>View your story timeline</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/timeline")} className="w-full">
              View Timeline
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Collections</CardTitle>
            <CardDescription>Organize your memories</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/collections")} className="w-full">
              View Collections
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/profile")} className="w-full">
              Go to Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
