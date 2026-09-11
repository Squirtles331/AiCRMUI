import type { BackendPage } from './page'
import http from '@/utils/http'
import { createIdempotencyKey } from '@/utils/idempotency'
import { toPageRes } from './page'

export interface QuotationItem {
  id: string
  quoteNo: string
  opportunityId: string
  customerId: string
  priceListId: string
  currency: string
  status: string
  currentVersionNo: number
  validUntil?: string
  version: number
  createdAt: string
  updatedAt: string
}

export interface QuotationVersion {
  id: string
  quoteId: string
  versionNo: number
  status: string
  subtotal: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  discountRate: number
  rejectionReason?: string
  submittedAt?: string
  version: number
}

export interface QuotationLine {
  id: string
  quoteVersionId: string
  lineNo: number
  productId: string
  priceItemId: string
  productNo: string
  sku: string
  productName: string
  unit: string
  quantity: number
  listPrice: number
  minimumPrice?: number
  unitPrice: number
  discountRate?: number
  taxRate: number
  lineAmount: number
}

export interface CreateQuotationLine {
  productId: string
  priceItemId: string
  quantity: number
  unitPrice: number
  discountRate?: number
}

export async function getQuotationList(params: Pagination) {
  return toPageRes(await http.get<BackendPage<QuotationItem>>('/quotes', params))
}
export const createQuotation = (data: { opportunityId: string, priceListId: string, validUntil?: string, lines: CreateQuotationLine[] }) =>
  http.post<QuotationItem>('/quotes', data, { headers: { 'Idempotency-Key': createIdempotencyKey('quote') } })
export const getQuotationVersions = (id: string) => http.get<QuotationVersion[]>(`/quotes/${id}/versions`)
export const getQuotationLines = (id: string, versionNo: number) => http.get<QuotationLine[]>(`/quotes/${id}/versions/${versionNo}/lines`)
export const expireQuotation = (record: QuotationItem, version: QuotationVersion) => http.post<QuotationItem>(`/quotes/${record.id}/actions/expire`, { rootVersion: record.version, version: version.version })
export const submitQuotation = (record: QuotationItem, version: QuotationVersion, approvalDefinitionCode: string) =>
  http.post<QuotationItem>(`/quotes/${record.id}/actions/submit`, { rootVersion: record.version, version: version.version, approvalDefinitionCode }, { headers: { 'Idempotency-Key': createIdempotencyKey('quote-submit') } })
