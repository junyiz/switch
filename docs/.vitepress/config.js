export default {
  // 站点级选项
  title: 'MetaSwitch',
  description: '快捷地管理和切换多个代理设置',

  base: '/MetaSwitch/',

  // 主题配置
  themeConfig: {
    logo: { src: '/images/icon48.png', width: 24, height: 24 },

    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: 'GitHub', link: 'https://github.com/junyiz/MetaSwitch' },
    ],

    // 社交链接
    socialLinks: [{ icon: 'github', link: 'https://github.com/junyiz/MetaSwitch' }],

    // 侧边栏
    sidebar: [
      {
        text: '指南',
        items: [
          { text: '介绍', link: '/' },
          { text: '快速开始', link: '/guide/getting-started' },
        ],
      },
    ],

    // 页脚
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Junyi Zhang',
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/junyiz/MetaSwitch/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页面',
    },

    // 最后更新时间
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium',
      },
    },

    // 搜索功能
    search: {
      provider: 'local',
    },
  },

  // 外观配置
  appearance: 'dark',

  // 构建配置
  vite: {
    // 构建优化
    build: {
      minify: true,
      cssCodeSplit: true,
    },
    // 服务器配置
    server: {
      port: 3000,
      host: true,
    },
  },

  // Markdown 配置
  markdown: {
    lineNumbers: true,
    config: (md) => {
      // 可以添加 markdown-it 插件
    },
  },

  // 头部配置
  head: [
    ['link', { rel: 'icon', href: '/images/icon48.png' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
  ],
}
