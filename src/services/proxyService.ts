import { message } from 'antd'
import { Mode, ChromeProxyConfig } from '../Proxies/types'
import { json2pac } from '../Proxies/utils'
import { parse } from 'jsonc-parser'
import { DEFAULT_RULE } from '../Proxies/consts'

/**
 * 代理服务管理类
 */
export class ProxyService {
  /**
   * 发送代理配置到 Chrome 背景脚本
   */
  private static sendProxyConfig(config: ChromeProxyConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!chrome.runtime) {
        reject(new Error('Chrome runtime not available'))
        return
      }

      chrome.runtime.sendMessage(config, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(response)
        }
      })
    })
  }

  /**
   * 更新固定代理服务器
   */
  static async updateFixedProxy(mode: Mode): Promise<void> {
    if (!mode.rules?.fallbackProxy) {
      throw new Error('代理配置缺失')
    }

    const config: ChromeProxyConfig = {
      mode: 'fixed_servers',
      rules: {
        singleProxy: mode.rules.fallbackProxy,
        bypassList: mode.rules.bypassList || [],
      },
    }

    try {
      await this.sendProxyConfig(config)
      message.success(`启用固定代理 ${mode.name}`)
    } catch (error) {
      console.error('Failed to update fixed proxy:', error)
      message.error('设置固定代理失败')
      throw error
    }
  }

  /**
   * 更新 PAC 脚本
   */
  static async updatePacScript(mode: Mode, isSwitch: boolean, allModes: Mode[]): Promise<void> {
    const json = mode.json || DEFAULT_RULE

    let parsedJson: Record<string, string[]>
    try {
      parsedJson = parse(json)
    } catch (error) {
      console.error('Failed to parse PAC script JSON:', error)
      message.error('PAC 脚本格式错误')
      throw error
    }

    const config: ChromeProxyConfig = {
      mode: 'pac_script',
      pacScript: {
        data: json2pac(parsedJson, allModes),
        mandatory: true,
      },
    }

    try {
      await this.sendProxyConfig(config)
      if (isSwitch) {
        message.success(`启用自动切换模式 ${mode.name}`)
      } else {
        message.success(`自动切换模式 ${mode.name} 的规则已更新`)
      }
    } catch (error) {
      console.error('Failed to update PAC script:', error)
      message.error('设置 PAC 脚本失败')
      throw error
    }
  }

  /**
   * 更新默认代理（直连或系统代理）
   */
  static async updateDefaultProxy(mode: Mode): Promise<void> {
    if (mode.type !== 0 && mode.type !== 1) {
      throw new Error('Invalid mode type for default proxy')
    }

    const config: ChromeProxyConfig = {
      mode: mode.name as 'direct' | 'system',
    }

    try {
      await this.sendProxyConfig(config)
      if (mode.name === 'direct') {
        message.success('启用直连')
      } else {
        message.success('启用系统代理')
      }
    } catch (error) {
      console.error('Failed to update default proxy:', error)
      message.error('设置代理失败')
      throw error
    }
  }

  /**
   * 根据模式类型选择合适的更新方法
   */
  static async updateProxy(mode: Mode, isSwitch = false, allModes: Mode[] = []): Promise<void> {
    switch (mode.type) {
      case 0:
      case 1:
        await this.updateDefaultProxy(mode)
        break
      case 2:
        await this.updateFixedProxy(mode)
        break
      case 3:
        await this.updatePacScript(mode, isSwitch, allModes)
        break
      default:
        throw new Error(`Unsupported mode type: ${mode.type}`)
    }
  }
}
