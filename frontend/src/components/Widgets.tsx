import React, { useState, useEffect, useRef } from 'react';
import { Widget, WidgetType, TodoItem, WeatherData } from '../types';

interface WidgetsProps {
  widgets: Widget[];
  onWidgetMove: (id: string, x: number, y: number) => void;
  onWidgetClose: (id: string) => void;
}

const Widgets: React.FC<WidgetsProps> = ({ widgets, onWidgetMove, onWidgetClose }) => {
  const [draggingWidget, setDraggingWidget] = useState<string | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, widget: Widget) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingWidget(widget.id);
    dragStartPos.current = {
      x: e.clientX - widget.x,
      y: e.clientY - widget.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (draggingWidget) {
      const newX = e.clientX - dragStartPos.current.x;
      const newY = e.clientY - dragStartPos.current.y;
      onWidgetMove(draggingWidget, newX, newY);
    }
  };

  const handleMouseUp = () => {
    setDraggingWidget(null);
  };

  useEffect(() => {
    if (draggingWidget) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingWidget]);

  return (
    <div className="widgets-container">
      {widgets.map((widget) => (
        <div
          key={widget.id}
          className="widget"
          style={{
            position: 'absolute',
            left: widget.x,
            top: widget.y,
            width: widget.width,
            zIndex: draggingWidget === widget.id ? 1000 : 100,
            cursor: draggingWidget === widget.id ? 'grabbing' : 'grab',
          }}
          onMouseDown={(e) => handleMouseDown(e, widget)}
        >
          <WidgetContent
            widget={widget}
            onClose={() => onWidgetClose(widget.id)}
          />
        </div>
      ))}
    </div>
  );
};

interface WidgetContentProps {
  widget: Widget;
  onClose: () => void;
}

const WidgetContent: React.FC<WidgetContentProps> = ({ widget, onClose }) => {
  const widgetContent = () => {
    switch (widget.type) {
      case 'time':
        return <TimeWidget />;
      case 'weather':
        return <WeatherWidget />;
      case 'todo':
        return <TodoWidget />;
      case 'calendar':
        return <CalendarWidget />;
      default:
        return <div>未知小组件</div>;
    }
  };

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          padding: '8px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#333' }}>
          {getWidgetTitle(widget.type)}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            width: '20px',
            height: '20px',
            border: 'none',
            borderRadius: '50%',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '12px',
            color: '#999',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.background = 'rgba(0, 0, 0, 0.1)';
            (e.target as HTMLElement).style.color = '#333';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.background = 'transparent';
            (e.target as HTMLElement).style.color = '#999';
          }}
        >
          ✕
        </button>
      </div>
      <div style={{ padding: '16px' }}>
        {widgetContent()}
      </div>
    </div>
  );
};

const getWidgetTitle = (type: WidgetType): string => {
  switch (type) {
    case 'time':
      return '🕐 时间';
    case 'weather':
      return '🌤️ 天气';
    case 'todo':
      return '📝 待办事项';
    case 'calendar':
      return '📅 日历';
    default:
      return '小组件';
  }
};

const TimeWidget: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontSize: '48px',
          fontWeight: 300,
          color: '#333',
          letterSpacing: '2px',
          marginBottom: '8px',
        }}
      >
        {time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
      <div style={{ fontSize: '14px', color: '#666' }}>
        {time.toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
};

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 23,
    condition: '晴',
    humidity: 65,
    city: '北京',
    icon: '☀️',
  });

  useEffect(() => {
    const icons = ['☀️', '⛅', '☁️', '🌧️', '⛈️', '❄️'];
    const conditions = ['晴', '多云', '阴', '小雨', '雷雨', '雪'];
    const interval = setInterval(() => {
      const index = Math.floor(Math.random() * icons.length);
      setWeather(prev => ({
        ...prev,
        temperature: Math.floor(Math.random() * 15) + 15,
        icon: icons[index],
        condition: conditions[index],
        humidity: Math.floor(Math.random() * 40) + 40,
      }));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '64px', marginBottom: '8px' }}>
        {weather.icon}
      </div>
      <div style={{ fontSize: '32px', fontWeight: 500, color: '#333', marginBottom: '4px' }}>
        {weather.temperature}°C
      </div>
      <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
        {weather.condition} · {weather.city}
      </div>
      <div style={{ fontSize: '12px', color: '#999' }}>
        湿度: {weather.humidity}%
      </div>
    </div>
  );
};

const TodoWidget: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: '1', text: '完成项目报告', completed: false, createdAt: new Date().toISOString() },
    { id: '2', text: '回复邮件', completed: true, createdAt: new Date().toISOString() },
    { id: '3', text: '团队会议', completed: false, createdAt: new Date().toISOString() },
  ]);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([
        ...todos,
        {
          id: Date.now().toString(),
          text: newTodo.trim(),
          completed: false,
          createdAt: new Date().toISOString(),
        },
      ]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div style={{ minWidth: '200px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="添加待办事项..."
          style={{
            flex: 1,
            padding: '6px 10px',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            fontSize: '13px',
            outline: 'none',
          }}
        />
        <button
          onClick={addTodo}
          style={{
            padding: '6px 12px',
            border: 'none',
            borderRadius: '6px',
            background: '#667eea',
            color: '#fff',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          添加
        </button>
      </div>
      <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
        {todos.map((todo) => (
          <div
            key={todo.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '6px 0',
              borderBottom: '1px solid #f0f0f0',
              gap: '8px',
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              style={{ cursor: 'pointer' }}
            />
            <span
              style={{
                flex: 1,
                fontSize: '13px',
                color: todo.completed ? '#999' : '#333',
                textDecoration: todo.completed ? 'line-through' : 'none',
              }}
            >
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#999',
                cursor: 'pointer',
                fontSize: '12px',
                padding: '2px 4px',
              }}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '8px', fontSize: '11px', color: '#999', textAlign: 'right' }}>
        已完成 {completedCount}/{todos.length}
      </div>
    </div>
  );
};

const CalendarWidget: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  return (
    <div style={{ minWidth: '220px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <button
          onClick={prevMonth}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '4px 8px',
          }}
        >
          ‹
        </button>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>
          {year}年{month + 1}月
        </span>
        <button
          onClick={nextMonth}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '4px 8px',
          }}
        >
          ›
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {weekDays.map((day) => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              fontSize: '11px',
              color: '#999',
              padding: '4px 0',
              fontWeight: 500,
            }}
          >
            {day}
          </div>
        ))}
        {Array(firstDay).fill(null).map((_, i) => (
          <div key={`empty-${i}`} style={{ padding: '4px 0' }} />
        ))}
        {Array(daysInMonth).fill(null).map((_, i) => {
          const day = i + 1;
          const isTodayDate = isToday(day);
          return (
            <div
              key={day}
              style={{
                textAlign: 'center',
                fontSize: '12px',
                padding: '4px 0',
                borderRadius: '50%',
                background: isTodayDate ? '#667eea' : 'transparent',
                color: isTodayDate ? '#fff' : '#333',
                fontWeight: isTodayDate ? 600 : 400,
              }}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Widgets;
