import { getProductById, getRelatedProducts } from "@/lib/actions/product-actions"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import ProductCard from "@/components/product-card"
import AddToCartButton from "@/components/add-to-cart-button"

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.category, product._id)

  return (
    <div className="container px-4 py-8 md:py-12">
      <Link href="/products" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
          <Image
            src={product.image || `/placeholder.svg?height=600&width=600`}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl font-semibold mt-2">${product.price.toFixed(2)}</p>
          <div className="mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
            {product.category}
          </div>

          <div className="mt-6 prose">
            <p>{product.description}</p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-4">
              <AddToCartButton product={product} />
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Free shipping on orders over $50</p>
              <p>30-day return policy</p>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

