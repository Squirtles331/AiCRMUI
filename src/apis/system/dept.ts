import http from '@/utils/http'

export interface ListItem {
  id: string
  name: string
  code: string
  path: string
  status: number
  createdAt: string
  parentId?: string
  children?: ListItem[]
}

export function getDepartmentList() {
  return http.get<ListItem[]>('/administration/departments')
}
