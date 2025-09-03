/**
 * 字符串转 Base64 编码
 */
export const strToBase64 = (str: string): string => {
  const bytes = new TextEncoder().encode(str)
  const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('')
  return window.btoa(binString)
}

/**
 * Base64 解码为字符串
 */
export const base64ToStr = (base64: string): string => {
  const binString = window.atob(base64)
  const bytes = Uint8Array.from(binString, (char) => char.codePointAt(0) as number)
  const decoder = new TextDecoder()
  return decoder.decode(bytes)
}

/**
 * 创建并下载文件
 */
export const downloadFile = (content: string, filename: string): void => {
  const link = document.createElement('a')
  const encodedContent = strToBase64(content)
  link.href = `data:,${encodedContent}`
  link.download = filename
  link.click()
}

/**
 * 选择并读取文件
 */
export const readFile = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.txt'
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement)?.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.readAsText(file)
        reader.onload = (e) => {
          const content = e.target?.result as string
          resolve(base64ToStr(content))
        }
        reader.onerror = reject
      } else {
        reject(new Error('No file selected'))
      }
    }
    
    input.click()
  })
}

/**
 * Chrome Storage 操作
 */
export const getStorage = async (key: string): Promise<any> => {
  return new Promise((resolve) => chrome.storage.sync.get(key, resolve))
}

/**
 * 防抖函数的通用实现
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}
