export interface BackendPage<T> {
  items: T[]
  page: number
  size: number
  total: number
}

export const toPageRes = <T>(res: ApiRes<BackendPage<T>>): ApiRes<PageRes<T[]>> => ({
  ...res,
  data: { records: res.data.items, total: res.data.total }
})
