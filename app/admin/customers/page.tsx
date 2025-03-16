import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminCustomersPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Customers</h1>

      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Customer management functionality will be implemented soon.</p>
        </CardContent>
      </Card>
    </div>
  )
}

