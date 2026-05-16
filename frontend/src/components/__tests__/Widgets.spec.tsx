import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Widgets from '../Widgets';
import { Widget } from '../../types';

describe('Widgets Component', () => {
  const mockOnWidgetMove = vi.fn();
  const mockOnWidgetClose = vi.fn();

  const mockWidgets: Widget[] = [
    { id: 'w1', type: 'time', x: 20, y: 20, width: 250, height: 150 },
    { id: 'w2', type: 'weather', x: 20, y: 180, width: 250, height: 200 },
    { id: 'w3', type: 'calendar', x: 20, y: 390, width: 250, height: 250 },
    { id: 'w4', type: 'todo', x: 300, y: 20, width: 250, height: 300 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders all widgets', () => {
    render(
      <Widgets
        widgets={mockWidgets}
        onWidgetMove={mockOnWidgetMove}
        onWidgetClose={mockOnWidgetClose}
      />
    );
    expect(screen.getByText('🕐 时间')).toBeInTheDocument();
    expect(screen.getByText('🌤️ 天气')).toBeInTheDocument();
    expect(screen.getByText('📅 日历')).toBeInTheDocument();
    expect(screen.getByText('📝 待办事项')).toBeInTheDocument();
  });

  it('positions widgets correctly based on props', () => {
    render(
      <Widgets
        widgets={mockWidgets}
        onWidgetMove={mockOnWidgetMove}
        onWidgetClose={mockOnWidgetClose}
      />
    );
    const widgetElements = document.querySelectorAll('.widget');
    expect(widgetElements.length).toBe(4);
  });

  it('calls onWidgetClose when close button is clicked', () => {
    render(
      <Widgets
        widgets={mockWidgets}
        onWidgetMove={mockOnWidgetMove}
        onWidgetClose={mockOnWidgetClose}
      />
    );
    const closeButtons = screen.getAllByText('✕');
    fireEvent.click(closeButtons[0]);
    expect(mockOnWidgetClose).toHaveBeenCalledWith('w1');
  });

  it('renders time widget with current time', () => {
    render(
      <Widgets
        widgets={[mockWidgets[0]]}
        onWidgetMove={mockOnWidgetMove}
        onWidgetClose={mockOnWidgetClose}
      />
    );
    const timeRegex = /\d{2}:\d{2}:\d{2}/;
    expect(screen.getByText(timeRegex)).toBeInTheDocument();
  });

  it('renders time widget with date', () => {
    render(
      <Widgets
        widgets={[mockWidgets[0]]}
        onWidgetMove={mockOnWidgetMove}
        onWidgetClose={mockOnWidgetClose}
      />
    );
    const dateRegex = /星期.*\d{4}年\d{1,2}月\d{1,2}日/;
    expect(screen.getByText(dateRegex)).toBeInTheDocument();
  });

  it('updates time every second', () => {
    render(
      <Widgets
        widgets={[mockWidgets[0]]}
        onWidgetMove={mockOnWidgetMove}
        onWidgetClose={mockOnWidgetClose}
      />
    );
    const timeRegex = /\d{2}:\d{2}:\d{2}/;
    const initialTime = screen.getByText(timeRegex).textContent;

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const newTime = screen.getByText(timeRegex).textContent;
    expect(newTime).not.toBe(initialTime);
  });

  it('renders weather widget with temperature and condition', () => {
    render(
      <Widgets
        widgets={[mockWidgets[1]]}
        onWidgetMove={mockOnWidgetMove}
        onWidgetClose={mockOnWidgetClose}
      />
    );
    expect(screen.getByText(/\d{2}°C/)).toBeInTheDocument();
    expect(screen.getByText(/湿度: \d{1,3}%/)).toBeInTheDocument();
  });

  it('renders todo widget with add todo input', () => {
    render(
      <Widgets
        widgets={[mockWidgets[3]]}
        onWidgetMove={mockOnWidgetMove}
        onWidgetClose={mockOnWidgetClose}
      />
    );
    expect(screen.getByPlaceholderText('添加待办事项...')).toBeInTheDocument();
    expect(screen.getByText('添加')).toBeInTheDocument();
  });

  it('adds a new todo item when add button is clicked', () => {
    render(
      <Widgets
        widgets={[mockWidgets[3]]}
        onWidgetMove={mockOnWidgetMove}
        onWidgetClose={mockOnWidgetClose}
      />
    );
    const input = screen.getByPlaceholderText('添加待办事项...');
    const addButton = screen.getByText('添加');

    fireEvent.change(input, { target: { value: '新的待办事项' } });
    fireEvent.click(addButton);

    expect(screen.getByText('新的待办事项')).toBeInTheDocument();
  });

  it('toggles todo completion when checkbox is clicked', () => {
    render(
      <Widgets
        widgets={[mockWidgets[3]]}
        onWidgetMove={mockOnWidgetMove}
        onWidgetClose={mockOnWidgetClose}
      />
    );
    const checkboxes = screen.getAllByRole('checkbox');
    const initialCount = checkboxes.filter(cb => (cb as HTMLInputElement).checked).length;

    fireEvent.click(checkboxes[0]);

    const newCheckboxes = screen.getAllByRole('checkbox');
    const newCount = newCheckboxes.filter(cb => (cb as HTMLInputElement).checked).length;
    expect(newCount).not.toBe(initialCount);
  });

  it('deletes todo item when delete button is clicked', () => {
    render(
      <Widgets
        widgets={[mockWidgets[3]]}
        onWidgetMove={mockOnWidgetMove}
        onWidgetClose={mockOnWidgetClose}
      />
    );
    const initialTodoCount = screen.getAllByRole('checkbox').length;
    const deleteButtons = screen.getAllByText('🗑️');

    fireEvent.click(deleteButtons[0]);

    const newTodoCount = screen.getAllByRole('checkbox').length;
    expect(newTodoCount).toBe(initialTodoCount - 1);
  });

  it('displays completed todos count in todo widget', () => {
    render(
      <Widgets
        widgets={[mockWidgets[3]]}
        onWidgetMove={mockOnWidgetMove}
        onWidgetClose={mockOnWidgetClose}
      />
    );
    expect(screen.getByText(/已完成 \d+\/\d+/)).toBeInTheDocument();
  });

  it('renders calendar widget with current month and year', () => {
    render(
      <Widgets
        widgets={[mockWidgets[2]]}
        onWidgetMove={mockOnWidgetMove}
        onWidgetClose={mockOnWidgetClose}
      />
    );
    const currentDate = new Date();
    expect(screen.getByText(`${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`)).toBeInTheDocument();
  });

  it('renders calendar widget with navigation buttons', () => {
    render(
      <Widgets
        widgets={[mockWidgets[2]]}
        onWidgetMove={mockOnWidgetMove}
        onWidgetClose={mockOnWidgetClose}
      />
    );
    expect(screen.getByText('‹')).toBeInTheDocument();
    expect(screen.getByText('›')).toBeInTheDocument();
  });

  it('navigates to previous month when prev button is clicked', () => {
    render(
      <Widgets
        widgets={[mockWidgets[2]]}
        onWidgetMove={mockOnWidgetMove}
        onWidgetClose={mockOnWidgetClose}
      />
    );
    const currentDate = new Date();
    const currentMonthText = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`;

    fireEvent.click(screen.getByText('‹'));

    const prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const prevMonthText = `${prevDate.getFullYear()}年${prevDate.getMonth() + 1}月`;
    expect(screen.queryByText(currentMonthText)).not.toBeInTheDocument();
    expect(screen.getByText(prevMonthText)).toBeInTheDocument();
  });

  it('navigates to next month when next button is clicked', () => {
    render(
      <Widgets
        widgets={[mockWidgets[2]]}
        onWidgetMove={mockOnWidgetMove}
        onWidgetClose={mockOnWidgetClose}
      />
    );
    const currentDate = new Date();
    const currentMonthText = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`;

    fireEvent.click(screen.getByText('›'));

    const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const nextMonthText = `${nextDate.getFullYear()}年${nextDate.getMonth() + 1}月`;
    expect(screen.queryByText(currentMonthText)).not.toBeInTheDocument();
    expect(screen.getByText(nextMonthText)).toBeInTheDocument();
  });

  it('renders calendar widget with day headers', () => {
    render(
      <Widgets
        widgets={[mockWidgets[2]]}
        onWidgetMove={mockOnWidgetMove}
        onWidgetClose={mockOnWidgetClose}
      />
    );
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    days.forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('handles empty widgets array gracefully', () => {
    render(
      <Widgets
        widgets={[]}
        onWidgetMove={mockOnWidgetMove}
        onWidgetClose={mockOnWidgetClose}
      />
    );
    expect(document.querySelectorAll('.widget').length).toBe(0);
  });
});
