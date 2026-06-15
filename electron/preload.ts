import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  product: {
    search: (keyword: string) => ipcRenderer.invoke('product:search', keyword),
    byBarcode: (barcode: string) => ipcRenderer.invoke('product:byBarcode', barcode),
    all: () => ipcRenderer.invoke('product:all'),
    detail: (id: number) => ipcRenderer.invoke('product:detail', id)
  },
  member: {
    byPhone: (phone: string) => ipcRenderer.invoke('member:byPhone', phone),
    create: (data: any) => ipcRenderer.invoke('member:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('member:update', id, data),
    coupons: (memberId: number) => ipcRenderer.invoke('member:coupons', memberId),
    transactions: (memberId: number) => ipcRenderer.invoke('member:transactions', memberId)
  },
  coupon: {
    use: (couponId: number) => ipcRenderer.invoke('coupon:use', couponId)
  },
  order: {
    create: (data: any) => ipcRenderer.invoke('order:create', data),
    byNo: (orderNo: string) => ipcRenderer.invoke('order:byNo', orderNo)
  },
  suspend: {
    create: (data: any) => ipcRenderer.invoke('suspend:create', data),
    all: () => ipcRenderer.invoke('suspend:all'),
    delete: (id: number) => ipcRenderer.invoke('suspend:delete', id),
    get: (id: number) => ipcRenderer.invoke('suspend:get', id)
  },
  return: {
    create: (data: any) => ipcRenderer.invoke('return:create', data),
    list: (status?: string) => ipcRenderer.invoke('return:list', status),
    items: (returnId: number) => ipcRenderer.invoke('return:items', returnId),
    review: (id: number, status: string, reviewer: string) => ipcRenderer.invoke('return:review', id, status, reviewer)
  },
  shift: {
    current: () => ipcRenderer.invoke('shift:current'),
    start: (cashier: string) => ipcRenderer.invoke('shift:start', cashier),
    summary: (shiftId: number) => ipcRenderer.invoke('shift:summary', shiftId),
    close: (shiftId: number) => ipcRenderer.invoke('shift:close', shiftId),
    todaySummary: () => ipcRenderer.invoke('shift:todaySummary')
  }
})
