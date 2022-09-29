import Axios, {
  type AxiosInstance as Http,
  type AxiosRequestConfig as HttpRequestConfig
} from 'axios'
import { wrapper } from 'axios-cookiejar-support'
import { CookieJar } from 'tough-cookie'

/**
 * 创建实例
 */
export const createHttp = (config?: HttpRequestConfig) => {
  const CONFIG: HttpRequestConfig = {
    jar: new CookieJar(),
    withCredentials: true
  }

  const httpConfig = Object.assign(CONFIG, config)
  return wrapper(Axios.create(httpConfig))
}

export { HttpRequestConfig, Http }
