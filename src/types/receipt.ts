export type Receipt = {
  id: string
  createdAt: Date
  items: {
    name: string
    qty: number
    unitPrice: number
    total: number
  }[]
  subtotal: number
  discount?: number
  total: number
  payment: {
    method: 'DINHEIRO'
    paid: number
    change: number
  }
}