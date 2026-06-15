import { create } from 'zustand'

export interface CartItem {
  productId: number
  barcode: string
  name: string
  price: number
  quantity: number
  discount: number
  subtotal: number
  unit: string
}

export interface Member {
  id: number
  phone: string
  name: string
  level: string
  points: number
  total_spent: number
  birthday?: string
}

export interface Coupon {
  id: number
  code: string
  name: string
  type: 'fixed' | 'percent'
  value: number
  min_amount: number
}

interface PosState {
  cart: CartItem[]
  currentMember: Member | null
  selectedCoupon: Coupon | null
  usePoints: boolean
  pointsUsed: number
  addItem: (product: any, quantity?: number) => void
  updateQuantity: (index: number, quantity: number) => void
  updateDiscount: (index: number, discount: number) => void
  removeItem: (index: number) => void
  clearCart: () => void
  setMember: (member: Member | null) => void
  setSelectedCoupon: (coupon: Coupon | null) => void
  setUsePoints: (use: boolean, points?: number) => void
  restoreCart: (items: CartItem[], member?: Member | null) => void
  getTotals: () => {
    totalAmount: number
    discountAmount: number
    pointsDeducted: number
    couponDeducted: number
    payableAmount: number
  }
}

export const usePosStore = create<PosState>((set, get) => ({
  cart: [],
  currentMember: null,
  selectedCoupon: null,
  usePoints: false,
  pointsUsed: 0,

  addItem: (product, quantity = 1) => {
    const cart = [...get().cart]
    const existingIndex = cart.findIndex(item => item.productId === product.id)
    
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity
      cart[existingIndex].subtotal = 
        cart[existingIndex].price * cart[existingIndex].quantity * (cart[existingIndex].discount / 100)
    } else {
      cart.push({
        productId: product.id,
        barcode: product.barcode,
        name: product.name,
        price: product.price,
        quantity,
        discount: 100,
        subtotal: product.price * quantity,
        unit: product.unit || '件'
      })
    }
    set({ cart })
  },

  updateQuantity: (index, quantity) => {
    if (quantity <= 0) {
      get().removeItem(index)
      return
    }
    const cart = [...get().cart]
    cart[index].quantity = quantity
    cart[index].subtotal = cart[index].price * quantity * (cart[index].discount / 100)
    set({ cart })
  },

  updateDiscount: (index, discount) => {
    const cart = [...get().cart]
    cart[index].discount = Math.max(0, Math.min(100, discount))
    cart[index].subtotal = cart[index].price * cart[index].quantity * (cart[index].discount / 100)
    set({ cart })
  },

  removeItem: (index) => {
    const cart = get().cart.filter((_, i) => i !== index)
    set({ cart })
  },

  clearCart: () => {
    set({ 
      cart: [], 
      currentMember: null, 
      selectedCoupon: null, 
      usePoints: false, 
      pointsUsed: 0 
    })
  },

  setMember: (member) => {
    set({ currentMember: member, selectedCoupon: null, usePoints: false, pointsUsed: 0 })
  },

  setSelectedCoupon: (coupon) => {
    set({ selectedCoupon: coupon })
  },

  setUsePoints: (use, points) => {
    if (use) {
      const member = get().currentMember
      const totals = get().getTotals()
      const maxPoints = member ? Math.min(member.points, Math.floor(totals.totalAmount * 100)) : 0
      set({ usePoints: true, pointsUsed: points ? Math.min(points, maxPoints) : maxPoints })
    } else {
      set({ usePoints: false, pointsUsed: 0 })
    }
  },

  restoreCart: (items, member = null) => {
    set({ cart: items, currentMember: member, selectedCoupon: null, usePoints: false, pointsUsed: 0 })
  },

  getTotals: () => {
    const { cart, selectedCoupon, usePoints, pointsUsed } = get()
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const lineDiscount = cart.reduce((sum, item) => sum + (item.price * item.quantity - item.subtotal), 0)
    
    let couponDeducted = 0
    if (selectedCoupon) {
      const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
      if (subtotal >= selectedCoupon.min_amount) {
        if (selectedCoupon.type === 'fixed') {
          couponDeducted = Math.min(selectedCoupon.value, subtotal)
        } else {
          couponDeducted = subtotal * (selectedCoupon.value / 100)
        }
      }
    }
    
    const pointsDeducted = usePoints ? (pointsUsed / 100) : 0
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
    const payableAmount = Math.max(0, subtotal - couponDeducted - pointsDeducted)
    
    return {
      totalAmount,
      discountAmount: lineDiscount + couponDeducted + pointsDeducted,
      pointsDeducted,
      couponDeducted,
      payableAmount
    }
  }
}))

interface AppState {
  currentShift: any
  cashierName: string
  setCurrentShift: (shift: any) => void
  setCashierName: (name: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentShift: null,
  cashierName: '收银员001',
  setCurrentShift: (shift) => set({ currentShift: shift }),
  setCashierName: (name) => set({ cashierName: name })
}))
