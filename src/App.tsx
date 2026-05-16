import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

function EditorContent() {
  return (
    <div className="h-full flex items-center justify-center text-[#6e6e6e]">
      <div className="text-center">
        <p className="text-sm">编辑器区域 - 预留插槽</p>
        <p className="text-xs mt-2">后续将实现代码编辑器功能</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout editorContent={<EditorContent />} />} />
      </Routes>
    </Router>
  );
}
