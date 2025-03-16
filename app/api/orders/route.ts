import { connectToDatabase } from "@/lib/db"
import { Order } from "@/lib/models/order"
import { type NextRequest, NextResponse } from "next/server"
import { isAuthenticated, isAdmin } from "@/lib/auth"

// GET all orders (admin) or user orders (customer)
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const authResult = await isAuthenticated(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Check if user is admin
    const adminCheck = await isAdmin(authResult.userId)

    // Build query based on user role
    const query = adminCheck ? {} : { user: authResult.userId }

    // Execute query
    const orders = await Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

    // Get total count for pagination
    const total = await Order.countDocuments(query)

    return NextResponse.json({
      orders: orders.map((order) => ({
        ...order,
        _id: order._id.toString(),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

// POST create a new order
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const authResult = await isAuthenticated(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const data = await request.json()

    // Validate required fields
    const requiredFields = ["items", "total", "shippingAddress", "paymentMethod"]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Create new order
    const order = new Order({
      ...data,
      user: authResult.userId,
      status: "pending",
    })

    await order.save()

    return NextResponse.json(
      {
        message: "Order created successfully",
        order: {
          ...order.toObject(),
          _id: order._id.toString(),
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString(),
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

