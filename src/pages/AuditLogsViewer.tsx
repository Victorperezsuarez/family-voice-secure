import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

export default function AuditLogsViewer() {
  const [search, setSearch] = useState("")

  const logs = [
    { id: 1, action: "User Login", user: "john@example.com", timestamp: "2025-11-20 02:05", status: "success" },
    { id: 2, action: "File Upload", user: "jane@example.com", timestamp: "2025-11-20 02:03", status: "success" },
    { id: 3, action: "Password Change", user: "bob@example.com", timestamp: "2025-11-20 02:00", status: "success" },
    { id: 4, action: "Failed Login", user: "unknown@example.com", timestamp: "2025-11-20 01:58", status: "failed" },
    { id: 5, action: "Data Export", user: "admin@example.com", timestamp: "2025-11-20 01:55", status: "success" },
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Audit Logs</h1>

      <Card>
        <CardHeader>
          <CardTitle>System Activity Logs</CardTitle>
          <CardDescription>Monitor all system activities and user actions</CardDescription>
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-4"
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{log.action}</p>
                  <p className="text-sm text-muted-foreground">{log.user}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{log.timestamp}</span>
                  <Badge variant={log.status === "success" ? "default" : "destructive"}>
                    {log.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
