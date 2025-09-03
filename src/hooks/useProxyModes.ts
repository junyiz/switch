import { useState, useEffect, useCallback, useMemo } from 'react'
import { Mode, AddModeFormValues, ModeRules, ModeType } from '../Proxies/types'
import { StorageManager } from '../utils/storage'
import { ProxyService } from '../services/proxyService'
import { DEFAULT_FIXED_SERVER_RULES, DEFAULT_RULE } from '../Proxies/consts'
import { parse } from 'jsonc-parser'
import { Modal } from 'antd'

const initialModes: Mode[] = [
  { name: 'direct', type: 0, desc: '直接连接', enabled: true },
  { name: 'system', type: 1, desc: '系统代理', enabled: false },
  {
    name: 'whistle',
    type: 2,
    desc: '固定代理',
    rules: DEFAULT_FIXED_SERVER_RULES as ModeRules,
    enabled: false,
    isEditing: true,
  },
  {
    name: 'fixedProxy',
    type: 2,
    desc: '固定代理',
    rules: DEFAULT_FIXED_SERVER_RULES as ModeRules,
    enabled: false,
    isEditing: false,
  },
  { name: 'autoSwitch', type: 3, desc: 'PAC 脚本', enabled: false, isEditing: false },
]

/**
 * 代理模式管理 Hook
 */
export function useProxyModes() {
  const [modes, setModes] = useState<Mode[]>(() => {
    const stored = StorageManager.getModes()
    return stored.length > 0 ? stored : initialModes
  })

  const [editMode, setEditMode] = useState<Mode | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // 计算当前编辑的模式
  useEffect(() => {
    const editingMode = modes.find((m) => m.isEditing) || null
    setEditMode(editingMode)
  }, [modes])

  // 保存到存储
  const saveModes = useCallback((newModes: Mode[]) => {
    StorageManager.setModes(newModes)
  }, [])

  // 更新模式状态
  const updateModes = useCallback(
    (updater: (prevModes: Mode[]) => Mode[]) => {
      setModes((prevModes) => {
        const newModes = updater(prevModes)
        saveModes(newModes)
        return newModes
      })
    },
    [saveModes],
  )

  // 编辑模式
  const handleEditMode = useCallback(
    (targetMode: Mode) => {
      updateModes((prevModes) =>
        prevModes.map((mode) => ({
          ...mode,
          isEditing: mode.name === targetMode.name,
        })),
      )
    },
    [updateModes],
  )

  // 删除模式
  const handleDelete = useCallback(
    (mode: Mode) => {
      if (mode.enabled) {
        Modal.error({ content: '不能删除正在使用的代理模式' })
        return
      }

      // 检查是否有 PAC 脚本依赖此模式
      const dependentMode = modes.find((m) => {
        if (m.type === 3) {
          try {
            const json = parse(m.json || DEFAULT_RULE)
            return json[mode.name]
          } catch {
            return false
          }
        }
        return false
      })

      if (dependentMode) {
        Modal.confirm({
          content: `自动切换模式 ${dependentMode.name} 依赖 ${mode.name}，是否删除？`,
          onOk() {
            updateModes((prevModes) => prevModes.filter((m) => m.name !== mode.name))
          },
        })
      } else {
        updateModes((prevModes) => prevModes.filter((m) => m.name !== mode.name))
      }
    },
    [modes, updateModes],
  )

  // 切换代理
  const handleProxyChange = useCallback(
    async (params: { value?: Mode; isSwitch?: boolean }) => {
      const { value: mode, isSwitch = false } = params
      if (!mode) return

      try {
        await ProxyService.updateProxy(mode, isSwitch, modes)

        updateModes((prevModes) =>
          prevModes.map((m) => ({
            ...m,
            enabled: m.name === mode.name,
          })),
        )
      } catch (error) {
        console.error('Failed to change proxy:', error)
      }
    },
    [modes, updateModes],
  )

  // 更新模式配置
  const handleModeChange = useCallback(
    async (name: string, rules: ModeRules) => {
      updateModes((prevModes) => {
        const updatedModes = prevModes.map((m) => (m.name === name ? { ...m, rules } : m))

        // 如果当前模式正在使用或有 PAC 脚本需要更新
        const targetMode = updatedModes.find((m) => m.name === name)
        const enabledPacMode = updatedModes.find((m) => m.enabled && m.type === 3)

        if (targetMode?.enabled) {
          ProxyService.updateProxy(targetMode, false, updatedModes).catch(console.error)
        } else if (enabledPacMode) {
          ProxyService.updateProxy(enabledPacMode, false, updatedModes).catch(console.error)
        }

        return updatedModes
      })
    },
    [updateModes],
  )

  // 添加新模式
  const handleAddMode = useCallback(
    (values: AddModeFormValues) => {
      const name = values.name.trim()
      const type = Number(values.type) as ModeType

      if (type === 2) {
        const mode: Mode = {
          name,
          desc: '固定代理',
          type,
          rules: DEFAULT_FIXED_SERVER_RULES as ModeRules,
          enabled: false,
          isEditing: true,
        }

        updateModes((prevModes) => {
          const newModes = [...prevModes.map((m) => ({ ...m, isEditing: false })), mode]

          // 更新可能依赖的 PAC 脚本
          const enabledPacMode = modes.find((m) => m.enabled && m.type === 3)
          if (enabledPacMode) {
            const json = parse(enabledPacMode.json || DEFAULT_RULE)
            if (json[name]) {
              ProxyService.updateProxy(enabledPacMode, false, newModes).catch(console.error)
            }
          }

          return newModes
        })
      } else if (type === 3) {
        const mode: Mode = {
          name,
          desc: 'PAC 脚本',
          type,
          enabled: false,
          isEditing: true,
        }

        updateModes((prevModes) => [...prevModes.map((m) => ({ ...m, isEditing: false })), mode])
      }
    },
    [modes, updateModes],
  )

  // 更新 JSON 配置
  const handleJsonChange = useCallback(
    async (name: string, json: string) => {
      updateModes((prevModes) => {
        const updatedModes = prevModes.map((m) => (m.name === name ? { ...m, json } : m))

        // 如果当前 PAC 脚本正在使用，立即更新
        const targetMode = updatedModes.find((m) => m.name === name && m.enabled)
        if (targetMode) {
          ProxyService.updateProxy(targetMode, false, updatedModes).catch(console.error)
        }

        return updatedModes
      })
    },
    [updateModes],
  )

  // 计算派生状态
  const derivedState = useMemo(
    () => ({
      enabledMode: modes.find((m) => m.enabled) || null,
      hasCustomModes: modes.some((m) => m.type > 1),
      modeNames: modes.map((m) => m.name),
    }),
    [modes],
  )

  return {
    modes,
    editMode,
    modalOpen,
    setModalOpen,
    ...derivedState,
    handlers: {
      handleEditMode,
      handleDelete,
      handleProxyChange,
      handleModeChange,
      handleAddMode,
      handleJsonChange,
    },
  }
}
