import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function BillingPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Billing & Subscription</h1>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Manage your subscription</CardDescription>
            </div>
            <Badge>Pro Plan</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly cost</span>
              <span className="font-semibold">$9.99</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Next billing date</span>
              <span className="font-semibold">Dec 20, 2025</span>
            </div>
            <div className="flex gap-3 pt-4">
              <Button>Upgrade Plan</Button>
              <Button variant="outline">Cancel Subscription</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>View your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">Nov {20 - i}, 2025</p>
                  <p className="text-sm text-muted-foreground">Pro Plan</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">$9.99</p>
                  <Button variant="link" size="sm">Download</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
