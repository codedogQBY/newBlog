import { getProxyConfig } from '../../settings'

export function createViteProxy(isUseProxy = true, proxyType) {
  if (!isUseProxy) return undefined

  const proxyConfig = getProxyConfig(proxyType)
  const proxy = {
    [proxyConfig.prefix]: {
      target: proxyConfig.target,
      changeOrigin: true,
      // rewrite: (path) => path.replace(new RegExp(`^${proxyConfig.prefix}`), ''),
      rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
    },
  }
  return proxy
}
