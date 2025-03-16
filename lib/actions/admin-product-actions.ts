"use server"

import { connectToDatabase } from "@/lib/db"
import { Product } from "@/lib/models/product"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

// Schema for product validation
const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  image: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  featured: z.boolean().default(false),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
})

export type ProductFormData = z.infer<typeof productSchema>

// Create a new product
export async function createProduct(formData: FormData) {
  try {
    await connectToDatabase()

    // Parse and validate form data
    const rawData = Object.fromEntries(formData.entries())
    const data = {
      ...rawData,
      featured: formData.get("featured") === "on",
      price: Number.parseFloat(formData.get("price") as string),
      stock: Number.parseInt(formData.get("stock") as string),
    }

    const validatedData = productSchema.parse(data)

    // Create new product
    const product = new Product(validatedData)
    await product.save()

    revalidatePath("/admin/products")
    redirect("/admin/products")
  } catch (error) {
    console.error("Failed to create product:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors }
    }
    return { success: false, error: "Failed to create product" }
  }
}

// Get all products with optional filtering
export async function getAdminProducts(query = "") {
  try {
    await connectToDatabase()

    let filter = {}
    if (query) {
      filter = {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { category: { $regex: query, $options: "i" } },
        ],
      }
    }

    const products = await Product.find(filter).sort({ createdAt: -1 }).lean()

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

// Get a single product by ID
export async function getProductForEdit(id: string) {
  try {
    await connectToDatabase()

    const product = await Product.findById(id).lean()

    if (!product) {
      throw new Error("Product not found")
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

// Update a product
export async function updateProduct(id: string, formData: FormData) {
  try {
    await connectToDatabase()

    // Parse and validate form data
    const rawData = Object.fromEntries(formData.entries())
    const data = {
      ...rawData,
      featured: formData.get("featured") === "on",
      price: Number.parseFloat(formData.get("price") as string),
      stock: Number.parseInt(formData.get("stock") as string),
    }

    const validatedData = productSchema.parse(data)

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(id, validatedData, { new: true })

    if (!updatedProduct) {
      throw new Error("Product not found")
    }

    revalidatePath("/admin/products")
    revalidatePath(`/products/${id}`)
    redirect("/admin/products")
  } catch (error) {
    console.error("Failed to update product:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors }
    }
    return { success: false, error: "Failed to update product" }
  }
}

// Delete a product
export async function deleteProduct(id: string) {
  try {
    await connectToDatabase()

    const result = await Product.findByIdAndDelete(id)

    if (!result) {
      throw new Error("Product not found")
    }

    revalidatePath("/admin/products")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete product:", error)
    return { success: false, error: "Failed to delete product" }
  }
}

