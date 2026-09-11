import http from '@/utils/http'

export interface ListItem {
  id: string
  createdAt: string
  name: string
  code: string
  status: number
  dataScope: string
  userCount: number
  permissionCount: number
}

export function getRoleList(params: Pagination & { keyword?: string, status?: number }) {
  return http.get<PageRes<ListItem[]>>('/administration/roles', params)
}
