import http from '@/utils/http'

export interface ListItem {
  id: string
  createdAt: string
  departmentId: string
  departmentName: string
  username: string
  name: string
  email: string
  mobile: string
  status: number
  roleNames: string
}

export function getUserList(params: Pagination & { keyword?: string, status?: number }) {
  return http.get<PageRes<ListItem[]>>('/administration/users', params)
}
