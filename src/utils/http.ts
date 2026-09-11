import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { Message, Notification } from '@arco-design/web-vue'
import axios from 'axios'
import NProgress from 'nprogress'
import router from '@/router'
import { clearToken, getToken } from '@/utils/auth'
import 'nprogress/nprogress.css'

// 配置 NProgress
NProgress.configure({ showSpinner: false })

/** 状态码消息映射 */
const StatusCodeMessage: Record<number, string> = {
  200: '服务器成功返回请求的数据',
  201: '新建或修改数据成功',
  202: '一个请求已经进入后台排队（异步任务）',
  204: '删除数据成功',
  400: '请求错误(400)',
  401: '未授权，请重新登录(401)',
  403: '拒绝访问(403)',
  404: '请求出错(404)',
  408: '请求超时(408)',
  500: '服务器错误(500)',
  501: '服务未实现(501)',
  502: '网络错误(502)',
  503: '服务不可用(503)',
  504: '网络超时(504)'
}

/** 创建 axios 实例 */
const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_PREFIX,
  timeout: 30 * 1000
})

// 请求拦截器
http.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    NProgress.start()
    const token = getToken()
    if (token) {
      if (!config.headers) {
        config.headers = {}
      }
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    NProgress.done()
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response
    const { message, code, traceId } = data
    const success = code === 'OK' || code === 0 || code === 200

    // token失效
    if (code === 'UNAUTHORIZED' || code === 401) {
      NProgress.done()
      clearToken()
      router.replace('/login')
      return Promise.reject(new Error(message || '登录已失效'))
    }

    if (!success) {
      NProgress.done()
      // 如果错误信息长度过长，使用 Notification 进行提示
      const errorMessage = `${message || '服务器端错误'}${traceId ? `（追踪 ID: ${traceId}）` : ''}`
      if (errorMessage.length <= 24) {
        Message.error(errorMessage)
      } else {
        Notification.error(errorMessage)
      }
      return Promise.reject(new Error('Error'))
    }

    NProgress.done()
    response.data = { ...data, success }
    return response
  },
  (error) => {
    NProgress.done()
    Message.clear()
    const response = Object.assign({}, error.response)
    const body = response?.data
    const detail = body?.message || StatusCodeMessage[response.status] || '系统异常，请检查网络或联系管理员'
    Message.error(`${detail}${body?.traceId ? `（追踪 ID: ${body.traceId}）` : ''}`)
    return Promise.reject(error)
  }
)

/** 封装请求方法 */
const request = <T = unknown>(config: AxiosRequestConfig): Promise<ApiRes<T>> => {
  return new Promise((resolve, reject) => {
    http
      .request<T>(config)
      .then((res: AxiosResponse) => resolve(res.data))
      .catch((err: { message: string }) => reject(err))
  })
}

/** GET 请求 */
const get = <T = any>(url: string, params?: object, config?: AxiosRequestConfig): Promise<ApiRes<T>> => {
  return request({
    method: 'get',
    url,
    params,
    ...config
  })
}

/** POST 请求 */
const post = <T = any>(url: string, params?: object, config?: AxiosRequestConfig): Promise<ApiRes<T>> => {
  return request({
    method: 'post',
    url,
    data: params,
    ...config
  })
}

export default { get, post, request }
