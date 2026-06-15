export {}

declare global {
  interface Window {
    api: {
      product: {
        search: (keyword: string) => Promise<any[]>
        byBarcode: (barcode: string) => Promise<any>
        all: () => Promise<any[]>
        detail: (id: number) => Promise<any>
      }
      member: {
        byPhone: (phone: string) => Promise<any>
        create: (data: any) => Promise<any>
        update: (id: number, data: any) => Promise<any>
        coupons: (memberId: number) => Promise<any[]>
        transactions: (memberId: number) => Promise<any[]>
      }
      coupon: {
        use: (couponId: number) => Promise<boolean>
      }
      order: {
        create: (data: any) => Promise<any>
        byNo: (orderNo: string) => Promise<any>
      }
      suspend: {
        create: (data: any) => Promise<string>
        all: () => Promise<any[]>
        delete: (id: number) => Promise<boolean>
        get: (id: number) => Promise<any>
      }
      return: {
        create: (data: any) => Promise<any>
        list: (status?: string) => Promise<any[]>
        items: (returnId: number) => Promise<any[]>
        review: (id: number, status: string, reviewer: string) => Promise<boolean>
      }
      shift: {
        current: () => Promise<any>
        start: (cashier: string) => Promise<any>
        summary: (shiftId: number) => Promise<any>
        close: (shiftId: number) => Promise<boolean>
        todaySummary: () => Promise<any>
      }
    }
  }
}
