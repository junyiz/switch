export type ModeType = 0 | 1 | 2 | 3 // 0: direct, 1: system, 2: proxy, 3: switch

export type ProxyScheme = 'http' | 'https' | 'socks4' | 'socks5'

export interface ProxyServer {
  scheme: ProxyScheme
  host: string
  port: number
}

export interface ModeRules {
  fallbackProxy: ProxyServer
  bypassList?: string[]
}

export interface PacScript {
  data: string
  mandatory: boolean
}

export interface Mode {
  name: string
  desc: string
  type: ModeType
  json?: string
  pacScript?: PacScript
  rules?: ModeRules
  enabled: boolean // 是否启用
  isEditing?: boolean // 是否正在编辑
}

export interface AddModeFormValues {
  name: string
  type: string
}

// Chrome API 相关类型
export interface ChromeProxyConfig {
  mode: 'direct' | 'system' | 'fixed_servers' | 'pac_script'
  rules?: {
    singleProxy?: ProxyServer
    bypassList?: string[]
  }
  pacScript?: PacScript
}

// 工具函数类型
export type ProxyChangeHandler = (params: {
  value?: Mode
  isSwitch?: boolean
}) => void

export type ModeChangeHandler = (name: string, rules: ModeRules) => void

export type JsonChangeHandler = (name: string, json: string) => void
