export interface Product {
  _id: string
  name: string
  description: string
  price: number
  image?: string
  category: string
  featured: boolean
  stock: number
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Cart {
  items: CartItem[]
}

export interface OrderItem {
  productId: string
  quantity: number
  price: number
}

export interface Order {
  _id: string
  firstName: string
  lastName: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  paymentMethod: string
  items: OrderItem[]
  total: number
  status: string
  createdAt: string
  updatedAt: string
}

