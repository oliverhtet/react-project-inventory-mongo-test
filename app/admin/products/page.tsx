import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { getAdminProducts } from "@/lib/actions/admin-product-actions"
import ProductsTable from "./products-table"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { query?: string }
}) {
  const query = searchParams.query || ""
  const products = await getAdminProducts(query)

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link href="/admin/products/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <Suspense fallback={<ProductsTableSkeleton />}>
        <ProductsTable products={products} />
      </Suspense>
    </div>
  )
}

function ProductsTableSkeleton() {
  return (
    <div className="rounded-md border">
      <div className="p-4">
        <Skeleton className="h-10 w-full mb-4" />
        <div className="space-y-2">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
        </div>
      </div>
    </div>
  )
}

