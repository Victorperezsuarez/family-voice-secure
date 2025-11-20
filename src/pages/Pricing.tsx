import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for getting started",
      features: ["5 recordings per month", "1 GB storage", "Basic features", "Community support"]
    },
    {
      name: "Pro",
      price: "$9.99",
      description: "For serious users",
      features: ["Unlimited recordings", "50 GB storage", "Advanced AI features", "Priority support", "Family sharing"]
    },
    {
      name: "Enterprise",
      price: "$29.99",
      description: "For organizations",
      features: ["Everything in Pro", "Unlimited storage", "Custom branding", "Dedicated support", "API access"]
    }
  ]

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground">Choose the plan that's right for you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <Card key={index} className={index === 1 ? "border-primary shadow-lg scale-105" : ""}>
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant={index === 1 ? "default" : "outline"}>
                Get Started
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
