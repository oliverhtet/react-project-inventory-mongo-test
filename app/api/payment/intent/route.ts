import { connectToDatabase } from "@/lib/db"
import { Cart } from "@/lib/models/cart"
import { Product } from "@/lib/models/product"
import { type NextRequest, NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
import Stripe from "stripe"

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const authResult = await isAuthenticated(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Get cart items
    const cart = await Cart.findOne({ user: authResult.userId }).populate({
      path: "items.product",
      model: Product,
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    // Calculate total
    const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

    // Add shipping if total is less than $50
    const shipping = total > 50 ? 0 : 5.99
    const orderTotal = total + shipping

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(orderTotal * 100), // Convert to cents
      currency: "usd",
      metadata: {
        userId: authResult.userId,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
}

