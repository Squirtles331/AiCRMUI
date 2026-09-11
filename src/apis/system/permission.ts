import http from '@/utils/http'

export interface ListItem {
  code: string
  name: string
  resourceType: string
  action: string
  status: number
  description?: string
}

export function getPermissionList() {
  return http.get<ListItem[]>('/administration/permissions')
}
