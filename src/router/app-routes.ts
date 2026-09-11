import type { UserInfo, UserRouteItem } from '@/apis/user'

const createRoute = (params: Partial<UserRouteItem> & Pick<UserRouteItem, 'id' | 'path' | 'title' | 'component' | 'type' | 'sort'>): UserRouteItem => ({
  activeMenu: '',
  alwaysShow: false,
  breadcrumb: true,
  children: [],
  hidden: false,
  icon: '',
  keepAlive: false,
  parentId: '0',
  permission: '',
  redirect: '',
  roles: [],
  showInTabs: true,
  status: '1',
  affix: false,
  ...params
})

const systemRoutes = createRoute({
  id: 'system',
  path: '/system',
  title: '系统管理',
  component: 'Layout',
  type: 1,
  sort: 10,
  icon: 'icon-park-outline:setting-two',
  redirect: '/system/user',
  alwaysShow: true,
  children: [
    createRoute({ id: 'system-user', parentId: 'system', path: '/system/user', title: '用户管理', component: 'system/user/index', type: 2, sort: 10, icon: 'icon-park-outline:user' }),
    createRoute({ id: 'system-dept', parentId: 'system', path: '/system/dept', title: '部门管理', component: 'system/dept/index', type: 2, sort: 20, icon: 'icon-park-outline:tree-diagram' }),
    createRoute({ id: 'system-role', parentId: 'system', path: '/system/role', title: '角色管理', component: 'system/role/index', type: 2, sort: 30, icon: 'icon-park-outline:permissions' }),
    createRoute({ id: 'system-permission', parentId: 'system', path: '/system/permission', title: '权限清单', component: 'system/permission/index', type: 2, sort: 40, icon: 'icon-park-outline:shield' })
  ]
})

export function buildAppRoutes(user: UserInfo): UserRouteItem[] {
  return user.roles.includes('admin') ? [systemRoutes] : []
}
