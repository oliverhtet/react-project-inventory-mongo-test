import Link from "next/link"
import Image from "next/image"
import type { Product } from "@/lib/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import AddToCartButton from "@/components/add-to-cart-button"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <Link href={`/products/${product._id}`} className="block">
        <div className="aspect-square relative bg-muted">
          <Image
            src={product.image || `/placeholder.svg?height=400&width=400`}
            alt={product.name}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/products/${product._id}`} className="block">
          <h3 className="font-medium line-clamp-1 hover:underline">{product.name}</h3>
        </Link>
        <div className="flex items-center justify-between mt-2">
          <span className="font-semibold">${product.price.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground">{product.category}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <AddToCartButton product={product} variant="secondary" />
      </CardFooter>
    </Card>
  )
}

