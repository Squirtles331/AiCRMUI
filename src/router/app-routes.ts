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

const configRoutes = createRoute({
  id: 'config',
  path: '/config',
  title: '基础配置',
  component: 'Layout',
  type: 1,
  sort: 20,
  icon: 'icon-park-outline:setting-config',
  redirect: '/config/catalog',
  alwaysShow: true,
  children: [
    createRoute({ id: 'config-catalog', parentId: 'config', path: '/config/catalog', title: '产品目录', component: 'config/catalog/index', type: 2, sort: 10, icon: 'icon-park-outline:ad-product' }),
    createRoute({ id: 'config-price-list', parentId: 'config', path: '/config/price-list', title: '价目表', component: 'config/price-list/index', type: 2, sort: 20, icon: 'icon-park-outline:list-two' }),
    createRoute({ id: 'config-acquisition-channel', parentId: 'config', path: '/config/acquisition-channel', title: '获客渠道', component: 'config/acquisition-channel/index', type: 2, sort: 30, icon: 'icon-park-outline:connection-point-two' })

  ]
})

const businessRoutes = createRoute({
  id: 'business',
  path: '/business',
  title: '销售业务',
  component: 'Layout',
  type: 1,
  sort: 30,
  icon: 'icon-park-outline:briefcase',
  redirect: '/lead',
  alwaysShow: true,
  children: [
    createRoute({ id: 'business-lead', parentId: 'business', path: '/lead', title: '线索管理', component: 'lead/index', type: 2, sort: 10, icon: 'icon-park-outline:clue' }),
    createRoute({ id: 'business-customer', parentId: 'business', path: '/customer', title: '客户管理', component: 'customer/index', type: 2, sort: 20, icon: 'icon-park-outline:people' }),
    createRoute({ id: 'business-opportunity', parentId: 'business', path: '/opportunity', title: '商机管理', component: 'opportunity/index', type: 2, sort: 30, icon: 'icon-park-outline:trend' }),
    createRoute({ id: 'business-quotation', parentId: 'business', path: '/quotation', title: '报价管理', component: 'quotation/index', type: 2, sort: 40, icon: 'icon-park-outline:bill' }),
    createRoute({ id: 'business-contract', parentId: 'business', path: '/contract', title: '合同管理', component: 'contract/index', type: 2, sort: 50, icon: 'icon-park-outline:doc-detail' }),
    createRoute({ id: 'business-order', parentId: 'business', path: '/order', title: '销售订单', component: 'order/index', type: 2, sort: 60, icon: 'icon-park-outline:transaction-order' })
  ]
})

const routePermissions: Record<string, string[]> = {
  'business-lead': ['lead:read'],
  'business-customer': ['customer:read'],
  'business-opportunity': ['opportunity:read:own', 'opportunity:read:any'],
  'business-quotation': ['quote:read:own', 'quote:read:any'],
  'business-contract': ['contract:read:own', 'contract:read:any'],
  'business-order': ['order:read:own', 'order:read:any']
}

export function buildAppRoutes(user: UserInfo): UserRouteItem[] {
  const routes: UserRouteItem[] = []
  if (user.roles.includes('admin')) routes.push(systemRoutes)

  const configChildren = configRoutes.children.filter((route) => {
    if (route.id === 'config-acquisition-channel') return user.permissions.some((item) => ['channel:read', 'channel:manage'].includes(item))
    return user.permissions.includes('catalog:read')
  })
  if (configChildren.length) {
    routes.push({ ...configRoutes, redirect: configChildren[0].path, children: configChildren })
  }
  const businessChildren = businessRoutes.children.filter((route) => routePermissions[route.id]?.some((item) => user.permissions.includes(item)))
  if (businessChildren.length) {
    routes.push({ ...businessRoutes, redirect: businessChildren[0].path, children: businessChildren })
  }
  return routes
}
