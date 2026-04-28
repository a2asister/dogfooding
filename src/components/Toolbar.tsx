import React from 'react';
import { Button, Dropdown, MenuProps, Space, Slider, message, Tooltip } from 'antd';
import {
  UndoOutlined,
  RedoOutlined,
  SaveOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  DeleteOutlined,
  CopyOutlined,
  DesktopOutlined,
  MobileOutlined,
  TabletOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ClearOutlined,
  ExportOutlined,
  SettingOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useEditor } from '../context/EditorContext';
import { DeviceType, LayoutMode } from '../types';
import { deviceConfigs } from '../data/componentTemplates';
import './Toolbar.css';

interface ToolbarProps {}

const Toolbar: React.FC<ToolbarProps> = () => {
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    clearCanvas,
    changeDevice,
    changeZoom,
    changeLayoutMode,
    state,
    pasteComponent,
    getSelectedComponent,
    togglePreviewMode,
  } = useEditor();

  const selectedComponent = getSelectedComponent();
  const isPreviewMode = state.isPreviewMode;

  const handleUndo = () => {
    if (canUndo) {
      undo();
      message.info('已撤销');
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      redo();
      message.info('已重做');
    }
  };

  const handleClearCanvas = () => {
    clearCanvas();
    message.success('画布已清空');
  };

  const handleSave = () => {
    message.success('保存成功');
  };

  const handlePreview = () => {
    togglePreviewMode();
    message.info(isPreviewMode ? '已退出预览模式' : '已进入预览模式');
  };

  const handleExport = () => {
    message.info('导出功能');
  };

  const deviceMenuItems: MenuProps['items'] = deviceConfigs.map((config) => ({
    key: config.type,
    label: (
      <Space>
        {config.type === DeviceType.PC && <DesktopOutlined />}
        {config.type === DeviceType.TABLET && <TabletOutlined />}
        {config.type === DeviceType.MOBILE && <MobileOutlined />}
        {config.type === DeviceType.MINI_PROGRAM && <MobileOutlined />}
        <span>{config.name}</span>
        <span style={{ color: '#999', fontSize: '12px' }}>
          {config.width} × {config.height}
        </span>
      </Space>
    ),
    onClick: () => changeDevice(config.type),
  }));

  const currentDeviceConfig = deviceConfigs.find((d) => d.type === state.currentDevice);

  const zoomMenuItems: MenuProps['items'] = [
    { key: '50', label: '50%', onClick: () => changeZoom(50) },
    { key: '75', label: '75%', onClick: () => changeZoom(75) },
    { key: '100', label: '100%', onClick: () => changeZoom(100) },
    { key: '125', label: '125%', onClick: () => changeZoom(125) },
    { key: '150', label: '150%', onClick: () => changeZoom(150) },
  ];

  if (isPreviewMode) {
    return (
      <div className="toolbar toolbar-preview">
        <div className="toolbar-left">
          <div className="logo-section">
            <span className="logo-icon">🎨</span>
            <span className="logo-text">预览模式</span>
          </div>
        </div>
        <div className="toolbar-right">
          <Space.Compact>
            <Dropdown menu={{ items: deviceMenuItems }} placement="bottomRight">
              <Button>
                {state.currentDevice === DeviceType.PC && <DesktopOutlined />}
                {state.currentDevice === DeviceType.TABLET && <TabletOutlined />}
                {state.currentDevice === DeviceType.MOBILE && <MobileOutlined />}
                {state.currentDevice === DeviceType.MINI_PROGRAM && <MobileOutlined />}
                <span style={{ marginLeft: 4 }}>{currentDeviceConfig?.name}</span>
              </Button>
            </Dropdown>
            <Tooltip title="退出预览">
              <Button
                type="primary"
                danger
                icon={<CloseCircleOutlined />}
                onClick={handlePreview}
              >
                退出预览
              </Button>
            </Tooltip>
          </Space.Compact>
        </div>
      </div>
    );
  }

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <div className="logo-section">
          <span className="logo-icon">🎨</span>
          <span className="logo-text">低代码编辑器</span>
        </div>

        <div className="divider" />

        <Space.Compact>
          <Tooltip title="撤销 (Ctrl+Z)">
            <Button
              icon={<UndoOutlined />}
              onClick={handleUndo}
              disabled={!canUndo}
            />
          </Tooltip>
          <Tooltip title="重做 (Ctrl+Y)">
            <Button
              icon={<RedoOutlined />}
              onClick={handleRedo}
              disabled={!canRedo}
            />
          </Tooltip>
        </Space.Compact>

        <div className="divider" />

        <Space.Compact>
          <Tooltip title="复制">
            <Button
              icon={<CopyOutlined />}
              onClick={() => {
                if (selectedComponent) {
                  pasteComponent();
                  message.success('已复制到剪贴板');
                }
              }}
              disabled={!selectedComponent}
            />
          </Tooltip>
          <Tooltip title="粘贴">
            <Button
              icon={<CopyOutlined rotate={180} />}
              onClick={() => {
                pasteComponent();
                message.success('已粘贴');
              }}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={handleClearCanvas}
            />
          </Tooltip>
        </Space.Compact>

        <div className="divider" />

        <Space.Compact>
          <Button
            type={state.layoutMode === LayoutMode.FREE ? 'primary' : 'default'}
            onClick={() => changeLayoutMode(LayoutMode.FREE)}
          >
            自由布局
          </Button>
          <Button
            type={state.layoutMode === LayoutMode.GRID ? 'primary' : 'default'}
            onClick={() => changeLayoutMode(LayoutMode.GRID)}
          >
            栅格布局
          </Button>
        </Space.Compact>
      </div>

      <div className="toolbar-right">
        <Space.Compact>
          <Tooltip title="缩小">
            <Button
              icon={<ZoomOutOutlined />}
              onClick={() => changeZoom(Math.max(50, state.zoom - 25))}
            />
          </Tooltip>
          <Dropdown menu={{ items: zoomMenuItems }}>
            <Button style={{ minWidth: 70 }}>{state.zoom}%</Button>
          </Dropdown>
          <Tooltip title="放大">
            <Button
              icon={<ZoomInOutlined />}
              onClick={() => changeZoom(Math.min(200, state.zoom + 25))}
            />
          </Tooltip>
        </Space.Compact>

        <div className="divider" />

        <Dropdown menu={{ items: deviceMenuItems }} placement="bottomRight">
          <Button>
            {state.currentDevice === DeviceType.PC && <DesktopOutlined />}
            {state.currentDevice === DeviceType.TABLET && <TabletOutlined />}
            {state.currentDevice === DeviceType.MOBILE && <MobileOutlined />}
            {state.currentDevice === DeviceType.MINI_PROGRAM && <MobileOutlined />}
            <span style={{ marginLeft: 4 }}>{currentDeviceConfig?.name}</span>
          </Button>
        </Dropdown>

        <div className="divider" />

        <Space.Compact>
          <Tooltip title="清空画布">
            <Button icon={<ClearOutlined />} onClick={handleClearCanvas} />
          </Tooltip>
          <Tooltip title="预览">
            <Button type="primary" icon={<EyeOutlined />} onClick={handlePreview}>
              预览
            </Button>
          </Tooltip>
          <Tooltip title="导出">
            <Button icon={<ExportOutlined />} onClick={handleExport} />
          </Tooltip>
          <Tooltip title="保存">
            <Button icon={<SaveOutlined />} onClick={handleSave}>
              保存
            </Button>
          </Tooltip>
        </Space.Compact>
      </div>
    </div>
  );
};

export default Toolbar;
