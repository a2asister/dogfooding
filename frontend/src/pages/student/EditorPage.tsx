import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Modal, Form, Input, Select, message, Space, Divider } from 'antd';
import { SaveOutlined, ExportOutlined, ShareAltOutlined } from '@ant-design/icons';
import BlocklyEditor from '../../components/BlocklyEditor';
import { projectsAPI } from '../../services/api';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';
import * as Blockly from 'blockly';

const { TextArea } = Input;
const { Option } = Select;

export const EditorPage = () => {
  const [code, setCode] = useState('');
  const [blocksXml, setBlocksXml] = useState('');
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [level, setLevel] = useState<'beginner' | 'basic' | 'advanced'>('basic');
  const [exportLanguage, setExportLanguage] = useState<'javascript' | 'python'>('javascript');
  const [workspaceInstance, setWorkspaceInstance] = useState<Blockly.WorkspaceSvg | null>(null);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  const handleBlocksChange = useCallback((xml: string) => {
    setBlocksXml(xml);
  }, []);

  useEffect(() => {
    const autoSave = setInterval(() => {
      if (blocksXml && currentProjectId) {
        localStorage.setItem('autosave_project', JSON.stringify({
          id: currentProjectId,
          code,
          blocksXml,
          timestamp: Date.now(),
        }));
      }
    }, 30000);

    return () => clearInterval(autoSave);
  }, [code, blocksXml, currentProjectId]);

  const handleSave = async (values: { title: string; description: string; isPublic: boolean; category: string }) => {
    try {
      if (currentProjectId) {
        await projectsAPI.updateProject(currentProjectId, {
          ...values,
          code,
          blocksXml,
        });
        message.success('作品已更新！');
      } else {
        const response = await projectsAPI.createProject({
          ...values,
          code,
          blocksXml,
        });
        setCurrentProjectId(response.data.project.id);
        message.success('作品已保存！');
      }
      setSaveModalVisible(false);
    } catch (err) {
      message.error('保存失败，请重试');
    }
  };

  const handleExport = () => {
    let exportCode = '';
    if (workspaceInstance) {
      exportCode = exportLanguage === 'javascript'
        ? javascriptGenerator.workspaceToCode(workspaceInstance)
        : pythonGenerator.workspaceToCode(workspaceInstance);
    }
    
    const blob = new Blob([exportCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${exportLanguage === 'javascript' ? 'js' : 'py'}`;
    a.click();
    URL.revokeObjectURL(url);
    setExportModalVisible(false);
    message.success('导出成功！');
  };

  const handleShare = () => {
    if (!currentProjectId) {
      message.warning('请先保存作品再分享');
      return;
    }
    const shareUrl = `${window.location.origin}/projects/${currentProjectId}`;
    navigator.clipboard.writeText(shareUrl);
    message.success('分享链接已复制到剪贴板！');
  };

  return (
    <div className="h-[calc(100vh-180px)]">
      <Card
        className="h-full"
        bodyStyle={{ padding: 0, height: '100%' }}
        title={
          <div className="flex items-center gap-4">
            <span>💻 编程创作</span>
            <Select
              value={level}
              onChange={(value) => setLevel(value)}
              size="small"
              className="w-32"
            >
              <Option value="beginner">🌱 启蒙级</Option>
              <Option value="basic">📖 基础级</Option>
              <Option value="advanced">🚀 进阶级</Option>
            </Select>
          </div>
        }
        extra={
          <Space>
            <Button
              icon={<SaveOutlined />}
              type="primary"
              onClick={() => setSaveModalVisible(true)}
            >
              保存作品
            </Button>
            <Button
              icon={<ExportOutlined />}
              onClick={() => setExportModalVisible(true)}
            >
              导出代码
            </Button>
            <Button
              icon={<ShareAltOutlined />}
              onClick={handleShare}
            >
              分享
            </Button>
          </Space>
        }
      >
        <div className="h-full">
          <BlocklyEditor
            level={level}
            onCodeChange={handleCodeChange}
            onBlocksChange={handleBlocksChange}
          />
        </div>
      </Card>

      <Modal
        title="💾 保存作品"
        open={saveModalVisible}
        onCancel={() => setSaveModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="title"
            label="作品名称"
            rules={[{ required: true, message: '请输入作品名称' }]}
          >
            <Input placeholder="给你的作品起个名字吧" />
          </Form.Item>
          <Form.Item name="description" label="作品描述">
            <TextArea rows={3} placeholder="简单介绍一下你的作品" />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Select placeholder="选择分类">
              <Option value="animation">🎬 动画</Option>
              <Option value="game">🎮 游戏</Option>
              <Option value="art">🎨 艺术</Option>
              <Option value="music">🎵 音乐</Option>
              <Option value="story">📖 故事</Option>
              <Option value="other">📦 其他</Option>
            </Select>
          </Form.Item>
          <Form.Item name="isPublic" label="公开设置" valuePropName="checked" initialValue={false}>
            <Select>
              <Option value={false}>🔒 私密（仅自己可见）</Option>
              <Option value={true}>🌍 公开（所有人可见）</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setSaveModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">保存</Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="📤 导出代码"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        footer={null}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">选择编程语言</label>
            <Select
              value={exportLanguage}
              onChange={setExportLanguage}
              className="w-full"
            >
              <Option value="javascript">JavaScript</Option>
              <Option value="python">Python</Option>
            </Select>
          </div>
          <Divider />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">预览代码</label>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-64 text-sm">
              {code || '// 拖拽积木块生成代码'}
            </pre>
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setExportModalVisible(false)}>取消</Button>
            <Button type="primary" onClick={handleExport}>
              下载代码
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EditorPage;
