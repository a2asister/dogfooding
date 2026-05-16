import React, { useState, useEffect } from 'react';
import { FileItem } from '../types';

interface DocumentReaderProps {
  file: FileItem;
}

const DocumentReader: React.FC<DocumentReaderProps> = ({ file }) => {
  const [documentType, setDocumentType] = useState<'txt' | 'word' | 'pdf'>('txt');
  const [content, setContent] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [showOutline, setShowOutline] = useState(false);

  useEffect(() => {
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.pdf')) {
      setDocumentType('pdf');
    } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      setDocumentType('word');
    } else {
      setDocumentType('txt');
    }

    if (file.content) {
      setContent(file.content);
    } else {
      setContent(generateSampleContent(documentType));
    }
  }, [file]);

  const generateSampleContent = (type: string) => {
    if (type === 'pdf') {
      return `PDF 文档示例

第 1 章：概述

这是一个 PDF 文档阅读器的示例。
PDF（Portable Document Format）是一种文件格式，
用于以独立于应用软件、硬件和操作系统的方式
呈现文档。

第 2 章：功能特性

- 文档预览
- 缩放功能
- 页面导航
- 搜索功能

第 3 章：技术实现

PDF 阅读器使用现代浏览器的 PDF 渲染引擎，
提供高质量的文档显示效果。

---
文档创建于 ${new Date().toLocaleDateString()}
`;
    } else if (type === 'word') {
      return `Word 文档示例

【文档标题】项目报告

一、项目概述

本项目旨在开发一个功能完善的桌面操作系统，
提供用户友好的界面和丰富的应用程序支持。

二、主要功能

1. 文件管理系统
   - 创建、编辑、删除文件
   - 文件夹管理
   - 文件搜索功能

2. 内置应用程序
   - 文本编辑器
   - 图片查看器
   - 视频播放器
   - 文档阅读器

3. 系统设置
   - 主题自定义
   - 显示设置
   - 个性化配置

三、总结

该项目具有良好的可扩展性，
未来将继续添加更多功能。

---
作者：系统团队
日期：${new Date().toLocaleDateString()}
`;
    }
    return `文本文件示例

文件名：${file.name}

这是一个文本文件阅读器的示例。
您可以使用以下快捷键：

Ctrl + + 放大字体
Ctrl + - 缩小字体
Ctrl + 0 重置字体

---
文本内容区域：

Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco.
Duis aute irure dolor in reprehenderit in voluptate velit esse.
Excepteur sint occaecat cupidatat non proident, sunt in culpa.

---
文件创建时间：${new Date().toLocaleString()}
`;
  };

  const handleFontSizeUp = () => {
    setFontSize(prev => Math.min(32, prev + 2));
  };

  const handleFontSizeDown = () => {
    setFontSize(prev => Math.max(8, prev - 2));
  };

  const handleResetFontSize = () => {
    setFontSize(14);
  };

  const getDocumentIcon = () => {
    switch (documentType) {
      case 'pdf':
        return '📕';
      case 'word':
        return '📘';
      default:
        return '📄';
    }
  };

  const getDocumentTypeName = () => {
    switch (documentType) {
      case 'pdf':
        return 'PDF 文档';
      case 'word':
        return 'Word 文档';
      default:
        return '文本文档';
    }
  };

  return (
    <div
      className="document-reader"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#fff',
      }}
    >
      <div
        className="document-toolbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          background: '#f3f3f3',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>{getDocumentIcon()}</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
              {file.name}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {getDocumentTypeName()}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleFontSizeDown}
            style={{
              padding: '6px 12px',
              background: '#e0e0e0',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            A⁻
          </button>
          <span style={{ fontSize: '12px', color: '#666', minWidth: '40px', textAlign: 'center' }}>
            {fontSize}px
          </span>
          <button
            onClick={handleFontSizeUp}
            style={{
              padding: '6px 12px',
              background: '#e0e0e0',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            A⁺
          </button>
          <button
            onClick={handleResetFontSize}
            style={{
              padding: '6px 12px',
              background: '#e0e0e0',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            重置
          </button>
          <button
            onClick={() => setShowOutline(!showOutline)}
            style={{
              padding: '6px 12px',
              background: showOutline ? '#0078d4' : '#e0e0e0',
              border: 'none',
              borderRadius: '4px',
              color: showOutline ? '#fff' : '#333',
              cursor: 'pointer',
            }}
          >
            📋 目录
          </button>
        </div>
      </div>

      <div
        className="document-body"
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {showOutline && (
          <div
            className="document-outline"
            style={{
              width: '200px',
              background: '#fafafa',
              borderRight: '1px solid #e0e0e0',
              padding: '16px',
              overflowY: 'auto',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '12px' }}>
              文档目录
            </div>
            <div style={{ fontSize: '13px', color: '#333', cursor: 'pointer', padding: '8px', borderRadius: '4px' }}>
              1. 概述
            </div>
            <div style={{ fontSize: '13px', color: '#333', cursor: 'pointer', padding: '8px', borderRadius: '4px', marginLeft: '16px' }}>
              1.1 项目背景
            </div>
            <div style={{ fontSize: '13px', color: '#333', cursor: 'pointer', padding: '8px', borderRadius: '4px', marginLeft: '16px' }}>
              1.2 目标
            </div>
            <div style={{ fontSize: '13px', color: '#333', cursor: 'pointer', padding: '8px', borderRadius: '4px' }}>
              2. 功能特性
            </div>
            <div style={{ fontSize: '13px', color: '#333', cursor: 'pointer', padding: '8px', borderRadius: '4px' }}>
              3. 技术实现
            </div>
          </div>
        )}

        <div
          className="document-content"
          style={{
            flex: 1,
            padding: '32px',
            overflowY: 'auto',
            fontFamily: 'Segoe UI, sans-serif',
            fontSize: `${fontSize}px`,
            lineHeight: '1.8',
            color: '#333',
            background: documentType === 'pdf' ? '#f5f5f5' : '#fff',
          }}
        >
          {documentType === 'pdf' ? (
            <div
              style={{
                background: '#fff',
                padding: '40px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                maxWidth: '800px',
                margin: '0 auto',
                minHeight: '100%',
              }}
            >
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
                {content}
              </pre>
            </div>
          ) : documentType === 'word' ? (
            <div
              style={{
                background: '#fff',
                padding: '40px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                maxWidth: '800px',
                margin: '0 auto',
                minHeight: '100%',
              }}
            >
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
                {content}
              </pre>
            </div>
          ) : (
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'Consolas, monospace', margin: 0 }}>
              {content}
            </pre>
          )}
        </div>
      </div>

      <div
        className="document-footer"
        style={{
          padding: '8px 16px',
          background: '#f3f3f3',
          borderTop: '1px solid #e0e0e0',
          fontSize: '12px',
          color: '#666',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>字符数：{content.length}</span>
        <span>行数：{content.split('\n').length}</span>
        <span>最后修改：{file.updatedAt ? new Date(file.updatedAt).toLocaleString() : '未知'}</span>
      </div>
    </div>
  );
};

export default DocumentReader;