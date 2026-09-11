import type * as T from './type'
import http from '@/utils/http'

export type * from './type'

/** 登录 */
export function login(data: { tenantId: string, username: string, password: string }) {
  return http.post<T.Login>('/auth/login', data)
}

/** 退出登录 */
export function logout() {
  return Promise.resolve({ code: 'OK', data: undefined, message: '已退出', success: true })
}

/** 获取用户信息 */
export const getUserInfo = () => {
  return http.get<T.UserInfo>('/auth/me')
}
