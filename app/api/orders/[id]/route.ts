import { connectToDatabase } from "@/lib/db"
import { Order } from "@/lib/models/order"
import { type NextRequest, NextResponse } from "next/server"
import { isAuthenticated, isAdmin } from "@/lib/auth"

// GET a single order
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated
    const authResult = await isAuthenticated(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Find order by ID
    const order = await Order.findById(params.id).lean()

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if user is admin or the order belongs to the user
    const adminCheck = await isAdmin(authResult.userId)
    if (!adminCheck && order.user.toString() !== authResult.userId) {
      return NextResponse.json({ error: "Forbidden: You do not have permission to view this order" }, { status: 403 })
    }

    return NextResponse.json({
      ...order,
      _id: order._id.toString(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

// PUT update order status (admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated and is an admin
    const authResult = await isAuthenticated(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminCheck = await isAdmin(authResult.userId)
    if (!adminCheck) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    await connectToDatabase()

    const { status } = await request.json()

    // Validate status
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
    }

    // Find and update order
    const order = await Order.findByIdAndUpdate(params.id, { status }, { new: true, runValidators: true }).lean()

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Order updated successfully",
      order: {
        ...order,
        _id: order._id.toString(),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}

