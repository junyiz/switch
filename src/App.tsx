import { useState } from 'react'
import { Dropdown, message } from 'antd'
import type { MenuProps } from 'antd'
import dayjs from 'dayjs'
import { ExportOutlined, FullscreenOutlined, ImportOutlined, EllipsisOutlined } from '@ant-design/icons'

import Proxies from './Proxies/index'
import { downloadFile, readFile } from './utils'
import { StorageManager } from './utils/storage'
import { Loading } from './components/Loading'
import './App.less'

export default function App() {
  const [loading, setLoading] = useState(false)

  const handleExport = (): void => {
    setLoading(true)
    try {
      const config = StorageManager.exportConfig()
      const filename = `MetaSwitch-${dayjs().format('YYYY-MM-DD')}.txt`
      downloadFile(config, filename)
      message.success('配置导出成功')
    } catch (error) {
      console.error('Export failed:', error)
      message.error('配置导出失败')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async (): Promise<void> => {
    setLoading(true)
    try {
      const config = await readFile()
      StorageManager.importConfig(config)
      message.success('配置导入成功')
      // 延迟刷新页面以确保用户看到成功消息
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Import failed:', error)
      message.error('配置导入失败，请检查文件格式')
    } finally {
      setLoading(false)
    }
  }

  const menuItems: MenuProps['items'] = [
    {
      label: (
        <a onClick={handleExport}>
          <ExportOutlined /> Export Config
        </a>
      ),
      key: 'export',
    },
    {
      label: (
        <a onClick={handleImport}>
          <ImportOutlined /> Import Config
        </a>
      ),
      key: 'import',
    },
  ]

  return (
    <>
      <div className="head">
        <div className="title">Proxy MetaSwitch</div>
        <div className="action">
          {location.pathname.includes('/popup.html') && (
            <a 
              className="fullscreen" 
              href="./index.html" 
              target="_blank" 
              title="Expand to full tab"
            >
              <FullscreenOutlined />
            </a>
          )}
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <EllipsisOutlined className="ellipsis" />
          </Dropdown>
        </div>
      </div>
      <Loading spinning={loading}>
        <Proxies />
      </Loading>
    </>
  )
}
