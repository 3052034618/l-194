import fs from 'fs'
import path from 'path'
import { app } from 'electron'

let dbPath: string
let data: any = {
  products: [],
  members: [],
  coupons: [],
  orders: [],
  order_items: [],
  returns: [],
  return_items: [],
  shifts: [],
  suspended_orders: [],
  member_transactions: []
}
let nextIds: any = {}

function saveData() {
  try {
    fs.writeFileSync(dbPath, JSON.stringify({ data, nextIds }, null, 2), 'utf-8')
  } catch (e) {
    console.error('保存数据失败:', e)
  }
}

function loadData() {
  try {
    if (fs.existsSync(dbPath)) {
      const raw = fs.readFileSync(dbPath, 'utf-8')
      const parsed = JSON.parse(raw)
      data = parsed.data || data
      nextIds = parsed.nextIds || {}
      return true
    }
  } catch (e) {
    console.error('加载数据失败:', e)
  }
  return false
}

function getNextId(table: string): number {
  if (!nextIds[table]) nextIds[table] = 1
  return nextIds[table]++
}

export function initDatabase() {
  dbPath = path.join(app.getPath('userData'), 'smart-retail-data.json')
  const loaded = loadData()
  if (!loaded || data.products.length === 0) {
    seedData()
    saveData()
  }
}

function seedData() {
  const products = [
    { barcode: '6901234567890', name: '农夫山泉矿泉水 550ml', category: '饮料', price: 2.00, cost: 1.00, stock: 200, shelf_location: 'A-01-01', unit: '瓶', is_promotion: 0, promotion_group: null },
    { barcode: '6901234567891', name: '可口可乐 330ml', category: '饮料', price: 3.50, cost: 1.80, stock: 150, shelf_location: 'A-01-02', unit: '罐', is_promotion: 1, promotion_group: '饮料组合' },
    { barcode: '6901234567892', name: '百事可乐 330ml', category: '饮料', price: 3.50, cost: 1.80, stock: 150, shelf_location: 'A-01-03', unit: '罐', is_promotion: 1, promotion_group: '饮料组合' },
    { barcode: '6901234567893', name: '康师傅红烧牛肉面', category: '方便食品', price: 5.50, cost: 3.00, stock: 100, shelf_location: 'B-02-01', unit: '桶', is_promotion: 0, promotion_group: null },
    { barcode: '6901234567894', name: '乐事薯片原味 75g', category: '零食', price: 8.50, cost: 4.50, stock: 80, shelf_location: 'C-01-01', unit: '袋', is_promotion: 1, promotion_group: '零食组合' },
    { barcode: '6901234567895', name: '奥利奥饼干原味 116g', category: '零食', price: 12.00, cost: 6.50, stock: 60, shelf_location: 'C-01-02', unit: '盒', is_promotion: 1, promotion_group: '零食组合' },
    { barcode: '6901234567896', name: '伊利纯牛奶 250ml', category: '乳制品', price: 3.80, cost: 2.50, stock: 120, shelf_location: 'D-01-01', unit: '盒', is_promotion: 0, promotion_group: null },
    { barcode: '6901234567897', name: '蒙牛特仑苏 250ml', category: '乳制品', price: 6.50, cost: 4.00, stock: 80, shelf_location: 'D-01-02', unit: '盒', is_promotion: 0, promotion_group: null },
    { barcode: '6901234567898', name: '金龙鱼调和油 5L', category: '粮油', price: 69.90, cost: 52.00, stock: 30, shelf_location: 'E-01-01', unit: '桶', is_promotion: 0, promotion_group: null },
    { barcode: '6901234567899', name: '福临门大米 5kg', category: '粮油', price: 45.00, cost: 32.00, stock: 40, shelf_location: 'E-02-01', unit: '袋', is_promotion: 0, promotion_group: null },
    { barcode: '6901234567900', name: '维达纸巾 3层10包', category: '日用', price: 28.00, cost: 18.00, stock: 50, shelf_location: 'F-01-01', unit: '提', is_promotion: 0, promotion_group: null },
    { barcode: '6901234567901', name: '海飞丝洗发水 400ml', category: '日化', price: 39.90, cost: 25.00, stock: 45, shelf_location: 'G-01-01', unit: '瓶', is_promotion: 0, promotion_group: null },
    { barcode: '6901234567902', name: '云南白药牙膏 180g', category: '日化', price: 29.80, cost: 18.00, stock: 60, shelf_location: 'G-02-01', unit: '支', is_promotion: 0, promotion_group: null },
    { barcode: '6901234567903', name: '苹果 500g', category: '生鲜', price: 9.90, cost: 5.00, stock: 100, shelf_location: 'H-01-01', unit: '斤', is_promotion: 0, promotion_group: null },
    { barcode: '6901234567904', name: '香蕉 500g', category: '生鲜', price: 5.50, cost: 3.00, stock: 80, shelf_location: 'H-01-02', unit: '斤', is_promotion: 0, promotion_group: null },
  ]
  products.forEach(p => {
    data.products.push({ id: getNextId('products'), ...p, created_at: new Date().toISOString() })
  })

  const members = [
    { phone: '13800138000', name: '张三', level: '黄金会员', points: 2580, total_spent: 3580.50, birthday: '1990-05-15' },
    { phone: '13900139000', name: '李四', level: '普通会员', points: 320, total_spent: 680.00, birthday: '1995-10-20' },
    { phone: '13700137000', name: '王五', level: '钻石会员', points: 8960, total_spent: 12560.00, birthday: '1985-03-08' },
  ]
  members.forEach(m => {
    data.members.push({ id: getNextId('members'), ...m, created_at: new Date().toISOString() })
  })

  const coupons = [
    { code: 'CPN202401001', name: '满50减10', type: 'fixed', value: 10.00, min_amount: 50.00, member_id: 1, is_used: 0, expire_at: '2026-12-31' },
    { code: 'CPN202401002', name: '满100减20', type: 'fixed', value: 20.00, min_amount: 100.00, member_id: 1, is_used: 0, expire_at: '2026-12-31' },
    { code: 'CPN202401003', name: '9折优惠券', type: 'percent', value: 10.00, min_amount: 0, member_id: 2, is_used: 0, expire_at: '2026-12-31' },
    { code: 'CPN202401004', name: '满200减50', type: 'fixed', value: 50.00, min_amount: 200.00, member_id: 3, is_used: 0, expire_at: '2026-12-31' },
    { code: 'CPN202401005', name: '85折优惠券', type: 'percent', value: 15.00, min_amount: 0, member_id: 3, is_used: 0, expire_at: '2026-12-31' },
  ]
  coupons.forEach(c => {
    data.coupons.push({ id: getNextId('coupons'), ...c, created_at: new Date().toISOString() })
  })
}

export const db = {
  all: (table: string) => data[table] || [],

  get: (table: string, id: number) => (data[table] || []).find((r: any) => r.id === id),

  find: (table: string, predicate: (r: any) => boolean) => (data[table] || []).filter(predicate),

  findOne: (table: string, predicate: (r: any) => boolean) => (data[table] || []).find(predicate),

  insert: (table: string, record: any) => {
    const id = getNextId(table)
    const newRecord = { id, ...record, created_at: record.created_at || new Date().toISOString() }
    if (!data[table]) data[table] = []
    data[table].push(newRecord)
    saveData()
    return { ...newRecord, lastInsertRowid: id }
  },

  update: (table: string, id: number, updates: any) => {
    const idx = (data[table] || []).findIndex((r: any) => r.id === id)
    if (idx >= 0) {
      data[table][idx] = { ...data[table][idx], ...updates }
      saveData()
      return data[table][idx]
    }
    return null
  },

  updateWhere: (table: string, predicate: (r: any) => boolean, updates: any) => {
    const items = data[table] || []
    let count = 0
    items.forEach((item: any, idx: number) => {
      if (predicate(item)) {
        items[idx] = { ...item, ...updates }
        count++
      }
    })
    if (count > 0) saveData()
    return count
  },

  delete: (table: string, id: number) => {
    const idx = (data[table] || []).findIndex((r: any) => r.id === id)
    if (idx >= 0) {
      data[table].splice(idx, 1)
      saveData()
      return true
    }
    return false
  },

  deleteWhere: (table: string, predicate: (r: any) => boolean) => {
    if (!data[table]) return 0
    const before = data[table].length
    data[table] = data[table].filter((r: any) => !predicate(r))
    const deleted = before - data[table].length
    if (deleted > 0) saveData()
    return deleted
  },

  save: () => saveData()
}
