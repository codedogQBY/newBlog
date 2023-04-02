const proxyConfigMappings = {
  dev: {
    prefix: '/api',
    target: 'http://127.0.0.1:7001/',
  },
  test: {
    prefix: '/api',
    target: 'http://127.0.0.1:7001/',
  },
  prod: {
    prefix: '/api',
    target: 'http://127.0.0.1:7001/',
  },
}

export function getProxyConfig(envType = 'dev') {
  return proxyConfigMappings[envType]
}
