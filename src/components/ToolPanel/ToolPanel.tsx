import React from 'react';
import ToolItem from './ToolItem';
import { ElementType } from '../../types';

const toolTypes: ElementType[] = [
  'title',
  'list',
  'bold',
  'italic',
  'link',
  'divider',
  'rectangle',
  'slide'
];

const ToolPanel: React.FC = () => {
  return (
    <div className="w-64 h-full bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">工具面板</h2>
        <p className="text-xs text-gray-500 mt-1">拖拽元素到画布</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {toolTypes.map((type) => (
            <ToolItem key={type} type={type} />
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-gray-100">
        <div className="text-xs text-gray-500 space-y-1">
          <p>• 拖拽元素到画布添加</p>
          <p>• 点击元素选中</p>
          <p>• 双击文本元素编辑</p>
          <p>• Delete 键删除选中</p>
        </div>
      </div>
    </div>
  );
};

export default ToolPanel;
