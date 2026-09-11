import type { UserRouteItem } from '@/apis/user'

type RouteSpec = Omit<UserRouteItem, 'children' | 'status'> & {
  children?: RouteSpec[]
  permissions?: string[]
}

const leaf = (path: string, title: string, icon: string, component: string, sort: number, permissions: string[]): RouteSpec => ({
  id: path,
  parentId: '/crm',
  path,
  title,
  icon,
  component,
  redirect: '',
  activeMenu: '',
  permission: permissions.join('|'),
  permissions,
  roles: [],
  type: 2,
  sort,
  hidden: false,
  keepAlive: false,
  breadcrumb: true,
  showInTabs: true,
  alwaysShow: false,
  affix: false
})

const crmMenu: RouteSpec = {
  id: '/crm',
  parentId: '0',
  path: '/crm',
  title: '销售管理',
  icon: 'icon-park-outline:sales-report',
  component: 'Layout',
  redirect: '/crm/leads',
  activeMenu: '',
  permission: '',
  roles: [],
  type: 1,
  sort: 10,
  hidden: false,
  keepAlive: false,
  breadcrumb: true,
  showInTabs: false,
  alwaysShow: true,
  affix: false,
  children: [
    leaf('/crm/leads', '线索', 'icon-park-outline:ranking-list', 'crm/leads/index', 10, ['lead:read:own', 'lead:read:any']),
    leaf('/crm/customers', '客户', 'icon-park-outline:peoples', 'crm/customers/index', 20, ['customer:read:own', 'customer:read:any']),
    leaf('/crm/opportunities', '商机', 'icon-park-outline:trend', 'crm/opportunities/index', 30, ['opportunity:read:own', 'opportunity:read:any']),
    leaf('/crm/quotes', '报价', 'icon-park-outline:doc-detail', 'crm/quotes/index', 40, ['quote:read:own', 'quote:read:any']),
    leaf('/crm/contracts', '合同', 'icon-park-outline:agreement', 'crm/contracts/index', 50, ['contract:read:own', 'contract:read:any']),
    leaf('/crm/orders', '销售订单', 'icon-park-outline:shopping', 'crm/orders/index', 60, ['order:read:own', 'order:read:any']),
    leaf('/crm/catalog', '产品目录', 'icon-park-outline:commodity', 'crm/catalog/index', 70, ['catalog:read']),
    leaf('/crm/approvals', '审批任务', 'icon-park-outline:check-one', 'crm/approvals/index', 80, ['approval:task:read'])
  ]
}

function cloneVisible(route: RouteSpec, permissions: Set<string>): UserRouteItem | undefined {
  const children = route.children
    ?.map(item => cloneVisible(item, permissions))
    .filter((item): item is UserRouteItem => Boolean(item)) || []
  if (route.permissions?.length && !route.permissions.some(permission => permissions.has(permission))) return undefined
  if (route.children?.length && !children.length) return undefined
  const { permissions: _permissions, children: _children, ...item } = route
  return { ...item, children, status: '1' }
}

export function buildCrmRoutes(permissions: string[]): UserRouteItem[] {
  const menu = cloneVisible(crmMenu, new Set(permissions))
  return menu ? [menu] : []
}
