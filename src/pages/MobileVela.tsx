import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Smartphone, Download, QrCode } from "lucide-react"

export default function MobileVela() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Mobile Vela</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Mobile App</CardTitle>
          <CardDescription>Access Vela on your mobile device</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center text-center py-8">
            <Smartphone className="w-16 h-16 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Download the Mobile App</h3>
            <p className="text-muted-foreground mb-6">
              Get the full Vela experience on iOS and Android
            </p>
            <div className="flex gap-3">
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Download for iOS
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download for Android
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
          <CardDescription>Scan QR code to access on mobile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-6">
            <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center mb-4">
              <QrCode className="w-32 h-32 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Scan with your phone camera</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
