import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminOrdersPage() {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Orders</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Order Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Order management functionality will be implemented soon.</p>
                </CardContent>
            </Card>
        </div>
    )
}

