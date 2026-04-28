import React, { useCallback } from 'react';
import { CanvasComponent, ComponentType, LayoutMode } from '../types';
import { useEditor } from '../context/EditorContext';
import './CanvasRenderer.css';

interface CanvasRendererProps {
  component: CanvasComponent;
  isSelected: boolean;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  layoutMode: LayoutMode;
  isPreviewMode?: boolean;
}

const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  component,
  isSelected,
  isDragging,
  onMouseDown,
  layoutMode,
  isPreviewMode = false,
}) => {
  const { state, selectComponent } = useEditor();

  const handleChildMouseDown = useCallback((e: React.MouseEvent, childId: string) => {
    if (isPreviewMode) return;
    e.stopPropagation();
    selectComponent(childId);
  }, [selectComponent, isPreviewMode]);
  const getComponentStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {
      ...component.style,
      width: typeof component.style.width === 'number' 
        ? `${component.style.width}px` 
        : component.style.width,
      height: typeof component.style.height === 'number'
        ? `${component.style.height}px`
        : component.style.height,
      padding: typeof component.style.padding === 'number'
        ? `${component.style.padding}px`
        : component.style.padding,
      margin: typeof component.style.margin === 'number'
        ? `${component.style.margin}px`
        : component.style.margin,
      fontSize: typeof component.style.fontSize === 'number'
        ? `${component.style.fontSize}px`
        : component.style.fontSize,
      borderRadius: typeof component.style.borderRadius === 'number'
        ? `${component.style.borderRadius}px`
        : component.style.borderRadius,
      top: typeof component.style.top === 'number' ? `${component.style.top}px` : component.style.top,
      left: typeof component.style.left === 'number' ? `${component.style.left}px` : component.style.left,
      right: typeof component.style.right === 'number' ? `${component.style.right}px` : component.style.right,
      bottom: typeof component.style.bottom === 'number' ? `${component.style.bottom}px` : component.style.bottom,
    };

    if (layoutMode === LayoutMode.GRID) {
      style.position = 'relative';
      delete style.top;
      delete style.left;
    }

    return style;
  };

  const renderComponentContent = () => {
    switch (component.type) {
      case ComponentType.TEXT:
        return (
          <span style={{ color: 'inherit', fontSize: 'inherit' }}>
            {component.props.text || '文本'}
          </span>
        );

      case ComponentType.BUTTON:
        return (
          <button
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: 'transparent',
              color: 'inherit',
              fontSize: 'inherit',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {component.props.text || '按钮'}
          </button>
        );

      case ComponentType.IMAGE:
        return (
          <img
            src={component.props.imageUrl || 'https://picsum.photos/200/150'}
            alt="canvas-image"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 'inherit',
            }}
            draggable={false}
          />
        );

      case ComponentType.INPUT:
        if (isPreviewMode) {
          return (
            <input
              type="text"
              placeholder={component.props.placeholder || '请输入内容'}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: 'inherit',
                padding: '0 12px',
                boxSizing: 'border-box',
              }}
            />
          );
        }
        return (
          <input
            type="text"
            placeholder={component.props.placeholder || '请输入内容'}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: 'inherit',
              padding: 0,
            }}
            readOnly
            onClick={(e) => e.stopPropagation()}
          />
        );

      case ComponentType.SELECT:
        if (isPreviewMode) {
          const options = component.props.options || [];
          return (
            <select
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: 'inherit',
                padding: '0 12px',
                color: component.props.defaultValue ? 'inherit' : '#bfbfbf',
                cursor: 'pointer',
                boxSizing: 'border-box',
              }}
              defaultValue={component.props.defaultValue}
            >
              {!component.props.defaultValue && (
                <option value="" disabled>
                  {component.props.placeholder || '请选择'}
                </option>
              )}
              {options.map((opt: { label: string; value: string }) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        }
        
        const selectedOption = component.props.options?.find(
          (opt) => opt.value === component.props.defaultValue
        );
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 11px',
              fontSize: 'inherit',
              color: selectedOption ? 'inherit' : '#bfbfbf',
            }}
          >
            <span>{selectedOption?.label || component.props.placeholder || '请选择'}</span>
            <span style={{ fontSize: '12px', color: '#bfbfbf' }}>▼</span>
          </div>
        );

      case ComponentType.DIVIDER:
        return <hr style={{ width: '100%', margin: 0, border: 'none' }} />;

      case ComponentType.CONTAINER:
      case ComponentType.ROW:
      case ComponentType.COL:
      case ComponentType.CARD:
      case ComponentType.TABLE:
      case ComponentType.TABS:
        const hasChildren = component.children && component.children.length > 0;
        
        const flexStyles = {
          [ComponentType.ROW]: { flexDirection: 'row', flexWrap: 'wrap' },
          [ComponentType.COL]: { flexDirection: 'column' },
          [ComponentType.CONTAINER]: { flexDirection: 'column' },
          [ComponentType.CARD]: { flexDirection: 'column' },
          [ComponentType.TABLE]: { flexDirection: 'column' },
          [ComponentType.TABS]: { flexDirection: 'column' },
        };
        
        const containerStyle: React.CSSProperties = {
          width: '100%',
          height: '100%',
          display: 'flex',
          ...flexStyles[component.type as keyof typeof flexStyles],
          alignItems: hasChildren ? 'flex-start' : 'center',
          justifyContent: hasChildren ? 'flex-start' : 'center',
          color: '#999',
          fontSize: '14px',
          position: 'relative',
          overflow: 'visible',
          padding: hasChildren ? '8px' : '0',
          gap: hasChildren ? '8px' : '0',
        };
        
        return (
          <div style={containerStyle}>
            {!hasChildren && (component.props.text || component.name)}
            {hasChildren && component.children!.map((child) => {
              const isChildSelected = state.selectedComponentId === child.id;
              return (
                <CanvasRenderer
                  key={child.id}
                  component={child}
                  isSelected={isChildSelected}
                  isDragging={false}
                  onMouseDown={(e) => handleChildMouseDown(e, child.id)}
                  layoutMode={layoutMode}
                  isPreviewMode={isPreviewMode}
                />
              );
            })}
          </div>
        );

      default:
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {component.name}
          </div>
        );
    }
  };

  const wrapperClasses = [
    'canvas-component-wrapper',
    isSelected ? 'selected' : '',
    isDragging ? 'dragging' : '',
    component.locked ? 'locked' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={wrapperClasses}
      style={getComponentStyle()}
      onMouseDown={onMouseDown}
      data-component-id={component.id}
    >
      {renderComponentContent()}
      {isSelected && (
        <>
          <div className="resize-handle resize-handle-nw" />
          <div className="resize-handle resize-handle-n" />
          <div className="resize-handle resize-handle-ne" />
          <div className="resize-handle resize-handle-e" />
          <div className="resize-handle resize-handle-se" />
          <div className="resize-handle resize-handle-s" />
          <div className="resize-handle resize-handle-sw" />
          <div className="resize-handle resize-handle-w" />
          <div className="component-label">{component.name}</div>
        </>
      )}
    </div>
  );
};

export default CanvasRenderer;
