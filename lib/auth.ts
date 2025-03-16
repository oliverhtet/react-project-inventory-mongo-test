import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/db"
import  User  from "@/lib/models/user"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Generate JWT token with user role included
export function generateToken(userId: string, role: string) {
  return jwt.sign({ userId, role }, JWT_SECRET, {
    expiresIn: "7d", // Token expires in 7 days
  })
}

// Verify JWT token
export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
    return {
      success: true,
      userId: decoded.userId,
      role: decoded.role,
    }
  } catch (error) {
    return { success: false, error: "Invalid token" }
  }
}

// Check if user is authenticated (for API routes)
export async function isAuthenticated(request: NextRequest) {
  // Get token from cookies
  const token = request.cookies.get("token")?.value

  if (!token) {
    return { success: false, error: "No token provided" }
  }

  // Verify token
  return verifyToken(token)
}

// Check if user is admin (for API routes)
export function isAdmin(tokenData: { success: boolean; userId?: string; role?: string }) {
  if (!tokenData.success) {
    return false
  }

  return tokenData.role === "admin"
}

// Get user by ID (for server components and API routes)
export async function getUserById(userId: string) {
  try {
    await connectToDatabase()

    const user = await User.findById(userId).lean()

    if (!user) {
      return null
    }

    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

