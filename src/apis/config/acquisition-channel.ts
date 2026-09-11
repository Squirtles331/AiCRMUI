import http from '@/utils/http'
import { createIdempotencyKey } from '@/utils/idempotency'

export interface AcquisitionChannelItem {
  id: string
  code: string
  name: string
  sourceType: string
  status: 'DRAFT' | 'ACTIVE' | 'DISABLED'
  version: number
  createdAt: string
  updatedAt: string
}

export const getAcquisitionChannelList = () => http.get<AcquisitionChannelItem[]>('/acquisition-channels')

export const createAcquisitionChannel = (data: { code: string, name: string, sourceType: string }) =>
  http.post<AcquisitionChannelItem>('/acquisition-channels', data, { headers: { 'Idempotency-Key': createIdempotencyKey('channel') } })

export const activateAcquisitionChannel = (id: string, version: number) =>
  http.post<AcquisitionChannelItem>(`/acquisition-channels/${id}/actions/activate`, { version })

export const disableAcquisitionChannel = (id: string, version: number) =>
  http.post<AcquisitionChannelItem>(`/acquisition-channels/${id}/actions/disable`, { version })
