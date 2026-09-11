import type { BackendPage } from './page'
import http from '@/utils/http'
import { createIdempotencyKey } from '@/utils/idempotency'
import { toPageRes } from './page'

export interface SalesOrderItem {
  id: string
  orderNo: string
  contractId: string
  customerId: string
  currency: string
  totalAmount: number
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLING' | 'CANCELLED' | 'CLOSED'
  expectedDeliveryAt?: string
  confirmedAt?: string
  cancelledAt?: string
  closedAt?: string
  closeReason?: string
  version: number
}

export interface SalesOrderLine {
  id: string
  lineNo: number
  productId: string
  productNo: string
  sku: string
  productName: string
  unit: string
  quantity: number
  unitPrice: number
  taxRate: number
  lineAmount: number
}

export interface OrderCancellation {
  id: string
  cancelNo: string
  orderId: string
  status: string
  reason: string
  rejectionReason?: string
  requestedAt: string
  completedAt?: string
  version: number
}

export async function getSalesOrderList(params: Pagination) {
  return toPageRes(await http.get<BackendPage<SalesOrderItem>>('/orders', params))
}
export const getSalesOrderLines = (id: string) => http.get<SalesOrderLine[]>(`/orders/${id}/lines`)
export const getOrderCancellations = (id: string) => http.get<OrderCancellation[]>(`/orders/${id}/cancellations`)
export const createSalesOrder = (contractId: string) => http.post<SalesOrderItem>('/orders', { contractId }, { headers: { 'Idempotency-Key': createIdempotencyKey('order') } })
export const confirmSalesOrder = (record: SalesOrderItem) => http.post<SalesOrderItem>(`/orders/${record.id}/actions/confirm`, { version: record.version })
export const requestOrderCancel = (record: SalesOrderItem, reason: string) => http.post<OrderCancellation>(`/orders/${record.id}/actions/request-cancel`, { version: record.version, reason }, { headers: { 'Idempotency-Key': createIdempotencyKey('order-cancel') } })
export const closeSalesOrder = (record: SalesOrderItem, reason: string) => http.post<SalesOrderItem>(`/orders/${record.id}/actions/close`, { version: record.version, reason })
export const decideOrderCancel = (record: SalesOrderItem, cancellation: OrderCancellation, approved: boolean, reason?: string) => http.post<SalesOrderItem>(`/orders/${record.id}/cancellations/${cancellation.id}/actions/${approved ? 'approve' : 'reject'}`, { orderVersion: record.version, cancellationVersion: cancellation.version, reason })
