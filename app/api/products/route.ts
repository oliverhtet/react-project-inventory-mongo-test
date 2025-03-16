import { connectToDatabase } from "@/lib/db"
import { Product } from "@/lib/models/product"
import { type NextRequest, NextResponse } from "next/server"
import { isAuthenticated, isAdmin } from "@/lib/auth"

// GET all products with filtering, sorting, and pagination
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const sort = searchParams.get("sort")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")

    // Build query
    const query: any = {}

    if (category) {
      query.category = category
    }

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    if (minPrice || maxPrice) {
      query.price = {}

      if (minPrice) {
        query.price.$gte = Number.parseFloat(minPrice)
      }

      if (maxPrice) {
        query.price.$lte = Number.parseFloat(maxPrice)
      }
    }

    // Build sort
    let sortOptions = {}

    if (sort) {
      switch (sort) {
        case "price-asc":
          sortOptions = { price: 1 }
          break
        case "price-desc":
          sortOptions = { price: -1 }
          break
        case "newest":
          sortOptions = { createdAt: -1 }
          break
        case "name-asc":
          sortOptions = { name: 1 }
          break
        case "name-desc":
          sortOptions = { name: -1 }
          break
        default:
          sortOptions = { createdAt: -1 }
      }
    } else {
      sortOptions = { createdAt: -1 }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Execute query
    const products = await Product.find(query).sort(sortOptions).skip(skip).limit(limit).lean()

    // Get total count for pagination
    const total = await Product.countDocuments(query)

    return NextResponse.json({
      products: products.map((product) => ({
        ...product,
        _id: product._id.toString(),
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

// POST create a new product (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const authResult = await isAuthenticated(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin using the role from the token
    if (!isAdmin(authResult)) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    await connectToDatabase()

    const data = await request.json()

    // Validate required fields
    const requiredFields = ["name", "description", "price", "category", "stock"]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Create new product
    const product = new Product(data)
    await product.save()

    return NextResponse.json(
      {
        message: "Product created successfully",
        product: {
          ...product.toObject(),
          _id: product._id.toString(),
          createdAt: product.createdAt.toISOString(),
          updatedAt: product.updatedAt.toISOString(),
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

