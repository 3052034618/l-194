import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { initDatabase, db } from './database'
import dayjs from 'dayjs'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 768,
    title: '智慧零售收银系统',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    autoHideMenuBar: true
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  initDatabase()
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

function getShiftSummary(shift: any): any {
  if (!shift) return null
  const shiftNo = shift.shift_no

  const orders = db.find('orders', (o: any) =>
    o.shift_id === shiftNo && o.status === 'completed' && o.is_void !== 1
  )

  const cashOrders = orders.filter((o: any) => o.payment_method === 'cash')
  const mobileOrders = orders.filter((o: any) =>
    o.payment_method === 'wechat' || o.payment_method === 'alipay'
  )
  const voidOrders = db.find('orders', (o: any) =>
    o.shift_id === shiftNo && (o.is_void === 1 || o.status === 'void')
  )

  const pendingReturns = db.find('returns', (r: any) =>
    r.shift_id === shiftNo && r.status === 'pending'
  )

  const cashAmount = cashOrders.reduce((s: number, o: any) => s + (o.paid_amount || 0), 0)
  const mobileAmount = mobileOrders.reduce((s: number, o: any) => s + (o.payable_amount || 0), 0)
  const totalSales = orders.reduce((s: number, o: any) => s + (o.payable_amount || 0), 0)

  return {
    shift,
    cashAmount: cashAmount.toFixed(2),
    mobileAmount: mobileAmount.toFixed(2),
    totalSales: totalSales.toFixed(2),
    orderCount: orders.length,
    abnormalCount: voidOrders.length,
    pendingRefundCount: pendingReturns.length,
    pendingReturns,
    voidOrders
  }
}

function registerIpcHandlers() {

  ipcMain.handle('product:search', (_e, keyword: string) => {
    const kw = keyword.toLowerCase().trim()
    if (!kw) return db.all('products')
    return db.find('products', (p: any) =>
      p.barcode.toLowerCase().includes(kw) ||
      p.name.toLowerCase().includes(kw) ||
      (p.category && p.category.toLowerCase().includes(kw))
    ).slice(0, 50)
  })

  ipcMain.handle('product:byBarcode', (_e, barcode: string) => {
    return db.findOne('products', (p: any) => p.barcode === barcode.trim())
  })

  ipcMain.handle('product:all', () => {
    return db.all('products').slice().reverse()
  })

  ipcMain.handle('product:detail', (_e, id: number) => {
    return db.get('products', id)
  })

  ipcMain.handle('member:byPhone', (_e, phone: string) => {
    return db.findOne('members', (m: any) => m.phone === phone.trim())
  })

  ipcMain.handle('member:create', (_e, data: any) => {
    const result = db.insert('members', {
      phone: data.phone,
      name: data.name,
      level: '普通会员',
      points: 0,
      total_spent: 0,
      birthday: data.birthday || null
    })
    return result
  })

  ipcMain.handle('member:update', (_e, id: number, data: any) => {
    return db.update('members', id, {
      name: data.name,
      phone: data.phone,
      birthday: data.birthday || null
    })
  })

  ipcMain.handle('member:coupons', (_e, memberId: number) => {
    const now = dayjs().format('YYYY-MM-DD')
    return db.find('coupons', (c: any) =>
      c.member_id === memberId &&
      c.is_used === 0 &&
      (!c.expire_at || c.expire_at >= now)
    ).reverse()
  })

  ipcMain.handle('member:transactions', (_e, memberId: number) => {
    return db.find('member_transactions', (t: any) => t.member_id === memberId)
      .reverse()
      .slice(0, 50)
  })

  ipcMain.handle('coupon:use', (_e, couponId: number) => {
    db.update('coupons', couponId, { is_used: 1 })
    return true
  })

  ipcMain.handle('order:create', (_e, orderData: any) => {
    const { order, items, memberId, pointsUsed, couponUsed, couponId, shiftId } = orderData

    const orderResult = db.insert('orders', {
      order_no: order.orderNo,
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
      is_void: 0
    })
    const orderId = orderResult.id as number

    for (const item of items) {
      db.insert('order_items', {
        order_id: orderId,
        product_id: item.productId,
        product_name: item.name,
        barcode: item.barcode,
        price: item.price,
        quantity: item.quantity,
        discount: item.discount,
        subtotal: item.subtotal
      })
      const product = db.get('products', item.productId) as any
      if (product) {
        db.update('products', item.productId, { stock: product.stock - item.quantity })
      }
    }

    if (memberId) {
      const pointsEarned = Math.floor(order.payableAmount)
      const member = db.get('members', memberId) as any
      if (member) {
        db.update('members', memberId, {
          points: member.points + pointsEarned - (pointsUsed || 0),
          total_spent: member.total_spent + order.payableAmount
        })
      }

      db.insert('member_transactions', {
        member_id: memberId,
        type: 'purchase',
        amount: order.payableAmount,
        points: pointsEarned,
        order_no: order.orderNo,
        description: `消费获得${pointsEarned}积分`
      })
      if (pointsUsed && pointsUsed > 0) {
        db.insert('member_transactions', {
          member_id: memberId,
          type: 'points_use',
          amount: 0,
          points: -pointsUsed,
          order_no: order.orderNo,
          description: `积分抵扣${(pointsUsed / 100).toFixed(2)}元`
        })
      }
    }

    if (couponId) {
      db.update('coupons', couponId, { is_used: 1 })
    }

    db.save()
    return { orderId, orderNo: order.orderNo }
  })

  ipcMain.handle('order:byNo', (_e, orderNo: string) => {
    const order = db.findOne('orders', (o: any) => o.order_no === orderNo.trim()) as any
    if (!order) return null
    const items = db.find('order_items', (i: any) => i.order_id === order.id)
    if (order.member_id) {
      const m = db.get('members', order.member_id) as any
      if (m) order.member = { id: m.id, name: m.name, phone: m.phone, level: m.level }
    }
    return { order, items }
  })

  ipcMain.handle('suspend:create', (_e, data: any) => {
    const suspendNo = 'G' + Date.now().toString().slice(-8)
    db.insert('suspended_orders', {
      suspend_no: suspendNo,
      items: JSON.stringify(data.items),
      member_id: data.memberId || null
    })
    return suspendNo
  })

  ipcMain.handle('suspend:all', () => {
    return db.all('suspended_orders').reverse()
  })

  ipcMain.handle('suspend:delete', (_e, id: number) => {
    return db.delete('suspended_orders', id)
  })

  ipcMain.handle('suspend:get', (_e, id: number) => {
    return db.get('suspended_orders', id)
  })

  ipcMain.handle('return:create', (_e, data: any) => {
    const returnNo = 'R' + Date.now().toString().slice(-8)

    const result = db.insert('returns', {
      return_no: returnNo,
      order_id: data.orderId,
      order_no: data.orderNo,
      type: data.type,
      status: data.status,
      amount: data.amount,
      reason: data.reason,
      shift_id: data.shiftId,
      cashier: '收银员001'
    })
    const returnId = result.id as number

    for (const item of data.items) {
      db.insert('return_items', {
        return_id: returnId,
        order_item_id: item.orderItemId,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal
      })
      if (data.type !== 'exchange' && data.status === 'approved') {
        const product = db.get('products', item.productId) as any
        if (product) {
          db.update('products', item.productId, { stock: product.stock + item.quantity })
        }
      }
    }
    db.save()
    return { returnId, returnNo }
  })

  ipcMain.handle('return:list', (_e, status?: string) => {
    let results = db.all('returns').reverse()
    if (status) results = results.filter((r: any) => r.status === status)
    return results
  })

  ipcMain.handle('return:items', (_e, returnId: number) => {
    return db.find('return_items', (i: any) => i.return_id === returnId)
  })

  ipcMain.handle('return:review', (_e, id: number, status: string, reviewer: string) => {
    db.update('returns', id, {
      status,
      reviewer,
      reviewed_at: new Date().toISOString()
    })

    if (status === 'approved') {
      const ret = db.get('returns', id) as any
      if (ret) {
        const items = db.find('return_items', (i: any) => i.return_id === id) as any[]
        for (const item of items) {
          const product = db.get('products', item.product_id) as any
          if (product) {
            db.update('products', item.product_id, { stock: product.stock + item.quantity })
          }
        }
        const order = db.findOne('orders', (o: any) => o.id === ret.order_id) as any
        if (order && order.member_id) {
          db.insert('member_transactions', {
            member_id: order.member_id,
            type: 'refund',
            amount: ret.amount,
            points: 0,
            order_no: ret.order_no,
            description: '退货退款'
          })
        }
      }
    }
    db.save()
    return true
  })

  ipcMain.handle('shift:current', () => {
    return db.findOne('shifts', (s: any) => s.status === 'active') || null
  })

  ipcMain.handle('shift:start', (_e, cashier: string) => {
    const shiftNo = 'S' + Date.now().toString().slice(-8)
    const result = db.insert('shifts', {
      shift_no: shiftNo,
      cashier,
      start_time: new Date().toISOString(),
      status: 'active',
      cash_amount: 0,
      mobile_amount: 0,
      total_sales: 0,
      order_count: 0,
      abnormal_count: 0,
      pending_refund_count: 0
    })
    return result
  })

  ipcMain.handle('shift:summary', (_e, shiftId: number) => {
    const shift = db.get('shifts', shiftId)
    return getShiftSummary(shift)
  })

  ipcMain.handle('shift:close', (_e, shiftId: number) => {
    const summary = getShiftSummary(db.get('shifts', shiftId))
    if (summary) {
      db.update('shifts', shiftId, {
        end_time: new Date().toISOString(),
        cash_amount: parseFloat(summary.cashAmount),
        mobile_amount: parseFloat(summary.mobileAmount),
        total_sales: parseFloat(summary.totalSales),
        order_count: summary.orderCount,
        abnormal_count: summary.abnormalCount,
        pending_refund_count: summary.pendingRefundCount,
        status: 'closed'
      })
      db.save()
    }
    return true
  })

  ipcMain.handle('shift:todaySummary', () => {
    const today = dayjs().format('YYYY-MM-DD')
    const shifts = db.find('shifts', (s: any) => dayjs(s.start_time).format('YYYY-MM-DD') === today)

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

    for (const shift of shifts) {
      const summary = getShiftSummary(shift)
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
  })
}
