import type { BackendPage } from './page'
import http from '@/utils/http'
import { createIdempotencyKey } from '@/utils/idempotency'
import { toPageRes } from './page'

export interface LeadItem {
  id: string
  leadNo: string
  name: string
  mobile?: string
  email?: string
  companyName?: string
  sourceType: string
  sourceRef?: string
  intent?: string
  acquisitionChannelId?: string
  acquisitionChannelCode?: string
  status: string
  ownershipType: 'PRIVATE' | 'PUBLIC'
  ownerUserId?: string
  ownerDeptId?: string
  publicPoolId?: string
  customerId?: string
  lastFollowUpAt?: string
  nextFollowUpAt?: string
  version: number
  createdAt: string
  updatedAt: string
}

export interface CreateLeadInput {
  name: string
  mobile?: string
  email?: string
  companyName?: string
  sourceType: string
  sourceRef?: string
  intent?: string
  publicPoolId?: string
  acquisitionChannelId?: string
}

export async function getLeadList(scope: 'private' | 'public', params: Pagination) {
  return toPageRes(await http.get<BackendPage<LeadItem>>(`/leads/${scope}`, params))
}

export const createLead = (data: CreateLeadInput) =>
  http.post<LeadItem>('/leads', data, { headers: { 'Idempotency-Key': createIdempotencyKey('lead') } })

export const claimLead = (record: LeadItem) => http.post<LeadItem>(`/leads/${record.id}/actions/claim`, { version: record.version })
export const releaseLead = (record: LeadItem, publicPoolId: string, reason?: string) => http.post<LeadItem>(`/leads/${record.id}/actions/release`, { version: record.version, publicPoolId, reason })
export const invalidateLead = (record: LeadItem, reason: string) => http.post<LeadItem>(`/leads/${record.id}/actions/invalidate`, { version: record.version, reason })
export const convertLead = (record: LeadItem, data: { existingCustomerId?: string, customerName?: string, industry?: string, region?: string }) =>
  http.post(`/leads/${record.id}/actions/convert`, { version: record.version, ...data }, { headers: { 'Idempotency-Key': createIdempotencyKey('lead-convert') } })
