import { Card, Statistic, Row, Col, Progress, Tag, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, WarningOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface StatCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  prefix?: React.ReactNode;
  trend?: 'up' | 'down' | 'normal';
  trendValue?: string;
  progress?: number;
  color?: string;
  icon?: React.ReactNode;
  warning?: boolean;
  warningMessage?: string;
}

const StatCard = ({
  title,
  value,
  suffix,
  prefix,
  trend,
  trendValue,
  progress,
  color = '#1890ff',
  icon,
  warning = false,
  warningMessage,
}: StatCardProps) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return '#52c41a';
      case 'down': return '#ff4d4f';
      default: return 'inherit';
    }
  };

  return (
    <Card
      style={{
        height: '100%',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        border: warning ? '1px solid #ff4d4f' : 'none',
      }}
      bodyStyle={{ padding: 20 }}
    >
      <Row justify="space-between" align="middle" style={{ marginBottom: progress ? 16 : 0 }}>
        <Col>
          <Text type="secondary" style={{ fontSize: 14 }}>{title}</Text>
        </Col>
        <Col>
          {icon}
        </Col>
      </Row>
      
      <Row align="middle" gutter={8}>
        <Col>
          <Statistic
            value={value}
            suffix={suffix}
            prefix={prefix}
            valueStyle={{ 
              color, 
              fontSize: 28, 
              fontWeight: 600,
              margin: '8px 0',
            }}
          />
        </Col>
        {trend && trendValue && (
          <Col>
            <Tag
              color={getTrendColor()}
              icon={
                trend === 'up' ? <ArrowUpOutlined /> : 
                trend === 'down' ? <ArrowDownOutlined /> : null
              }
            >
              {trendValue}
            </Tag>
          </Col>
        )}
      </Row>

      {progress !== undefined && (
        <Progress
          percent={progress}
          strokeColor={color}
          showInfo={false}
          strokeWidth={8}
        />
      )}

      {warning && warningMessage && (
        <div
          style={{
            marginTop: 12,
            padding: '8px 12px',
            background: '#fff2f0',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <WarningOutlined style={{ color: '#ff4d4f' }} />
          <Text type="danger" style={{ fontSize: 12 }}>{warningMessage}</Text>
        </div>
      )}
    </Card>
  );
};

export default StatCard;
