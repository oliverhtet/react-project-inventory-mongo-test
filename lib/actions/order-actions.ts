"use server"

import { connectToDatabase } from "@/lib/db"
import { Order } from "@/lib/models/order"
import { Cart } from "@/lib/models/cart"
import { Product } from "@/lib/models/product"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { clearCart } from "./cart-actions"

// Helper to get user ID
function getUserId() {
  const cookieStore = cookies()
  return cookieStore.get("userId")?.value
}

export async function createOrder(orderData: any) {
  try {
    await connectToDatabase()

    const userId = getUserId()

    if (!userId) {
      throw new Error("User not authenticated")
    }

    // Get cart items
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      model: Product,
    })

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty")
    }

    // Calculate total
    const total = cart.items.reduce((sum: number, item: any) => sum + item.product.price * item.quantity, 0)

    // Add shipping if total is less than $50
    const shipping = total > 50 ? 0 : 5.99
    const orderTotal = total + shipping

    // Create order items
    const orderItems = cart.items.map((item: any) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    }))

    // Create order
    const order = new Order({
      user: userId,
      ...orderData,
      items: orderItems,
      total: orderTotal,
    })

    await order.save()

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } })
    }

    // Clear cart
    await clearCart()

    revalidatePath("/checkout/success")

    return {
      success: true,
      orderId: order._id.toString(),
    }
  } catch (error) {
    console.error("Failed to create order:", error)
    throw new Error("Failed to create order")
  }
}

export async function getLatestOrder() {
  try {
    await connectToDatabase()

    const userId = getUserId()

    if (!userId) {
      throw new Error("User not authenticated")
    }

    const order = await Order.findOne({ user: userId }).sort({ createdAt: -1 }).lean()

    if (!order) {
      return null
    }

    return {
      ...order,
      _id: order._id.toString(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }
  } catch (error) {
    console.error("Failed to fetch order:", error)
    throw new Error("Failed to fetch order")
  }
}

export async function getOrders() {
  try {
    await connectToDatabase()

    const userId = getUserId()

    if (!userId) {
      throw new Error("User not authenticated")
    }

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).lean()

    return orders.map((order) => ({
      ...order,
      _id: order._id.toString(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }))
  } catch (error) {
    console.error("Failed to fetch orders:", error)
    throw new Error("Failed to fetch orders")
  }
}

