import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function RetentionManagement() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Data Retention Management</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Retention Policies</CardTitle>
          <CardDescription>Configure data retention settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-delete">Auto-delete old recordings</Label>
              <p className="text-sm text-muted-foreground">Delete recordings older than 1 year</p>
            </div>
            <Switch id="auto-delete" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="archive">Archive inactive data</Label>
              <p className="text-sm text-muted-foreground">Move unused data to cold storage</p>
            </div>
            <Switch id="archive" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="backup">Automatic backups</Label>
              <p className="text-sm text-muted-foreground">Create daily backups</p>
            </div>
            <Switch id="backup" defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Storage Overview</CardTitle>
          <CardDescription>Current storage usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Recordings</span>
              <span className="font-semibold">45 GB</span>
            </div>
            <div className="flex justify-between">
              <span>Photos</span>
              <span className="font-semibold">23 GB</span>
            </div>
            <div className="flex justify-between">
              <span>Backups</span>
              <span className="font-semibold">12 GB</span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>80 GB / 100 GB</span>
              </div>
            </div>
            <Button className="w-full">Upgrade Storage</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
