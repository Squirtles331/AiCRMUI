export interface UserInfo {
  id: string
  userId?: string
  nickname: string
  name?: string
  username: string
  tenantId: string
  departmentId?: string
  departmentName?: string
  avatar: string
  roles: string[]
  permissions: string[]
}

export interface Login {
  accessToken: string
  tokenType: string
  expiresIn: number
}

export interface UserRouteItem {
  activeMenu: string
  alwaysShow: boolean
  breadcrumb: boolean
  children: UserRouteItem[]
  component: string
  hidden: boolean
  icon: string
  id: string
  keepAlive: boolean
  parentId: string
  path: string
  permission: string
  redirect: string
  roles: string[]
  showInTabs: boolean
  sort: number
  status: Status
  title: string
  type: 1 | 2 | 3
  affix: boolean
}
