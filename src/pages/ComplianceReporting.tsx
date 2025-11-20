import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, CheckCircle } from "lucide-react"

export default function ComplianceReporting() {
  const reports = [
    { name: "GDPR Compliance Report", date: "Nov 2025", status: "compliant" },
    { name: "Data Security Audit", date: "Oct 2025", status: "compliant" },
    { name: "Privacy Impact Assessment", date: "Sep 2025", status: "review" },
  ]

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Compliance Reporting</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Compliance Status</CardTitle>
          <CardDescription>Overall compliance health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="font-semibold text-lg">Fully Compliant</p>
              <p className="text-sm text-muted-foreground">All requirements met</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">GDPR</p>
              <p className="font-semibold">Compliant</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">CCPA</p>
              <p className="font-semibold">Compliant</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Reports</CardTitle>
          <CardDescription>Download and review compliance reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-muted-foreground">{report.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={report.status === "compliant" ? "default" : "secondary"}>
                    {report.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
