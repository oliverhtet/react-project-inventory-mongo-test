"use server"

import { connectToDatabase } from "@/lib/db"
import { Cart } from "@/lib/models/cart"
import { Product } from "@/lib/models/product"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// Helper to get or create a user ID for the cart
async function getUserId() {
  const cookieStore = await cookies()
  let userId = cookieStore.get("userId")?.value

  if (!userId) {
    userId = Math.random().toString(36).substring(2, 15)
    cookieStore.set("userId", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })
  }

  return userId
}

export async function getCart() {
  try {
    await connectToDatabase()

    const userId = getUserId()

    let cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      model: Product,
    })

    if (!cart) {
      cart = { items: [] }
    }

    return {
      items: cart.items.map((item: any) => ({
        product: {
          ...item.product.toObject(),
          _id: item.product._id.toString(),
          createdAt: item.product.createdAt.toISOString(),
          updatedAt: item.product.updatedAt.toISOString(),
        },
        quantity: item.quantity,
      })),
    }
  } catch (error) {
    console.error("Failed to fetch cart:", error)
    throw new Error("Failed to fetch cart")
  }
}

export async function addToCart(productId: string, quantity = 1) {
  try {
    await connectToDatabase()

    const userId = getUserId()

    // Check if product exists and has enough stock
    const product = await Product.findById(productId)

    if (!product) {
      throw new Error("Product not found")
    }

    if (product.stock < quantity) {
      throw new Error("Not enough stock")
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: userId })

    if (!cart) {
      cart = new Cart({ user: userId, items: [] })
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex((item: any) => item.product.toString() === productId)

    if (existingItemIndex > -1) {
      // Update quantity if product already in cart
      cart.items[existingItemIndex].quantity += quantity
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        quantity,
      })
    }

    await cart.save()

    revalidatePath("/cart")

    return { success: true }
  } catch (error) {
    console.error("Failed to add to cart:", error)
    throw new Error("Failed to add to cart")
  }
}

export async function updateCartItemQuantity(productId: string, quantity: number) {
  try {
    await connectToDatabase()

    const userId = getUserId()

    // Check if product exists and has enough stock
    const product = await Product.findById(productId)

    if (!product) {
      throw new Error("Product not found")
    }

    if (product.stock < quantity) {
      throw new Error("Not enough stock")
    }

    // Update cart item quantity
    await Cart.findOneAndUpdate(
      {
        user: userId,
        "items.product": productId,
      },
      {
        $set: { "items.$.quantity": quantity },
      },
    )

    revalidatePath("/cart")

    return { success: true }
  } catch (error) {
    console.error("Failed to update cart item quantity:", error)
    throw new Error("Failed to update cart item quantity")
  }
}

export async function removeFromCart(productId: string) {
  try {
    await connectToDatabase()

    const userId = getUserId()

    // Remove item from cart
    await Cart.findOneAndUpdate({ user: userId }, { $pull: { items: { product: productId } } })

    revalidatePath("/cart")

    return { success: true }
  } catch (error) {
    console.error("Failed to remove from cart:", error)
    throw new Error("Failed to remove from cart")
  }
}

export async function clearCart() {
  try {
    await connectToDatabase()

    const userId = getUserId()

    // Clear all items from cart
    await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } })

    revalidatePath("/cart")

    return { success: true }
  } catch (error) {
    console.error("Failed to clear cart:", error)
    throw new Error("Failed to clear cart")
  }
}

