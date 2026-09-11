import type { BackendPage } from './page'
import http from '@/utils/http'
import { createIdempotencyKey } from '@/utils/idempotency'
import { toPageRes } from './page'

export interface OpportunityItem {
  id: string
  opportunityNo: string
  name: string
  customerId: string
  contactId?: string
  sourceLeadId?: string
  stage: string
  status: string
  expectedAmount: number
  currency: string
  probability: number
  expectedCloseDate?: string
  ownerUserId: string
  ownerDeptId: string
  lostReason?: string
  wonAt?: string
  version: number
  createdAt: string
  updatedAt: string
}

export async function getOpportunityList(params: Pagination) {
  return toPageRes(await http.get<BackendPage<OpportunityItem>>('/opportunities', params))
}

export const createOpportunity = (data: { customerId: string, contactId?: string, sourceLeadId?: string, name: string, expectedAmount: number, currency: string, probability: number, expectedCloseDate?: string }) =>
  http.post<OpportunityItem>('/opportunities', data, { headers: { 'Idempotency-Key': createIdempotencyKey('opportunity') } })

export const changeOpportunityStage = (record: OpportunityItem, stage: string, probability: number) => http.post<OpportunityItem>(`/opportunities/${record.id}/actions/stage`, { version: record.version, stage, probability })
export const winOpportunity = (record: OpportunityItem) => http.post<OpportunityItem>(`/opportunities/${record.id}/actions/win`, { version: record.version })
export const loseOpportunity = (record: OpportunityItem, reason: string) => http.post<OpportunityItem>(`/opportunities/${record.id}/actions/lose`, { version: record.version, reason })
export const restartOpportunity = (record: OpportunityItem) => http.post<OpportunityItem>(`/opportunities/${record.id}/actions/restart`, { version: record.version })
