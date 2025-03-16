"use server"

import { connectToDatabase } from "@/lib/db"
import { Product } from "@/lib/models/product"
import { Order } from "@/lib/models/order"
import  User  from "@/lib/models/user"

export async function getDashboardData() {
  try {
    await connectToDatabase()

    // Get counts
    const productCount = await Product.countDocuments()
    const orderCount = await Order.countDocuments()
    const userCount = await User.countDocuments()

    // Get recent orders
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).lean()

    // Get low stock products
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .sort({ stock: 1 })
      .limit(5)
      .lean()

    // Calculate total revenue
    const orders = await Order.find().lean()
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)

    // Get sales by category
    const products = await Product.find().lean()
    const categories = [...new Set(products.map((product) => product.category))]

    const salesByCategory = {}
    for (const category of categories) {
      const productsInCategory = products.filter((product) => product.category === category)
      const productIds = productsInCategory.map((product) => product._id.toString())

      let categoryRevenue = 0
      for (const order of orders) {
        for (const item of order.items) {
          if (productIds.includes(item.product.toString())) {
            categoryRevenue += item.price * item.quantity
          }
        }
      }

      salesByCategory[category] = categoryRevenue
    }

    return {
      counts: {
        products: productCount,
        orders: orderCount,
        users: userCount,
      },
      recentOrders: recentOrders.map((order) => ({
        ...order,
        _id: order._id.toString(),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      })),
      lowStockProducts: lowStockProducts.map((product) => ({
        ...product,
        _id: product._id.toString(),
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      })),
      revenue: {
        total: totalRevenue,
        byCategory: salesByCategory,
      },
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    throw new Error("Failed to fetch dashboard data")
  }
}

