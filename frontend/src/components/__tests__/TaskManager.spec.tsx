import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskManager from '../TaskManager';
import { createMockProcess } from '../../test/test-utils';

describe('TaskManager Component', () => {
  const mockOnCloseProcess = vi.fn();
  const mockOnClose = vi.fn();
  const mockProcesses = [
    createMockProcess({ id: '1', name: '文件资源管理器', type: 'explorer', memoryUsage: 256, cpuUsage: 5.2 }),
    createMockProcess({ id: '2', name: '设置', type: 'settings', memoryUsage: 128, cpuUsage: 2.1 }),
    createMockProcess({ id: '3', name: '应用商店', type: 'app-store', memoryUsage: 512, cpuUsage: 8.5 }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders TaskManager title correctly', () => {
    render(
      <TaskManager
        processes={mockProcesses}
        onCloseProcess={mockOnCloseProcess}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('任务管理器')).toBeInTheDocument();
  });

  it('renders process statistics cards', () => {
    render(
      <TaskManager
        processes={mockProcesses}
        onCloseProcess={mockOnCloseProcess}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('进程数量')).toBeInTheDocument();
    expect(screen.getByText('内存使用')).toBeInTheDocument();
    expect(screen.getByText('CPU 使用率')).toBeInTheDocument();
  });

  it('displays correct process count', () => {
    render(
      <TaskManager
        processes={mockProcesses}
        onCloseProcess={mockOnCloseProcess}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('displays correct total memory usage', () => {
    render(
      <TaskManager
        processes={mockProcesses}
        onCloseProcess={mockOnCloseProcess}
        onClose={mockOnClose}
      />
    );
    const totalMemory = (256 + 128 + 512) / 1024;
    expect(screen.getByText(`${totalMemory.toFixed(1)} GB`)).toBeInTheDocument();
  });

  it('displays correct total CPU usage', () => {
    render(
      <TaskManager
        processes={mockProcesses}
        onCloseProcess={mockOnCloseProcess}
        onClose={mockOnClose}
      />
    );
    const totalCpu = 5.2 + 2.1 + 8.5;
    expect(screen.getByText(`${totalCpu.toFixed(1)}%`)).toBeInTheDocument();
  });

  it('renders process table headers', () => {
    render(
      <TaskManager
        processes={mockProcesses}
        onCloseProcess={mockOnCloseProcess}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('进程名')).toBeInTheDocument();
    expect(screen.getByText('内存 (MB)')).toBeInTheDocument();
    expect(screen.getByText('CPU')).toBeInTheDocument();
    expect(screen.getByText('操作')).toBeInTheDocument();
  });

  it('renders all processes in the table', () => {
    render(
      <TaskManager
        processes={mockProcesses}
        onCloseProcess={mockOnCloseProcess}
        onClose={mockOnClose}
      />
    );
    mockProcesses.forEach(process => {
      expect(screen.getByText(process.name)).toBeInTheDocument();
    });
  });

  it('displays memory usage for each process', () => {
    render(
      <TaskManager
        processes={mockProcesses}
        onCloseProcess={mockOnCloseProcess}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('256')).toBeInTheDocument();
    expect(screen.getByText('128')).toBeInTheDocument();
    expect(screen.getByText('512')).toBeInTheDocument();
  });

  it('calls onCloseProcess when end task button is clicked', () => {
    render(
      <TaskManager
        processes={mockProcesses}
        onCloseProcess={mockOnCloseProcess}
        onClose={mockOnClose}
      />
    );
    const endButtons = screen.getAllByText('结束任务');
    fireEvent.click(endButtons[0]);
    expect(mockOnCloseProcess).toHaveBeenCalledWith('1');
  });

  it('renders footer with process count', () => {
    render(
      <TaskManager
        processes={mockProcesses}
        onCloseProcess={mockOnCloseProcess}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText(/运行中: .* 个进程/)).toBeInTheDocument();
  });

  it('displays process icons correctly', () => {
    render(
      <TaskManager
        processes={mockProcesses}
        onCloseProcess={mockOnCloseProcess}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('📁')).toBeInTheDocument();
    expect(screen.getByText('⚙️')).toBeInTheDocument();
    expect(screen.getByText('🏪')).toBeInTheDocument();
  });

  it('handles empty processes array', () => {
    render(
      <TaskManager
        processes={[]}
        onCloseProcess={mockOnCloseProcess}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('0.0 GB')).toBeInTheDocument();
    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });

  it('sorts processes by clicking column headers', () => {
    render(
      <TaskManager
        processes={mockProcesses}
        onCloseProcess={mockOnCloseProcess}
        onClose={mockOnClose}
      />
    );
    const memoryHeader = screen.getByText('内存 (MB)');
    fireEvent.click(memoryHeader);
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBeGreaterThan(1);
  });

  it('displays correct CPU percentage for each process', () => {
    render(
      <TaskManager
        processes={mockProcesses}
        onCloseProcess={mockOnCloseProcess}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('5.2%')).toBeInTheDocument();
    expect(screen.getByText('2.1%')).toBeInTheDocument();
    expect(screen.getByText('8.5%')).toBeInTheDocument();
  });

  it('renders end task buttons for all processes', () => {
    render(
      <TaskManager
        processes={mockProcesses}
        onCloseProcess={mockOnCloseProcess}
        onClose={mockOnClose}
      />
    );
    const endButtons = screen.getAllByText('结束任务');
    expect(endButtons.length).toBe(mockProcesses.length);
  });
});
