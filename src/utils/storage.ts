import { Mode } from '../Proxies/types'

const STORAGE_KEY = 'modes'

/**
 * 存储管理类
 */
export class StorageManager {
  /**
   * 从 localStorage 获取模式列表
   */
  static getModes(): Mode[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to parse modes from localStorage:', error)
      return []
    }
  }

  /**
   * 保存模式列表到 localStorage
   */
  static setModes(modes: Mode[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(modes))
    } catch (error) {
      console.error('Failed to save modes to localStorage:', error)
    }
  }

  /**
   * 清空所有存储的模式
   */
  static clearModes(): void {
    localStorage.removeItem(STORAGE_KEY)
  }

  /**
   * 导出配置
   */
  static exportConfig(): string {
    return localStorage.getItem(STORAGE_KEY) || '[]'
  }

  /**
   * 导入配置
   */
  static importConfig(config: string): void {
    try {
      // 验证配置格式
      const modes = JSON.parse(config)
      if (Array.isArray(modes)) {
        localStorage.setItem(STORAGE_KEY, config)
      } else {
        throw new Error('Invalid configuration format')
      }
    } catch (error) {
      console.error('Failed to import configuration:', error)
      throw error
    }
  }
}
