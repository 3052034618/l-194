const mockData: any = {
  products: [
    { id: 1, barcode: '6901234567890', name: '农夫山泉矿泉水 550ml', category: '饮料', price: 2.00, cost: 1.00, stock: 200, shelf_location: 'A-01-01', unit: '瓶', is_promotion: 0, promotion_group: null, created_at: new Date().toISOString() },
    { id: 2, barcode: '6901234567891', name: '可口可乐 330ml', category: '饮料', price: 3.50, cost: 1.80, stock: 150, shelf_location: 'A-01-02', unit: '罐', is_promotion: 1, promotion_group: '饮料组合', created_at: new Date().toISOString() },
    { id: 3, barcode: '6901234567892', name: '百事可乐 330ml', category: '饮料', price: 3.50, cost: 1.80, stock: 150, shelf_location: 'A-01-03', unit: '罐', is_promotion: 1, promotion_group: '饮料组合', created_at: new Date().toISOString() },
    { id: 4, barcode: '6901234567893', name: '康师傅红烧牛肉面', category: '方便食品', price: 5.50, cost: 3.00, stock: 100, shelf_location: 'B-02-01', unit: '桶', is_promotion: 0, promotion_group: null, created_at: new Date().toISOString() },
    { id: 5, barcode: '6901234567894', name: '乐事薯片原味 75g', category: '零食', price: 8.50, cost: 4.50, stock: 80, shelf_location: 'C-01-01', unit: '袋', is_promotion: 1, promotion_group: '零食组合', created_at: new Date().toISOString() },
    { id: 6, barcode: '6901234567895', name: '奥利奥饼干原味 116g', category: '零食', price: 12.00, cost: 6.50, stock: 60, shelf_location: 'C-01-02', unit: '盒', is_promotion: 1, promotion_group: '零食组合', created_at: new Date().toISOString() },
    { id: 7, barcode: '6901234567896', name: '伊利纯牛奶 250ml', category: '乳制品', price: 3.80, cost: 2.50, stock: 120, shelf_location: 'D-01-01', unit: '盒', is_promotion: 0, promotion_group: null, created_at: new Date().toISOString() },
    { id: 8, barcode: '6901234567897', name: '蒙牛特仑苏 250ml', category: '乳制品', price: 6.50, cost: 4.00, stock: 80, shelf_location: 'D-01-02', unit: '盒', is_promotion: 0, promotion_group: null, created_at: new Date().toISOString() },
    { id: 9, barcode: '6901234567898', name: '金龙鱼调和油 5L', category: '粮油', price: 69.90, cost: 52.00, stock: 30, shelf_location: 'E-01-01', unit: '桶', is_promotion: 0, promotion_group: null, created_at: new Date().toISOString() },
    { id: 10, barcode: '6901234567899', name: '福临门大米 5kg', category: '粮油', price: 45.00, cost: 32.00, stock: 40, shelf_location: 'E-02-01', unit: '袋', is_promotion: 0, promotion_group: null, created_at: new Date().toISOString() },
    { id: 11, barcode: '6901234567900', name: '维达纸巾 3层10包', category: '日用', price: 28.00, cost: 18.00, stock: 50, shelf_location: 'F-01-01', unit: '提', is_promotion: 0, promotion_group: null, created_at: new Date().toISOString() },
    { id: 12, barcode: '6901234567901', name: '海飞丝洗发水 400ml', category: '日化', price: 39.90, cost: 25.00, stock: 45, shelf_location: 'G-01-01', unit: '瓶', is_promotion: 0, promotion_group: null, created_at: new Date().toISOString() },
    { id: 13, barcode: '6901234567902', name: '云南白药牙膏 180g', category: '日化', price: 29.80, cost: 18.00, stock: 60, shelf_location: 'G-02-01', unit: '支', is_promotion: 0, promotion_group: null, created_at: new Date().toISOString() },
    { id: 14, barcode: '6901234567903', name: '苹果 500g', category: '生鲜', price: 9.90, cost: 5.00, stock: 100, shelf_location: 'H-01-01', unit: '斤', is_promotion: 0, promotion_group: null, created_at: new Date().toISOString() },
    { id: 15, barcode: '6901234567904', name: '香蕉 500g', category: '生鲜', price: 5.50, cost: 3.00, stock: 80, shelf_location: 'H-01-02', unit: '斤', is_promotion: 0, promotion_group: null, created_at: new Date().toISOString() },
  ],
  members: [
    { id: 1, phone: '13800138000', name: '张三', level: '黄金会员', points: 2580, total_spent: 3580.50, birthday: '1990-05-15', created_at: new Date().toISOString() },
    { id: 2, phone: '13900139000', name: '李四', level: '普通会员', points: 320, total_spent: 680.00, birthday: '1995-10-20', created_at: new Date().toISOString() },
    { id: 3, phone: '13700137000', name: '王五', level: '钻石会员', points: 8960, total_spent: 12560.00, birthday: '1985-03-08', created_at: new Date().toISOString() },
  ],
  coupons: [
    { id: 1, code: 'CPN202401001', name: '满50减10', type: 'fixed', value: 10.00, min_amount: 50.00, member_id: 1, is_used: 0, expire_at: '2026-12-31', created_at: new Date().toISOString() },
    { id: 2, code: 'CPN202401002', name: '满100减20', type: 'fixed', value: 20.00, min_amount: 100.00, member_id: 1, is_used: 0, expire_at: '2026-12-31', created_at: new Date().toISOString() },
    { id: 3, code: 'CPN202401003', name: '9折优惠券', type: 'percent', value: 10.00, min_amount: 0, member_id: 2, is_used: 0, expire_at: '2026-12-31', created_at: new Date().toISOString() },
    { id: 4, code: 'CPN202401004', name: '满200减50', type: 'fixed', value: 50.00, min_amount: 200.00, member_id: 3, is_used: 0, expire_at: '2026-12-31', created_at: new Date().toISOString() },
    { id: 5, code: 'CPN202401005', name: '85折优惠券', type: 'percent', value: 15.00, min_amount: 0, member_id: 3, is_used: 0, expire_at: '2026-12-31', created_at: new Date().toISOString() },
  ],
  orders: [],
  order_items: [],
  returns: [],
  return_items: [],
  shifts: [],
  suspended_orders: [],
  member_transactions: []
}

let nextOrderId = 1
let nextItemId = 1
let nextReturnId = 1
let nextShiftId = 1
let nextSuspendId = 1
let nextTxId = 1
let nextMemberId = 4
let nextCouponId = 6

const shiftNo = 'S' + Date.now().toString().slice(-8)
mockData.shifts.push({
  id: nextShiftId++,
  shift_no: shiftNo,
  cashier: '收银员001',
  start_time: new Date().toISOString(),
  status: 'active',
  cash_amount: 0,
  mobile_amount: 0,
  total_sales: 0,
  order_count: 0,
  abnormal_count: 0,
  pending_refund_count: 0,
  created_at: new Date().toISOString()
})

function delay(ms = 100) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const mockApi = {
  product: {
    search: async (keyword: string) => {
      await delay()
      const kw = keyword.toLowerCase().trim()
      if (!kw) return [...mockData.products].reverse()
      return mockData.products.filter(p =>
        p.barcode.toLowerCase().includes(kw) ||
        p.name.toLowerCase().includes(kw) ||
        (p.category && p.category.toLowerCase().includes(kw))
      ).slice(0, 50)
    },
    byBarcode: async (barcode: string) => {
      await delay()
      return mockData.products.find(p => p.barcode === barcode.trim())
    },
    all: async () => {
      await delay()
      return [...mockData.products].reverse()
    },
    detail: async (id: number) => {
      await delay()
      return mockData.products.find(p => p.id === id)
    }
  },
  member: {
    byPhone: async (phone: string) => {
      await delay()
      return mockData.members.find(m => m.phone === phone.trim())
    },
    create: async (data: any) => {
      await delay()
      const newMember = {
        id: nextMemberId++,
        phone: data.phone,
        name: data.name,
        level: '普通会员',
        points: 0,
        total_spent: 0,
        birthday: data.birthday || null,
        created_at: new Date().toISOString()
      }
      mockData.members.push(newMember)
      return newMember
    },
    update: async (id: number, data: any) => {
      await delay()
      const m = mockData.members.find(m => m.id === id)
      if (m) {
        m.name = data.name
        m.phone = data.phone
        m.birthday = data.birthday || null
      }
      return m
    },
    coupons: async (memberId: number) => {
      await delay()
      const now = new Date().toISOString().split('T')[0]
      return mockData.coupons.filter(c =>
        c.member_id === memberId && c.is_used === 0 && (!c.expire_at || c.expire_at >= now)
      ).reverse()
    },
    transactions: async (memberId: number) => {
      await delay()
      return mockData.member_transactions.filter(t => t.member_id === memberId).reverse().slice(0, 50)
    }
  },
  coupon: {
    use: async (couponId: number) => {
      await delay()
      const c = mockData.coupons.find(c => c.id === couponId)
      if (c) c.is_used = 1
      return true
    }
  },
  order: {
    create: async (orderData: any) => {
      await delay(300)
      const { order, items, memberId, pointsUsed, couponUsed, couponId, shiftId } = orderData
      
      const orderId = nextOrderId++
      const orderNo = order.orderNo
      
      mockData.orders.push({
        id: orderId,
        order_no: orderNo,
        member_id: memberId || null,
        total_amount: order.totalAmount,
        discount_amount: order.discountAmount,
        points_deducted: pointsUsed || 0,
        coupon_deducted: couponUsed || 0,
        payable_amount: order.payableAmount,
        paid_amount: order.paidAmount,
        change_amount: order.changeAmount,
        payment_method: order.paymentMethod,
        status: 'completed',
        cashier: '收银员001',
        shift_id: shiftId,
        is_void: 0,
        created_at: new Date().toISOString()
      })

      for (const item of items) {
        mockData.order_items.push({
          id: nextItemId++,
          order_id: orderId,
          product_id: item.productId,
          product_name: item.name,
          barcode: item.barcode,
          price: item.price,
          quantity: item.quantity,
          discount: item.discount,
          subtotal: item.subtotal
        })
        const product = mockData.products.find((p: any) => p.id === item.productId)
        if (product) product.stock -= item.quantity
      }

      if (memberId) {
        const pointsEarned = Math.floor(order.payableAmount)
        const member = mockData.members.find((m: any) => m.id === memberId)
        if (member) {
          member.points = member.points + pointsEarned - (pointsUsed || 0)
          member.total_spent = member.total_spent + order.payableAmount
        }

        mockData.member_transactions.push({
          id: nextTxId++,
          member_id: memberId,
          type: 'purchase',
          amount: order.payableAmount,
          points: pointsEarned,
          order_no: orderNo,
          description: `消费获得${pointsEarned}积分`,
          created_at: new Date().toISOString()
        })
        if (pointsUsed && pointsUsed > 0) {
          mockData.member_transactions.push({
            id: nextTxId++,
            member_id: memberId,
            type: 'points_use',
            amount: 0,
            points: -pointsUsed,
            order_no: orderNo,
            description: `积分抵扣${(pointsUsed / 100).toFixed(2)}元`,
            created_at: new Date().toISOString()
          })
        }
      }

      if (couponId) {
        const coupon = mockData.coupons.find((c: any) => c.id === couponId)
        if (coupon) coupon.is_used = 1
      }

      return { orderId, orderNo }
    },
    byNo: async (orderNo: string) => {
      await delay()
      const order = mockData.orders.find((o: any) => o.order_no === orderNo.trim())
      if (!order) return null
      const items = mockData.order_items.filter((i: any) => i.order_id === order.id)
      if (order.member_id) {
        const m = mockData.members.find((mem: any) => mem.id === order.member_id)
        if (m) order.member = { id: m.id, name: m.name, phone: m.phone, level: m.level }
      }
      return { order, items }
    }
  },
  suspend: {
    create: async (data: any) => {
      await delay()
      const suspendNo = 'G' + Date.now().toString().slice(-8)
      mockData.suspended_orders.push({
        id: nextSuspendId++,
        suspend_no: suspendNo,
        items: JSON.stringify(data.items),
        member_id: data.memberId || null,
        created_at: new Date().toISOString()
      })
      return suspendNo
    },
    all: async () => {
      await delay()
      return [...mockData.suspended_orders].reverse()
    },
    delete: async (id: number) => {
      await delay()
      const idx = mockData.suspended_orders.findIndex((o: any) => o.id === id)
      if (idx >= 0) mockData.suspended_orders.splice(idx, 1)
      return true
    },
    get: async (id: number) => {
      await delay()
      return mockData.suspended_orders.find((o: any) => o.id === id)
    }
  },
  return: {
    create: async (data: any) => {
      await delay(300)
      const returnNo = 'R' + Date.now().toString().slice(-8)
      const returnId = nextReturnId++

      mockData.returns.push({
        id: returnId,
        return_no: returnNo,
        order_id: data.orderId,
        order_no: data.orderNo,
        type: data.type,
        status: data.status,
        amount: data.amount,
        reason: data.reason,
        shift_id: data.shiftId,
        cashier: '收银员001',
        created_at: new Date().toISOString()
      })

      for (const item of data.items) {
        mockData.return_items.push({
          id: nextItemId++,
          return_id: returnId,
          order_item_id: item.orderItemId,
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal
        })
        if (data.type !== 'exchange' && data.status === 'approved') {
          const product = mockData.products.find((p: any) => p.id === item.productId)
          if (product) product.stock += item.quantity
        }
      }
      return { returnId, returnNo }
    },
    list: async (status?: string) => {
      await delay()
      let results = [...mockData.returns].reverse()
      if (status) results = results.filter((r: any) => r.status === status)
      return results
    },
    items: async (returnId: number) => {
      await delay()
      return mockData.return_items.filter((i: any) => i.return_id === returnId)
    },
    review: async (id: number, status: string, reviewer: string) => {
      await delay()
      const ret = mockData.returns.find((r: any) => r.id === id)
      if (ret) {
        ret.status = status
        ret.reviewer = reviewer
        ret.reviewed_at = new Date().toISOString()

        if (status === 'approved') {
          const items = mockData.return_items.filter((i: any) => i.return_id === id)
          for (const item of items) {
            const product = mockData.products.find((p: any) => p.id === item.product_id)
            if (product) product.stock += item.quantity
          }
          const order = mockData.orders.find((o: any) => o.id === ret.order_id)
          if (order && order.member_id) {
            mockData.member_transactions.push({
              id: nextTxId++,
              member_id: order.member_id,
              type: 'refund',
              amount: ret.amount,
              points: 0,
              order_no: ret.order_no,
              description: '退货退款',
              created_at: new Date().toISOString()
            })
          }
        }
      }
      return true
    }
  },
  shift: {
    current: async () => {
      await delay()
      return mockData.shifts.find((s: any) => s.status === 'active') || null
    },
    start: async (cashier: string) => {
      await delay()
      const shiftNo = 'S' + Date.now().toString().slice(-8)
      const newShift = {
        id: nextShiftId++,
        shift_no: shiftNo,
        cashier,
        start_time: new Date().toISOString(),
        status: 'active',
        cash_amount: 0,
        mobile_amount: 0,
        total_sales: 0,
        order_count: 0,
        abnormal_count: 0,
        pending_refund_count: 0,
        created_at: new Date().toISOString()
      }
      mockData.shifts.push(newShift)
      return newShift
    },
    summary: async (shiftId: number) => {
      await delay()
      const shift = mockData.shifts.find((s: any) => s.id === shiftId)
      if (!shift) return null
      const shiftNo = shift.shift_no

      const orders = mockData.orders.filter((o: any) =>
        o.shift_id === shiftNo && o.status === 'completed' && o.is_void !== 1
      )
      const cashOrders = orders.filter((o: any) => o.payment_method === 'cash')
      const mobileOrders = orders.filter((o: any) =>
        o.payment_method === 'wechat' || o.payment_method === 'alipay'
      )
      const voidOrders = mockData.orders.filter((o: any) =>
        o.shift_id === shiftNo && (o.is_void === 1 || o.status === 'void')
      )
      const pendingReturns = mockData.returns.filter((r: any) =>
        r.shift_id === shiftNo && r.status === 'pending'
      )

      return {
        shift,
        cashAmount: cashOrders.reduce((s: number, o: any) => s + (o.paid_amount || 0), 0).toFixed(2),
        mobileAmount: mobileOrders.reduce((s: number, o: any) => s + (o.payable_amount || 0), 0).toFixed(2),
        totalSales: orders.reduce((s: number, o: any) => s + (o.payable_amount || 0), 0).toFixed(2),
        orderCount: orders.length,
        abnormalCount: voidOrders.length,
        pendingRefundCount: pendingReturns.length,
        pendingReturns,
        voidOrders
      }
    },
    close: async (shiftId: number) => {
      await delay()
      const shift = mockData.shifts.find((s: any) => s.id === shiftId)
      if (shift) {
        shift.status = 'closed'
        shift.end_time = new Date().toISOString()
      }
      return true
    },
    todaySummary: async () => {
      await delay()
      const today = new Date().toISOString().split('T')[0]
      const todaysShifts = mockData.shifts.filter((s: any) =>
        s.start_time.split('T')[0] === today
      )

      const result: any = {
        cashAmount: '0.00',
        mobileAmount: '0.00',
        totalSales: '0.00',
        orderCount: 0,
        abnormalCount: 0,
        pendingRefundCount: 0,
        pendingReturns: [],
        voidOrders: []
      }

      for (const shift of todaysShifts) {
        const summary = await mockApi.shift.summary(shift.id)
        if (summary) {
          result.cashAmount = (parseFloat(result.cashAmount) + parseFloat(summary.cashAmount)).toFixed(2)
          result.mobileAmount = (parseFloat(result.mobileAmount) + parseFloat(summary.mobileAmount)).toFixed(2)
          result.totalSales = (parseFloat(result.totalSales) + parseFloat(summary.totalSales)).toFixed(2)
          result.orderCount += summary.orderCount
          result.abnormalCount += summary.abnormalCount
          result.pendingRefundCount += summary.pendingRefundCount
          result.pendingReturns = [...result.pendingReturns, ...summary.pendingReturns]
          result.voidOrders = [...result.voidOrders, ...summary.voidOrders]
        }
      }
      return result
    }
  }
}

if (!(window as any).api) {
  console.log('[Mock] 使用模拟 API（Web 环境运行模式），Electron 启动后将切换为真实 IPC 模式')
  ;(window as any).api = mockApi
}

export {}
