import React from 'react';
import { Tabs, Form, Input, InputNumber, Select, ColorPicker, Slider, Switch, Divider, Button, Space, message } from 'antd';
import {
  DeleteOutlined,
  CopyOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  LockOutlined,
  UnlockOutlined,
  UpCircleOutlined,
  DownCircleOutlined,
} from '@ant-design/icons';
import { useEditor } from '../context/EditorContext';
import { CanvasComponent, ComponentStyle, ComponentProps, ComponentType } from '../types';
import './PropertyPanel.css';

const { TextArea } = Input;

interface PropertyPanelProps {}

const PropertyPanel: React.FC<PropertyPanelProps> = () => {
  const {
    getSelectedComponent,
    updateComponentStyle,
    updateComponentProps,
    deleteComponent,
    copyComponent,
    pasteComponent,
    bringToFront,
    sendToBack,
    toggleLock,
    toggleVisibility,
    state,
  } = useEditor();

  const selectedComponent = getSelectedComponent();

  const handleStyleChange = (key: keyof ComponentStyle, value: unknown) => {
    if (!selectedComponent) return;
    updateComponentStyle(selectedComponent.id, { [key]: value });
  };

  const handlePropsChange = (key: keyof ComponentProps, value: unknown) => {
    if (!selectedComponent) return;
    updateComponentProps(selectedComponent.id, { [key]: value });
  };

  const handleDelete = () => {
    if (!selectedComponent) return;
    deleteComponent(selectedComponent.id);
    message.success('组件已删除');
  };

  const handleCopy = () => {
    if (!selectedComponent) return;
    copyComponent(selectedComponent.id);
    message.success('组件已复制');
  };

  const handlePaste = () => {
    pasteComponent();
    message.success('组件已粘贴');
  };

  const handleBringToFront = () => {
    if (!selectedComponent) return;
    bringToFront(selectedComponent.id);
    message.success('已置顶');
  };

  const handleSendToBack = () => {
    if (!selectedComponent) return;
    sendToBack(selectedComponent.id);
    message.success('已置底');
  };

  const handleToggleLock = () => {
    if (!selectedComponent) return;
    toggleLock(selectedComponent.id);
    message.info(selectedComponent.locked ? '组件已解锁' : '组件已锁定');
  };

  const handleToggleVisibility = () => {
    if (!selectedComponent) return;
    toggleVisibility(selectedComponent.id);
    message.info(selectedComponent.visible ? '组件已隐藏' : '组件已显示');
  };

  const renderStylePanel = (component: CanvasComponent) => {
    const style = component.style;

    return (
      <div className="panel-section">
        <div className="section-title">尺寸位置</div>
        <Form layout="vertical">
          <div className="form-row">
            <Form.Item label="宽度">
              <InputNumber
                style={{ width: '100%' }}
                value={typeof style.width === 'number' ? style.width : undefined}
                onChange={(v) => handleStyleChange('width', v)}
                placeholder="auto"
              />
            </Form.Item>
            <Form.Item label="高度">
              <InputNumber
                style={{ width: '100%' }}
                value={typeof style.height === 'number' ? style.height : undefined}
                onChange={(v) => handleStyleChange('height', v)}
                placeholder="auto"
              />
            </Form.Item>
          </div>
          {style.position === 'absolute' && (
            <div className="form-row">
              <Form.Item label="X">
                <InputNumber
                  style={{ width: '100%' }}
                  value={typeof style.left === 'number' ? style.left : 0}
                  onChange={(v) => handleStyleChange('left', v)}
                />
              </Form.Item>
              <Form.Item label="Y">
                <InputNumber
                  style={{ width: '100%' }}
                  value={typeof style.top === 'number' ? style.top : 0}
                  onChange={(v) => handleStyleChange('top', v)}
                />
              </Form.Item>
            </div>
          )}
        </Form>

        <Divider />

        <div className="section-title">内边距 & 外边距</div>
        <Form layout="vertical">
          <div className="form-row">
            <Form.Item label="内边距">
              <InputNumber
                style={{ width: '100%' }}
                value={typeof style.padding === 'number' ? style.padding : undefined}
                onChange={(v) => handleStyleChange('padding', v)}
                placeholder="0"
              />
            </Form.Item>
            <Form.Item label="外边距">
              <InputNumber
                style={{ width: '100%' }}
                value={typeof style.margin === 'number' ? style.margin : undefined}
                onChange={(v) => handleStyleChange('margin', v)}
                placeholder="0"
              />
            </Form.Item>
          </div>
        </Form>

        <Divider />

        <div className="section-title">背景 & 文字</div>
        <Form layout="vertical">
          <div className="form-row">
            <Form.Item label="背景颜色">
              <div className="color-picker-wrapper">
                <ColorPicker
                  value={style.backgroundColor as string}
                  onChange={(color) => handleStyleChange('backgroundColor', color.toHexString())}
                  showText
                />
              </div>
            </Form.Item>
            <Form.Item label="文字颜色">
              <div className="color-picker-wrapper">
                <ColorPicker
                  value={style.color as string}
                  onChange={(color) => handleStyleChange('color', color.toHexString())}
                  showText
                />
              </div>
            </Form.Item>
          </div>
          <div className="form-row">
            <Form.Item label="字体大小">
              <InputNumber
                style={{ width: '100%' }}
                value={typeof style.fontSize === 'number' ? style.fontSize : undefined}
                onChange={(v) => handleStyleChange('fontSize', v)}
                addonAfter="px"
              />
            </Form.Item>
            <Form.Item label="字重">
              <Select
                style={{ width: '100%' }}
                value={style.fontWeight}
                onChange={(v) => handleStyleChange('fontWeight', v)}
                options={[
                  { label: '正常', value: 'normal' },
                  { label: '粗体', value: 'bold' },
                  { label: '100', value: 100 },
                  { label: '200', value: 200 },
                  { label: '300', value: 300 },
                  { label: '400', value: 400 },
                  { label: '500', value: 500 },
                  { label: '600', value: 600 },
                  { label: '700', value: 700 },
                  { label: '800', value: 800 },
                  { label: '900', value: 900 },
                ]}
              />
            </Form.Item>
          </div>
          <Form.Item label="对齐方式">
            <Select
              style={{ width: '100%' }}
              value={style.textAlign}
              onChange={(v) => handleStyleChange('textAlign', v)}
              options={[
                { label: '左对齐', value: 'left' },
                { label: '居中', value: 'center' },
                { label: '右对齐', value: 'right' },
              ]}
            />
          </Form.Item>
        </Form>

        <Divider />

        <div className="section-title">边框 & 圆角</div>
        <Form layout="vertical">
          <div className="form-row">
            <Form.Item label="圆角">
              <InputNumber
                style={{ width: '100%' }}
                value={typeof style.borderRadius === 'number' ? style.borderRadius : undefined}
                onChange={(v) => handleStyleChange('borderRadius', v)}
                addonAfter="px"
              />
            </Form.Item>
            <Form.Item label="边框颜色">
              <div className="color-picker-wrapper">
                <ColorPicker
                  value={undefined}
                  onChange={(color) => handleStyleChange('border', `1px solid ${color.toHexString()}`)}
                  showText
                />
              </div>
            </Form.Item>
          </div>
          <Form.Item label="阴影">
            <Input
              value={style.boxShadow}
              onChange={(e) => handleStyleChange('boxShadow', e.target.value)}
              placeholder="如: 0 2px 8px rgba(0,0,0,0.1)"
            />
          </Form.Item>
        </Form>

        <Divider />

        <div className="section-title">层级</div>
        <Form layout="vertical">
          <Form.Item label="Z-Index">
            <InputNumber
              style={{ width: '100%' }}
              value={style.zIndex}
              onChange={(v) => handleStyleChange('zIndex', v)}
              placeholder="auto"
            />
          </Form.Item>
        </Form>
      </div>
    );
  };

  const renderPropsPanel = (component: CanvasComponent) => {
    const props = component.props;

    const renderContentByType = () => {
      switch (component.type) {
        case ComponentType.TEXT:
        case ComponentType.BUTTON:
        case ComponentType.CARD:
          return (
            <Form layout="vertical">
              <Form.Item label="文本内容">
                <TextArea
                  value={props.text}
                  onChange={(e) => handlePropsChange('text', e.target.value)}
                  rows={3}
                  placeholder="请输入文本内容"
                />
              </Form.Item>
            </Form>
          );

        case ComponentType.IMAGE:
          return (
            <Form layout="vertical">
              <Form.Item label="图片地址">
                <Input
                  value={props.imageUrl}
                  onChange={(e) => handlePropsChange('imageUrl', e.target.value)}
                  placeholder="请输入图片URL"
                />
              </Form.Item>
            </Form>
          );

        case ComponentType.INPUT:
          return (
            <Form layout="vertical">
              <Form.Item label="占位符">
                <Input
                  value={props.placeholder}
                  onChange={(e) => handlePropsChange('placeholder', e.target.value)}
                  placeholder="请输入占位符"
                />
              </Form.Item>
            </Form>
          );

        case ComponentType.SELECT:
          return (
            <Form layout="vertical">
              <Form.Item label="占位符">
                <Input
                  value={props.placeholder}
                  onChange={(e) => handlePropsChange('placeholder', e.target.value)}
                  placeholder="请输入占位符"
                />
              </Form.Item>
              <Form.Item label="选项 (JSON格式)">
                <TextArea
                  value={JSON.stringify(props.options, null, 2)}
                  onChange={(e) => {
                    try {
                      const options = JSON.parse(e.target.value);
                      handlePropsChange('options', options);
                    } catch {
                      // 忽略解析错误
                    }
                  }}
                  rows={6}
                  placeholder='[{"label": "选项1", "value": "value1"}]'
                />
              </Form.Item>
            </Form>
          );

        default:
          return (
            <Form layout="vertical">
              <Form.Item label="显示文本">
                <Input
                  value={props.text}
                  onChange={(e) => handlePropsChange('text', e.target.value)}
                  placeholder="请输入显示文本"
                />
              </Form.Item>
            </Form>
          );
      }
    };

    return <div className="panel-section">{renderContentByType()}</div>;
  };

  const renderInteractionPanel = () => {
    return (
      <div className="panel-section">
        <div className="section-title">交互配置</div>
        <div className="empty-tip">
          选中组件后可配置点击、悬浮、加载等交互行为
        </div>
      </div>
    );
  };

  const renderEmptyPanel = () => {
    return (
      <div className="empty-panel">
        <div className="empty-icon">🎯</div>
        <div className="empty-text">请选择画布中的组件</div>
        <div className="empty-hint">选中组件后可在此编辑属性和样式</div>
      </div>
    );
  };

  const renderToolbar = () => {
    if (!selectedComponent) return null;

    return (
      <div className="property-toolbar">
        <Space>
          <Button
            icon={<CopyOutlined />}
            size="small"
            onClick={handleCopy}
            title="复制"
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={handleDelete}
            title="删除"
          />
        </Space>
        <Space>
          <Button
            icon={selectedComponent.visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            size="small"
            onClick={handleToggleVisibility}
            title={selectedComponent.visible ? '隐藏' : '显示'}
          />
          <Button
            icon={selectedComponent.locked ? <LockOutlined /> : <UnlockOutlined />}
            size="small"
            onClick={handleToggleLock}
            title={selectedComponent.locked ? '解锁' : '锁定'}
          />
        </Space>
        <Space>
          <Button
            icon={<UpCircleOutlined />}
            size="small"
            onClick={handleBringToFront}
            title="置顶"
          />
          <Button
            icon={<DownCircleOutlined />}
            size="small"
            onClick={handleSendToBack}
            title="置底"
          />
        </Space>
      </div>
    );
  };

  const tabItems = [
    {
      key: 'style',
      label: '样式',
      children: selectedComponent ? renderStylePanel(selectedComponent) : renderEmptyPanel(),
    },
    {
      key: 'props',
      label: '属性',
      children: selectedComponent ? renderPropsPanel(selectedComponent) : renderEmptyPanel(),
    },
    {
      key: 'interaction',
      label: '交互',
      children: selectedComponent ? renderInteractionPanel() : renderEmptyPanel(),
    },
  ];

  return (
    <div className="property-panel">
      {selectedComponent && (
        <div className="component-info">
          <div className="component-name">{selectedComponent.name}</div>
          <div className="component-type">{selectedComponent.type}</div>
        </div>
      )}
      {renderToolbar()}
      <Tabs defaultActiveKey="style" items={tabItems} className="property-tabs" />
    </div>
  );
};

export default PropertyPanel;
