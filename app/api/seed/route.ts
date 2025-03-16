import { seedProducts } from "@/lib/actions/product-actions"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const result = await seedProducts()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 })
  }
}

