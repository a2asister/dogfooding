import React, { useState, useMemo } from 'react';
import { Input, Tabs, Card, Tooltip } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import * as Icons from '@ant-design/icons';
import { componentCategories } from '../data/componentTemplates';
import { ComponentCategory, ComponentTemplate } from '../types';
import './ComponentLibrary.css';

interface ComponentLibraryProps {
  onDragStart: (template: ComponentTemplate, e: React.DragEvent) => void;
}

const ComponentLibrary: React.FC<ComponentLibraryProps> = ({ onDragStart }) => {
  const [searchText, setSearchText] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchText.trim()) {
      return componentCategories;
    }

    return componentCategories
      .map((category) => ({
        ...category,
        components: category.components.filter((comp) =>
          comp.name.toLowerCase().includes(searchText.toLowerCase())
        ),
      }))
      .filter((category) => category.components.length > 0);
  }, [searchText]);

  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as Record<string, React.ComponentType>)[iconName];
    return IconComponent ? <IconComponent /> : null;
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    template: ComponentTemplate
  ) => {
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart(template, e);
  };

  const renderComponentItem = (template: ComponentTemplate) => (
    <Tooltip key={template.type} title={template.description || template.name}>
      <div
        className="component-item"
        draggable
        onDragStart={(e) => handleDragStart(e, template)}
      >
        <div className="component-icon">{getIcon(template.icon)}</div>
        <span className="component-name">{template.name}</span>
      </div>
    </Tooltip>
  );

  const renderCategory = (category: ComponentCategory) => (
    <div key={category.id} className="category-section">
      <div className="category-header">
        <span className="category-icon">{getIcon(category.icon)}</span>
        <span className="category-name">{category.name}</span>
      </div>
      <div className="component-grid">{category.components.map(renderComponentItem)}</div>
    </div>
  );

  const tabItems = filteredCategories.map((category) => ({
    key: category.id,
    label: (
      <span>
        {getIcon(category.icon)} {category.name}
      </span>
    ),
    children: (
      <div className="tab-content">
        {category.components.map((template) => (
          <Card
            key={template.type}
            size="small"
            className="component-card"
            hoverable
            draggable
            onDragStart={(e) => handleDragStart(e, template)}
          >
            <div className="component-card-content">
              <div className="component-card-icon">{getIcon(template.icon)}</div>
              <span className="component-card-name">{template.name}</span>
            </div>
          </Card>
        ))}
      </div>
    ),
  }));

  return (
    <div className="component-library">
      <div className="search-bar">
        <Input
          placeholder="搜索组件..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>
      <div className="component-content">
        {searchText ? (
          <div className="search-results">{filteredCategories.map(renderCategory)}</div>
        ) : (
          <Tabs
            defaultActiveKey="basic"
            items={tabItems}
            tabPosition="left"
            className="component-tabs"
          />
        )}
      </div>
    </div>
  );
};

export default ComponentLibrary;
