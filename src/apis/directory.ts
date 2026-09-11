import http from '@/utils/http'

export interface DirectoryUser {
  id: string
  username: string
  name: string
  departmentId?: string
  departmentName?: string
}

export interface PublicPoolItem {
  id: string
  resourceType: 'LEAD' | 'CUSTOMER'
  code: string
  name: string
  claimEnabled: boolean
  assignEnabled: boolean
  releaseEnabled: boolean
}

export const getDirectoryUsers = () => http.get<DirectoryUser[]>('/directory/users')
export const getPublicPools = (resourceType: 'LEAD' | 'CUSTOMER') => http.get<PublicPoolItem[]>('/directory/public-pools', { resourceType })
