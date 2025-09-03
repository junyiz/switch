import React, { Component, ReactNode } from 'react'
import { Result, Button } from 'antd'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * 错误边界组件
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    
    // 这里可以添加错误上报逻辑
    if (process.env.NODE_ENV === 'production') {
      // 生产环境错误上报
      this.reportError(error, errorInfo)
    }
  }

  private reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // 可以集成错误监控服务，如 Sentry
    console.error('Reporting error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Result
          status="error"
          title="应用程序出现错误"
          subTitle={`错误信息: ${this.state.error?.message || '未知错误'}`}
          extra={[
            <Button key="reset" onClick={this.handleReset}>
              重试
            </Button>,
            <Button key="reload" type="primary" onClick={this.handleReload}>
              重新加载
            </Button>,
          ]}
        />
      )
    }

    return this.props.children
  }
}
