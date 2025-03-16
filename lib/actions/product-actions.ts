"use server"

import { connectToDatabase } from "@/lib/db"
import { Product } from "@/lib/models/product"
import { revalidatePath } from "next/cache"

interface GetProductsOptions {
  featured?: boolean
  category?: string
  sort?: string
  minPrice?: number
  maxPrice?: number
  limit?: number
}

export async function getProducts(options: GetProductsOptions = {}) {
  try {
    await connectToDatabase()

    const query: any = {}

    if (options.featured !== undefined) {
      query.featured = options.featured
    }

    if (options.category) {
      query.category = options.category
    }

    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      query.price = {}

      if (options.minPrice !== undefined) {
        query.price.$gte = options.minPrice
      }

      if (options.maxPrice !== undefined) {
        query.price.$lte = options.maxPrice
      }
    }

    let productsQuery = Product.find(query)

    if (options.sort) {
      switch (options.sort) {
        case "price-asc":
          productsQuery = productsQuery.sort({ price: 1 })
          break
        case "price-desc":
          productsQuery = productsQuery.sort({ price: -1 })
          break
        case "newest":
          productsQuery = productsQuery.sort({ createdAt: -1 })
          break
        default:
          break
      }
    }

    if (options.limit) {
      productsQuery = productsQuery.limit(options.limit)
    }

    const products = await productsQuery.lean()

    return products.map((product) => ({
      ...product,
      _id: product._id.toString(),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }))
  } catch (error) {
    console.error("Failed to fetch products:", error)
    throw new Error("Failed to fetch products")
  }
}

export async function getProductById(id: string) {
  try {
    await connectToDatabase()

    const product = await Product.findById(id).lean()

    if (!product) {
      return null
    }

    return {
      ...product,
      _id: product._id.toString(),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }
  } catch (error) {
    console.error("Failed to fetch product:", error)
    throw new Error("Failed to fetch product")
  }
}

export async function getRelatedProducts(category: string, excludeId: string, limit = 4) {
  try {
    await connectToDatabase()

    const products = await Product.find({
      category,
      _id: { $ne: excludeId },
    })
      .limit(limit)
      .lean()

    return products.map((product) => ({
      ...product,
      _id: product._id.toString(),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }))
  } catch (error) {
    console.error("Failed to fetch related products:", error)
    throw new Error("Failed to fetch related products")
  }
}

// This function is for seeding the database with sample products
export async function seedProducts() {
  try {
    await connectToDatabase()

    // Check if products already exist
    const count = await Product.countDocuments()

    if (count > 0) {
      return { success: true, message: "Products already exist" }
    }

    const sampleProducts = [
      {
        name: "Wireless Headphones",
        description: "Premium wireless headphones with noise cancellation and long battery life.",
        price: 199.99,
        image: "/placeholder.svg?height=400&width=400",
        category: "Electronics",
        featured: true,
        stock: 50,
      },
      {
        name: "Smart Watch",
        description: "Track your fitness, receive notifications, and more with this stylish smart watch.",
        price: 249.99,
        image: "/placeholder.svg?height=400&width=400",
        category: "Electronics",
        featured: true,
        stock: 30,
      },
      {
        name: "Cotton T-Shirt",
        description: "Comfortable and breathable cotton t-shirt for everyday wear.",
        price: 24.99,
        image: "/placeholder.svg?height=400&width=400",
        category: "Clothing",
        featured: false,
        stock: 100,
      },
      {
        name: "Denim Jeans",
        description: "Classic denim jeans with a modern fit.",
        price: 59.99,
        image: "/placeholder.svg?height=400&width=400",
        category: "Clothing",
        featured: true,
        stock: 75,
      },
      {
        name: "Coffee Maker",
        description: "Programmable coffee maker with a built-in grinder for the freshest coffee.",
        price: 129.99,
        image: "/placeholder.svg?height=400&width=400",
        category: "Home & Kitchen",
        featured: true,
        stock: 25,
      },
      {
        name: "Non-Stick Cookware Set",
        description: "Complete set of non-stick cookware for all your cooking needs.",
        price: 149.99,
        image: "/placeholder.svg?height=400&width=400",
        category: "Home & Kitchen",
        featured: false,
        stock: 20,
      },
      {
        name: "Facial Cleanser",
        description: "Gentle facial cleanser for all skin types.",
        price: 19.99,
        image: "/placeholder.svg?height=400&width=400",
        category: "Beauty",
        featured: false,
        stock: 60,
      },
      {
        name: "Moisturizing Cream",
        description: "Hydrating moisturizing cream for dry skin.",
        price: 29.99,
        image: "/placeholder.svg?height=400&width=400",
        category: "Beauty",
        featured: false,
        stock: 45,
      },
    ]

    await Product.insertMany(sampleProducts)

    revalidatePath("/")
    revalidatePath("/products")

    return { success: true, message: "Products seeded successfully" }
  } catch (error) {
    console.error("Failed to seed products:", error)
    throw new Error("Failed to seed products")
  }
}

