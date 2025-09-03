import { memo } from 'react'
import { CheckOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useProxyModes } from '../hooks/useProxyModes'
import { debounce } from '../utils'
import MonacoEditor from './MonacoEditor'
import AddModeModal from './AddModeModal'
import ModeEditor from './ModeEditor'
import { DEFAULT_RULE, DEFAULT_FIXED_SERVER_RULES } from './consts'
import './styles.less'
import { ModeRules } from './types'

const Proxies = memo(() => {
  const {
    modes,
    editMode,
    modalOpen,
    setModalOpen,
    handlers: {
      handleEditMode,
      handleDelete,
      handleProxyChange,
      handleModeChange,
      handleAddMode,
      handleJsonChange,
    },
  } = useProxyModes()

  return (
    <>
      <div className="mode">
        {modes.map((mode) => (
          <div className={`mode-item${mode.enabled ? ' enabled' : ''}`} key={mode.name}>
            <div
              className="mode-item-name"
              onClick={() => handleProxyChange({ value: mode, isSwitch: true })}
            >
              {mode.name}
            </div>
            <div className="mode-item-desc">{mode.desc}</div>
            <div className="mode-item-btns">
              <CheckOutlined
                style={mode.enabled ? { color: '#1890ff' } : {}}
                onClick={() => handleProxyChange({ value: mode, isSwitch: true })}
              />
              {mode.type > 1 && (
                <>
                  <EditOutlined
                    style={mode.isEditing ? { color: '#1890ff' } : {}}
                    onClick={() => handleEditMode(mode)}
                  />
                  <DeleteOutlined onClick={() => handleDelete(mode)} style={{ fontSize: '14px' }} />
                </>
              )}
            </div>
          </div>
        ))}
        <div className="mode-item mode-item-new" onClick={() => setModalOpen(true)}>
          <PlusOutlined />
        </div>
      </div>
      {editMode?.type === 2 && (
        <ModeEditor
          value={editMode.rules || (DEFAULT_FIXED_SERVER_RULES as ModeRules)}
          onChange={debounce((rules) => handleModeChange(editMode.name, rules), 300)}
        />
      )}
      {editMode?.type === 3 && (
        <MonacoEditor
          value={editMode.json || DEFAULT_RULE}
          onChange={debounce((json) => handleJsonChange(editMode.name, json), 300)}
        />
      )}
      <AddModeModal
        modalOpen={modalOpen}
        modes={modes}
        setModalOpen={setModalOpen}
        onChange={debounce(handleAddMode, 300)}
      />
    </>
  )
})

Proxies.displayName = 'Proxies'

export default Proxies
