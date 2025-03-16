"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { getCart, updateCartItemQuantity, removeFromCart } from "@/lib/actions/cart-actions"
import type { Product } from "@/lib/types"

export default function CartPage() {
  const [cart, setCart] = useState<{ items: Array<{ product: Product; quantity: number }> }>({ items: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCart() {
      try {
        const cartData = await getCart()
        setCart(cartData)
      } catch (error) {
        console.error("Failed to load cart:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [])

  const handleQuantityChange = async (productId: string, quantity: number) => {
    if (quantity < 1) return

    try {
      await updateCartItemQuantity(productId, quantity)
      setCart((prevCart) => ({
        ...prevCart,
        items: prevCart.items.map((item) => (item.product._id === productId ? { ...item, quantity } : item)),
      }))
    } catch (error) {
      console.error("Failed to update quantity:", error)
    }
  }

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart(productId)
      setCart((prevCart) => ({
        ...prevCart,
        items: prevCart.items.filter((item) => item.product._id !== productId),
      }))
    } catch (error) {
      console.error("Failed to remove item:", error)
    }
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  const shipping = subtotal > 50 ? 0 : 5.99
  const total = subtotal + shipping

  if (loading) {
    return (
      <div className="container px-4 py-8 md:py-12">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (cart.items.length === 0) {
    return (
      <div className="container px-4 py-8 md:py-12">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <div className="divide-y">
                {cart.items.map((item) => (
                  <div key={item.product._id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-24 h-24 relative rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={item.product.image || `/placeholder.svg?height=96&width=96`}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col sm:flex-row justify-between">
                      <div>
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)}</p>
                      </div>

                      <div className="flex items-center gap-4 mt-4 sm:mt-0">
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(item.product._id, Number.parseInt(e.target.value) || 1)
                            }
                            className="h-8 w-12 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-l-none"
                            onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.product._id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-lg border bg-card p-6 sticky top-4">
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-medium text-base">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <Link href="/checkout">
                <Button className="w-full gap-2">
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>

            <div className="mt-6 text-xs text-muted-foreground">
              <p>Free shipping on orders over $50</p>
              <p>30-day return policy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

