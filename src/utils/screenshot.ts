import { useRef, useCallback, useState } from 'react';
import { Camera, Video, Download, X, Check } from 'lucide-react';

interface ScreenshotButtonProps {
  targetRef?: React.RefObject<HTMLElement>;
}

export function useScreenshot(targetRef?: React.RefObject<HTMLElement>) {
  const [isScreenshotting, setIsScreenshotting] = useState(false);
  const [lastScreenshot, setLastScreenshot] = useState<string | null>(null);
  
  const takeScreenshot = useCallback(async () => {
    if (!targetRef?.current) return null;
    
    setIsScreenshotting(true);
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      setLastScreenshot(dataUrl);
      
      return dataUrl;
    } catch (error) {
      console.error('Screenshot failed:', error);
      return null;
    } finally {
      setIsScreenshotting(false);
    }
  }, [targetRef]);
  
  const downloadScreenshot = useCallback((dataUrl?: string) => {
    const url = dataUrl || lastScreenshot;
    if (!url) return;
    
    const link = document.createElement('a');
    link.download = `three-gorges-dam-${Date.now()}.png`;
    link.href = url;
    link.click();
  }, [lastScreenshot]);
  
  return {
    takeScreenshot,
    downloadScreenshot,
    isScreenshotting,
    lastScreenshot,
  };
}

interface ScreenshotPreviewProps {
  dataUrl: string;
  onClose: () => void;
  onDownload: () => void;
}

export function ScreenshotPreview({ dataUrl, onClose, onDownload }: ScreenshotPreviewProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="glass-panel p-4 max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-water-light" />
            <span className="font-medium">截图预览</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDownload}
              className="control-btn-primary text-sm"
            >
              <Download className="w-4 h-4" />
              下载
            </button>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto bg-black/30 rounded-lg">
          <img 
            src={dataUrl} 
            alt="Screenshot" 
            className="max-w-full h-auto rounded"
          />
        </div>
        
        <div className="mt-3 text-xs text-white/50 text-center">
          图片已生成，点击下载保存到本地
        </div>
      </div>
    </div>
  );
}

const MEDIA_RECORDER_OPTIONS: MediaRecorderOptions = {
  mimeType: 'video/webm;codecs=vp9',
  videoBitsPerSecond: 5000000,
};

export function useScreenRecorder(canvasElement?: HTMLCanvasElement) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const startRecording = useCallback(async () => {
    if (!canvasElement) {
      console.warn('No canvas element provided for recording');
      return false;
    }
    
    try {
      const stream = canvasElement.captureStream(60);
      streamRef.current = stream;
      
      let mediaRecorder: MediaRecorder;
      
      try {
        mediaRecorder = new MediaRecorder(stream, MEDIA_RECORDER_OPTIONS);
      } catch {
        mediaRecorder = new MediaRecorder(stream);
      }
      
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return false;
    }
  }, [canvasElement]);
  
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, [isRecording]);
  
  const downloadRecording = useCallback(() => {
    if (!recordedBlob) return;
    
    const url = URL.createObjectURL(recordedBlob);
    const link = document.createElement('a');
    link.download = `three-gorges-dam-recording-${Date.now()}.webm`;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
  }, [recordedBlob]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return {
    startRecording,
    stopRecording,
    downloadRecording,
    isRecording,
    recordedBlob,
    recordingTime,
    formatTime,
  };
}
