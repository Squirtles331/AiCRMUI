import http from '@/utils/http'
import { createIdempotencyKey } from '@/utils/idempotency'

export interface CategoryItem {
  id: string
  parentId?: string
  code: string
  name: string
  status: string
  sortOrder: number
  version: number
}

export interface ProductItem {
  id: string
  categoryId?: string
  productNo: string
  sku: string
  name: string
  specification?: string
  unit: string
  status: string
  saleEnabled: boolean
  version: number
}

export interface PriceListItem {
  id: string
  code: string
  name: string
  currency: string
  status: string
  effectiveFrom?: string
  effectiveTo?: string
  version: number
}

export interface PriceItem {
  id: string
  priceListId: string
  productId: string
  listPrice: number
  minimumPrice?: number
  taxRate: number
  status: string
  version: number
}

interface BackendPage<T> {
  items: T[]
  page: number
  size: number
  total: number
}

const toPageRes = <T>(res: ApiRes<BackendPage<T>>): ApiRes<PageRes<T[]>> => ({
  ...res,
  data: { records: res.data.items, total: res.data.total }
})

export const getCategoryList = () => http.get<CategoryItem[]>('/catalog/categories')

export const createCategory = (data: { parentId?: string, code: string, name: string, sortOrder: number }) =>
  http.post<CategoryItem>('/catalog/categories', data, { headers: { 'Idempotency-Key': createIdempotencyKey('category') } })

export async function getProductList(params: Pagination) {
  return toPageRes(await http.get<BackendPage<ProductItem>>('/catalog/products', params))
}

export const createProduct = (data: { categoryId?: string, sku: string, name: string, specification?: string, unit: string }) =>
  http.post<ProductItem>('/catalog/products', data, { headers: { 'Idempotency-Key': createIdempotencyKey('product') } })

export async function getPriceList(params: Pagination) {
  return toPageRes(await http.get<BackendPage<PriceListItem>>('/catalog/price-lists', params))
}

export const createPriceList = (data: { code: string, name: string, currency: string, effectiveFrom?: string, effectiveTo?: string }) =>
  http.post<PriceListItem>('/catalog/price-lists', data, { headers: { 'Idempotency-Key': createIdempotencyKey('price-list') } })

export const getPriceItems = (priceListId: string) => http.get<PriceItem[]>(`/catalog/price-lists/${priceListId}/items`)

export const addPriceItem = (priceListId: string, data: { productId: string, listPrice: number, minimumPrice?: number, taxRate: number }) =>
  http.post<PriceItem>(`/catalog/price-lists/${priceListId}/items`, data, { headers: { 'Idempotency-Key': createIdempotencyKey('price-item') } })

export const publishPriceList = (priceListId: string, version: number) =>
  http.post<PriceListItem>(`/catalog/price-lists/${priceListId}/actions/publish`, { version })
