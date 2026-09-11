import type { BackendPage } from './page'
import http from '@/utils/http'
import { createIdempotencyKey } from '@/utils/idempotency'
import { toPageRes } from './page'

export interface ContractItem {
  id: string
  contractNo: string
  name: string
  quoteId: string
  quoteVersionId: string
  customerId: string
  currency: string
  subtotal: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  status: string
  effectiveFrom?: string
  effectiveTo?: string
  submittedAt?: string
  signedAt?: string
  version: number
}

export interface ContractLine {
  id: string
  lineNo: number
  productId: string
  productNo: string
  sku: string
  productName: string
  unit: string
  quantity: number
  listPrice: number
  unitPrice: number
  discountRate?: number
  taxRate: number
  lineAmount: number
}

export async function getContractList(params: Pagination) {
  return toPageRes(await http.get<BackendPage<ContractItem>>('/contracts', params))
}
export const getContractLines = (id: string) => http.get<ContractLine[]>(`/contracts/${id}/lines`)
export const createContract = (data: { quoteId: string, name: string, effectiveFrom?: string, effectiveTo?: string }) => http.post<ContractItem>('/contracts', data, { headers: { 'Idempotency-Key': createIdempotencyKey('contract') } })
export const submitContractSignature = (record: ContractItem) => http.post<ContractItem>(`/contracts/${record.id}/actions/submit-signature`, { version: record.version })
export const signContract = (record: ContractItem) => http.post<ContractItem>(`/contracts/${record.id}/actions/sign`, { version: record.version })
export const withdrawContractSignature = (record: ContractItem) => http.post<ContractItem>(`/contracts/${record.id}/actions/withdraw-signature`, { version: record.version })
export const voidContract = (record: ContractItem, reason: string) => http.post<ContractItem>(`/contracts/${record.id}/actions/void`, { version: record.version, reason })
