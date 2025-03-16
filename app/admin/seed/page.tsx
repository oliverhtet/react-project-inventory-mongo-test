"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SeedPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [forceReset, setForceReset] = useState(false)

  const handleSeed = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch(`/api/seed?force=${forceReset}`)
      const data = await response.json()

      setResult(data)

      if (response.ok) {
        toast({
          title: "Success",
          description: "Database seeded successfully!",
        })
      } else {
        toast({
          title: "Error",
          description: data.message || data.error || "Failed to seed database",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error seeding database:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Database Seed Tool</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Seed Database</CardTitle>
          <CardDescription>
            This tool will populate your database with sample data for testing and development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="force-reset"
              checked={forceReset}
              onCheckedChange={(checked) => setForceReset(checked as boolean)}
            />
            <label
              htmlFor="force-reset"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Force reset (will delete existing data)
            </label>
          </div>

          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              If you check &quot;Force reset&quot;, all existing data will be deleted before seeding. Only use this
              option in development or testing environments.
            </AlertDescription>
          </Alert>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
              {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>
                {result.message}
                {result.counts && (
                  <div className="mt-2">
                    <p>Created {result.counts.users} users</p>
                    <p>Created {result.counts.products} products</p>
                    <p>Created {result.counts.orders} orders</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSeed} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding...
              </>
            ) : (
              "Seed Database"
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Admin Credentials</CardTitle>
          <CardDescription>Use these credentials to log in as an admin after seeding the database.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium">Email:</div>
              <div className="col-span-2">admin@example.com</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium">Password:</div>
              <div className="col-span-2">admin123</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

