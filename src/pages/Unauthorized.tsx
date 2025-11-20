import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { ShieldAlert } from "lucide-react"

export default function Unauthorized() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <ShieldAlert className="w-24 h-24 mx-auto mb-6 text-destructive" />
        <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
        <p className="text-lg text-muted-foreground mb-8">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
