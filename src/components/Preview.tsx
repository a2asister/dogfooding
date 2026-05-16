import { useState, useEffect, useRef } from 'react';
import { RefreshCw, ExternalLink, Loader2 } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';

export const Preview = () => {
  const files = useProjectStore((state) => state.files);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const refreshKeyRef = useRef(0);

  const getFileByName = (name: string) => {
    return files.find((f) => f.name === name);
  };

  const generatePreviewHtml = () => {
    const htmlFile = getFileByName('index.html');
    const cssFile = getFileByName('style.css');
    const jsFile = getFileByName('app.js');

    let htmlContent = htmlFile?.content || '';
    
    if (cssFile) {
      htmlContent = htmlContent.replace(
        /<link[^>]*href=["']style\.css["'][^>]*>/gi,
        `<style>${cssFile.content}</style>`
      );
      if (!htmlContent.includes('<style>')) {
        htmlContent = htmlContent.replace(
          '</head>',
          `<style>${cssFile.content}</style></head>`
        );
      }
    }

    if (jsFile) {
      htmlContent = htmlContent.replace(
        /<script[^>]*src=["']app\.js["'][^>]*><\/script>/gi,
        `<script>${jsFile.content}</script>`
      );
      if (!htmlContent.includes(`<script>${jsFile.content}</script>`)) {
        htmlContent = htmlContent.replace(
          '</body>',
          `<script>${jsFile.content}</script></body>`
        );
      }
    }

    return htmlContent;
  };

  const handleRefresh = () => {
    setIsLoading(true);
    refreshKeyRef.current += 1;
    if (iframeRef.current) {
      iframeRef.current.srcdoc = generatePreviewHtml();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [files]);

  useEffect(() => {
    const handleRefreshPreview = () => {
      handleRefresh();
    };
    window.addEventListener('refreshPreview', handleRefreshPreview);
    return () => window.removeEventListener('refreshPreview', handleRefreshPreview);
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="h-9 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2">
        <span className="text-sm text-gray-600 font-medium">预览</span>
        <div className="flex-1" />
        <button
          onClick={handleRefresh}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="刷新预览"
        >
          <RefreshCw size={14} className="text-gray-500" />
        </button>
        <button
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="在新窗口打开"
        >
          <ExternalLink size={14} className="text-gray-500" />
        </button>
      </div>
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <Loader2 size={24} className="text-gray-400 animate-spin" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          key={refreshKeyRef.current}
          srcDoc={generatePreviewHtml()}
          className="w-full h-full border-0"
          title="Preview"
          sandbox="allow-scripts allow-forms allow-modals"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
};
