"use client"

import { useState } from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { ShoppingCart, Check } from "lucide-react"
import { addToCart } from "@/lib/actions/cart-actions"
import type { Product } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

interface AddToCartButtonProps extends Omit<ButtonProps, "onClick"> {
  product: Product
}

export default function AddToCartButton({ product, ...props }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAdded, setIsAdded] = useState(false)

  const handleAddToCart = async () => {
    setIsLoading(true)

    try {
      await addToCart(product._id)
      setIsAdded(true)
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      })

      // Reset the button after 2 seconds
      setTimeout(() => {
        setIsAdded(false)
      }, 2000)
    } catch (error) {
      console.error("Failed to add to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleAddToCart} disabled={isLoading || isAdded} className="w-full" {...props}>
      {isLoading ? (
        <span className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Adding...
        </span>
      ) : isAdded ? (
        <span className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          Added to Cart
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </span>
      )}
    </Button>
  )
}

