import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingBag, ArrowRight } from "lucide-react"
import FeaturedProducts from "@/components/featured-products"
import { getProducts } from "@/lib/actions/product-actions"

export default async function Home() {
  const products = await getProducts({ featured: true, limit: 4 })

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-12 md:py-24 lg:py-32 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Shop the Latest Products
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Discover our curated collection of high-quality products at competitive prices.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/products">
                <Button size="lg" className="gap-2">
                  Shop Now <ShoppingBag className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Featured Products</h2>
              <p className="text-muted-foreground">Our most popular items handpicked for you</p>
            </div>
            <Link href="/products" className="flex items-center gap-1 text-primary">
              View all products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8">
            <FeaturedProducts products={products} />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-24 bg-muted/50">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl mb-8 text-center">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {["Electronics", "Clothing", "Home & Kitchen", "Beauty"].map((category) => (
              <Link
                key={category}
                href={`/products?category=${category.toLowerCase().replace(" & ", "-")}`}
                className="group relative overflow-hidden rounded-lg bg-background shadow-md transition-all hover:shadow-lg"
              >
                <div className="aspect-square bg-muted/20 flex items-center justify-center">
                  <div className="text-2xl font-medium group-hover:text-primary transition-colors">{category}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

