import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  FileSpreadsheet,
  FileCode,
  File,
  Loader2,
  Plus,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { documentApi } from '@/services/api';
import Layout from '@/components/Layout';

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [uploadMethod, setUploadMethod] = useState<'file' | 'text'>('file');
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileForm, setFileForm] = useState({
    file: null as File | null,
    title: '',
  });

  const [textForm, setTextForm] = useState({
    title: '',
    content: '',
    type: 'text' as 'text' | 'code',
  });

  const handleFileSelect = (file: File) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'text/plain',
    ];
    const validExtensions = ['.pdf', '.xlsx', '.xls', '.csv', '.js', '.ts', '.py', '.java', '.go', '.rs', '.c', '.cpp', '.html', '.css', '.txt'];
    const ext = '.' + file.name.toLowerCase().split('.').pop();

    if (!validTypes.includes(file.type) && !validExtensions.includes(ext)) {
      toast.error('不支持的文件格式，请上传 PDF、Excel、CSV、代码文件或文本文件');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('文件大小不能超过 50MB');
      return;
    }

    setFileForm({
      file,
      title: file.name.replace(/\.[^/.]+$/, ''),
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const clearFile = () => {
    setFileForm({ file: null, title: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileForm.file) {
      toast.error('请选择要上传的文件');
      return;
    }

    setIsUploading(true);
    try {
      const result = await documentApi.upload(fileForm.file, fileForm.title);
      toast.success('文件上传成功！');
      navigate(`/documents/${result.id}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || '上传失败';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTextUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textForm.title.trim() || !textForm.content.trim()) {
      toast.error('请填写标题和内容');
      return;
    }

    setIsUploading(true);
    try {
      const result = await documentApi.create({
        title: textForm.title,
        content: textForm.content,
        type: textForm.type,
      });
      toast.success('文档创建成功！');
      navigate(`/documents/${result.id}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || '创建失败';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    const ext = file.name.toLowerCase().split('.').pop();
    if (ext === 'pdf') return <FileText className="w-8 h-8 text-red-500" />;
    if (['xlsx', 'xls', 'csv'].includes(ext || '')) return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
    if (['js', 'ts', 'py', 'java', 'go', 'rs', 'c', 'cpp', 'html', 'css'].includes(ext || '')) {
      return <FileCode className="w-8 h-8 text-blue-500" />;
    }
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">上传文档</h1>
          <p className="text-gray-500 mt-1">支持 PDF、Excel、代码文件及文本文件</p>
        </div>

        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setUploadMethod('file')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              uploadMethod === 'file'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload className="w-5 h-5" />
            <span>上传文件</span>
          </button>
          <button
            onClick={() => setUploadMethod('text')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              uploadMethod === 'text'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Plus className="w-5 h-5" />
            <span>直接创建</span>
          </button>
        </div>

        {uploadMethod === 'file' && (
          <div className="card">
            <form onSubmit={handleFileUpload} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择文件
                </label>
                {!fileForm.file ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                      dragOver
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                    }`}
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-700 font-medium mb-2">
                      拖拽文件到此处，或点击选择文件
                    </p>
                    <p className="text-sm text-gray-500">
                      支持 PDF、Excel、CSV、代码文件及文本文件 (最大 50MB)
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    {getFileIcon(fileForm.file)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{fileForm.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(fileForm.file.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={clearFile}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInputChange}
                  className="hidden"
                  accept=".pdf,.xlsx,.xls,.csv,.js,.ts,.py,.java,.go,.rs,.c,.cpp,.html,.css,.txt"
                />
              </div>

              <div>
                <label htmlFor="fileTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  文档标题 (可选，默认为文件名)
                </label>
                <input
                  id="fileTitle"
                  type="text"
                  value={fileForm.title}
                  onChange={(e) => setFileForm(prev => ({ ...prev, title: e.target.value }))}
                  className="input-field"
                  placeholder="请输入文档标题"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/documents')}
                  className="btn-secondary flex-1"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !fileForm.file}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>上传中...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>上传文档</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {uploadMethod === 'text' && (
          <div className="card">
            <form onSubmit={handleTextUpload} className="space-y-6">
              <div>
                <label htmlFor="textTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  文档标题 <span className="text-red-500">*</span>
                </label>
                <input
                  id="textTitle"
                  type="text"
                  value={textForm.title}
                  onChange={(e) => setTextForm(prev => ({ ...prev, title: e.target.value }))}
                  className="input-field"
                  placeholder="请输入文档标题"
                  required
                />
              </div>

              <div>
                <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 mb-2">
                  文档类型
                </label>
                <select
                  id="contentType"
                  value={textForm.type}
                  onChange={(e) => setTextForm(prev => ({ ...prev, type: e.target.value as 'text' | 'code' }))}
                  className="input-field"
                >
                  <option value="text">普通文本</option>
                  <option value="code">代码片段</option>
                </select>
              </div>

              <div>
                <label htmlFor="textContent" className="block text-sm font-medium text-gray-700 mb-2">
                  文档内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="textContent"
                  value={textForm.content}
                  onChange={(e) => setTextForm(prev => ({ ...prev, content: e.target.value }))}
                  className="input-field font-mono"
                  placeholder="请输入文档内容..."
                  rows={15}
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/documents')}
                  className="btn-secondary flex-1"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>创建中...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>创建文档</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card bg-gray-50 border-dashed">
          <h3 className="font-semibold text-gray-900 mb-3">支持的文件格式</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: FileText, label: 'PDF', desc: '.pdf', color: 'text-red-500 bg-red-50' },
              { icon: FileSpreadsheet, label: 'Excel', desc: '.xlsx, .xls, .csv', color: 'text-green-500 bg-green-50' },
              { icon: FileCode, label: '代码', desc: '.js, .ts, .py, .java, etc.', color: 'text-blue-500 bg-blue-50' },
              { icon: File, label: '文本', desc: '.txt, etc.', color: 'text-gray-500 bg-gray-100' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.color.split(' ')[1]}`}>
                  <item.icon className={`w-5 h-5 ${item.color.split(' ')[0]}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UploadPage;
