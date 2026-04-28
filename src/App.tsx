import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Editor from './components/Editor';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Editor />
    </ConfigProvider>
  );
}

export default App;
