import React from 'react'
import { Result, Button, Typography } from 'antd'
import { HomeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

const NotFound: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <Result
        status="404"
        title={
          <Title level={1} style={{ color: '#fff', fontSize: 120, margin: 0 }}>
            404
          </Title>
        }
        subTitle={
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18 }}>
            抱歉，您访问的页面不存在
          </Text>
        }
        extra={
          <Button
            type="primary"
            size="large"
            icon={<HomeOutlined />}
            onClick={() => navigate('/dashboard')}
            style={{ marginTop: 24 }}
          >
            返回首页
          </Button>
        }
      />
    </div>
  )
}

export default NotFound
