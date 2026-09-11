import type { BackendPage } from './page'
import http from '@/utils/http'
import { createIdempotencyKey } from '@/utils/idempotency'
import { toPageRes } from './page'

export interface CustomerItem {
  id: string
  customerNo: string
  name: string
  industry?: string
  region?: string
  status: string
  ownershipType: 'PRIVATE' | 'PUBLIC'
  ownerUserId?: string
  ownerDeptId?: string
  publicPoolId?: string
  lastFollowUpAt?: string
  nextFollowUpAt?: string
  version: number
  createdAt: string
  updatedAt: string
}

export interface ContactItem {
  id: string
  customerId: string
  name: string
  mobile?: string
  email?: string
  department?: string
  title?: string
  decisionMaker: boolean
  version: number
}

export async function getCustomerList(scope: 'private' | 'public', params: Pagination) {
  return toPageRes(await http.get<BackendPage<CustomerItem>>(`/customers/${scope}`, params))
}

export const createCustomer = (data: { name: string, industry?: string, region?: string, publicPoolId?: string }) =>
  http.post<CustomerItem>('/customers', data, { headers: { 'Idempotency-Key': createIdempotencyKey('customer') } })

export const claimCustomer = (record: CustomerItem) => http.post<CustomerItem>(`/customers/${record.id}/actions/claim`, { version: record.version })
export const getContacts = (customerId: string) => http.get<ContactItem[]>(`/customers/${customerId}/contacts`)
export const addContact = (customerId: string, data: Omit<ContactItem, 'id' | 'customerId' | 'version'>) => http.post<ContactItem>(`/customers/${customerId}/contacts`, data)
