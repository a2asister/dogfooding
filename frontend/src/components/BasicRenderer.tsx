import type { ComponentInstance } from '../types';

interface BasicRendererProps {
  component: ComponentInstance;
}

export default function BasicRenderer(props: BasicRendererProps) {
  const { type, config, style } = props.component;

  const baseStyle = {
    'background-color': style.backgroundColor,
    'border-radius': `${style.borderRadius || 0}px`,
    opacity: style.opacity ?? 1,
    'border-color': style.borderColor,
    'border-width': `${style.borderWidth || 0}px`,
    'border-style': style.borderStyle || 'solid',
    padding: `${style.padding || 0}px`,
    color: style.color || '#ffffff',
    'font-family': style.fontFamily || 'system-ui',
    'text-align': style.textAlign || 'center',
    width: '100%',
    height: '100%',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    overflow: 'hidden',
  };

  switch (type) {
    case 'text':
      return (
        <div style={baseStyle}>
          <span style={{
            'font-size': `${config.fontSize || 16}px`,
            'font-weight': config.fontWeight || 'normal',
            'text-align': config.align || 'left',
            width: '100%',
          }}>
            {config.content || '文本内容'}
          </span>
        </div>
      );

    case 'title':
      return (
        <div style={baseStyle}>
          <h2 style={{
            'font-size': `${config.fontSize || 24}px`,
            'font-weight': config.fontWeight || 'bold',
            margin: 0,
            'text-align': config.align || 'center',
            width: '100%',
          }}>
            {config.content || '标题文本'}
          </h2>
        </div>
      );

    case 'image':
      return (
        <div style={baseStyle}>
          {config.src ? (
            <img
              src={config.src}
              alt="组件图片"
              style={{
                width: '100%',
                height: '100%',
                'object-fit': config.objectFit || 'contain',
              }}
            />
          ) : (
            <div style={{ color: '#6b7280', 'font-size': '14px' }}>
              🖼️ 点击右侧设置图片地址
            </div>
          )}
        </div>
      );

    case 'rectangle':
      return (
        <div style={{
          ...baseStyle,
          'background-color': config.backgroundColor || style.backgroundColor || '#6366f1',
          'border-radius': `${config.borderRadius || 0}px`,
          opacity: config.opacity ?? 1,
        }} />
      );

    case 'border':
      return (
        <div style={{
          ...baseStyle,
          'border-width': `${config.borderWidth || 2}px`,
          'border-color': config.borderColor || '#818cf8',
          'border-style': config.borderStyle || 'solid',
          'border-radius': `${config.borderRadius || 0}px`,
        }} />
      );

    case 'table': {
      const columns = config.columns?.length > 0
        ? config.columns
        : Array.from({ length: 4 }, (_, i) => ({ key: `col${i}`, title: `列${i + 1}` }));
      const tableData = config.data?.length > 0
        ? config.data
        : Array.from({ length: 5 }, (_, i) =>
            columns.reduce((acc: any, col: any, j: number) => {
              acc[col.key] = `数据${i + 1}-${j + 1}`;
              return acc;
            }, {})
          );

      return (
        <div style={{ ...baseStyle, display: 'block', overflow: 'auto' }}>
          <table style={{ width: '100%', 'border-collapse': 'collapse' }}>
            <thead>
              <tr>
                {columns.map((col: any) => (
                  <th style={{
                    'background-color': config.headerBackground || '#4f46e5',
                    color: config.headerColor || '#ffffff',
                    padding: '12px 16px',
                    'text-align': 'left',
                    'border-bottom': '1px solid #374151',
                    'font-weight': 600,
                  }}>
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row: any, i: number) => (
                <tr style={{
                  'background-color': config.stripe && i % 2 === 1 ? '#1e293b' : 'transparent',
                }}>
                  {columns.map((col: any) => (
                    <td style={{
                      padding: '10px 16px',
                      'border-bottom': '1px solid #334155',
                      color: '#e2e8f0',
                    }}>
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'progress':
      return (
        <div style={{
          ...baseStyle,
          'flex-direction': 'column' as const,
          gap: '8px',
        }}>
          {config.showInfo !== false && (
            <span style={{ 'font-size': '14px', color: '#a0aec0' }}>
              {config.percent || 75}%
            </span>
          )}
          <div style={{
            width: '100%',
            height: `${config.strokeWidth || 12}px`,
            'background-color': '#334155',
            'border-radius': '9999px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${config.percent || 75}%`,
              height: '100%',
              'background-color': config.color || '#8b5cf6',
              'border-radius': '9999px',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      );

    case 'countup': {
      const formatNumber = (num: number, decimals: number = 0) => {
        return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      };

      return (
        <div style={baseStyle}>
          <span style={{
            'font-size': '32px',
            'font-weight': 'bold',
            color: '#818cf8',
            'font-family': 'monospace',
          }}>
            {config.prefix || ''}{formatNumber(config.value || 0, config.decimals || 0)}{config.suffix || ''}
          </span>
        </div>
      );
    }

    default:
      return <div style={baseStyle}>未支持的组件类型</div>;
  }
}
