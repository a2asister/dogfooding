import React, { useState, useCallback } from 'react';
import { Layout } from 'antd';
import { EditorProvider, useEditor } from '../context/EditorContext';
import Toolbar from './Toolbar';
import ComponentLibrary from './ComponentLibrary';
import Canvas from './Canvas';
import PropertyPanel from './PropertyPanel';
import { ComponentTemplate } from '../types';
import './Editor.css';

const { Sider, Content } = Layout;

interface EditorInnerProps {}

const EditorInner: React.FC<EditorInnerProps> = () => {
  const { addComponent, state } = useEditor();
  const [draggingTemplate, setDraggingTemplate] = useState<ComponentTemplate | null>(null);

  const isPreviewMode = state.isPreviewMode;

  const handleDragStart = useCallback((template: ComponentTemplate, _e: React.DragEvent) => {
    setDraggingTemplate(template);
  }, []);

  const handleDrop = useCallback(
    (template: ComponentTemplate, position: { x: number; y: number }) => {
      addComponent(template, position);
      setDraggingTemplate(null);
    },
    [addComponent]
  );

  if (isPreviewMode) {
    return (
      <Layout className="editor-layout editor-preview-layout">
        <Toolbar />
        <Layout className="editor-main">
          <Content className="canvas-content canvas-content-full">
            <Canvas onDrop={handleDrop} draggingTemplate={draggingTemplate} />
          </Content>
        </Layout>
      </Layout>
    );
  }

  return (
    <Layout className="editor-layout">
      <Toolbar />
      <Layout className="editor-main">
        <Sider width={280} className="component-library-sider" theme="light">
          <ComponentLibrary onDragStart={handleDragStart} />
        </Sider>
        <Content className="canvas-content">
          <Canvas onDrop={handleDrop} draggingTemplate={draggingTemplate} />
        </Content>
        <Sider width={320} className="property-panel-sider" theme="light">
          <PropertyPanel />
        </Sider>
      </Layout>
    </Layout>
  );
};

interface EditorProps {}

const Editor: React.FC<EditorProps> = () => {
  return (
    <EditorProvider>
      <EditorInner />
    </EditorProvider>
  );
};

export default Editor;
