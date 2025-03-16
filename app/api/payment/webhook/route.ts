import { connectToDatabase } from "@/lib/db"
import { Order } from "@/lib/models/order"
import { Cart } from "@/lib/models/cart"
import { Product } from "@/lib/models/product"
import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

// This is your Stripe webhook secret for testing your endpoint locally
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  const payload = await request.text()
  const sig = request.headers.get("stripe-signature") as string

  let event

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret!)
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Handle the event
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent

    try {
      await connectToDatabase()

      const userId = paymentIntent.metadata.userId

      // Get cart items
      const cart = await Cart.findOne({ user: userId }).populate({
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

      // Create order items
      const orderItems = cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      }))

      // Create order
      const order = new Order({
        user: userId,
        items: orderItems,
        total: orderTotal,
        status: "processing",
        paymentId: paymentIntent.id,
        paymentMethod: "stripe",
      })

      await order.save()

      // Update product stock
      for (const item of cart.items) {
        await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } })
      }

      // Clear cart
      await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } })

      return NextResponse.json({ received: true })
    } catch (error) {
      console.error("Error processing payment:", error)
      return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}

export const config = {
  api: {
    bodyParser: false,
  },
}

