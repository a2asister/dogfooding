import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AppStore from '../AppStore';

describe('AppStore Component', () => {
  const mockOnAddToDesktop = vi.fn();
  const mockOnAddToStartMenu = vi.fn();
  const mockIsAppOnDesktop = vi.fn();
  const mockIsAppInStartMenu = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders AppStore title correctly', () => {
    render(
      <AppStore
        onAddToDesktop={mockOnAddToDesktop}
        onAddToStartMenu={mockOnAddToStartMenu}
      />
    );
    expect(screen.getByText('应用商店')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(
      <AppStore
        onAddToDesktop={mockOnAddToDesktop}
        onAddToStartMenu={mockOnAddToStartMenu}
      />
    );
    expect(screen.getByPlaceholderText('搜索应用...')).toBeInTheDocument();
  });

  it('renders category buttons', () => {
    render(
      <AppStore
        onAddToDesktop={mockOnAddToDesktop}
        onAddToStartMenu={mockOnAddToStartMenu}
      />
    );
    expect(screen.getByText('全部')).toBeInTheDocument();
    expect(screen.getByText('办公')).toBeInTheDocument();
    expect(screen.getByText('效率')).toBeInTheDocument();
    expect(screen.getByText('设计')).toBeInTheDocument();
    expect(screen.getByText('娱乐')).toBeInTheDocument();
    expect(screen.getByText('开发')).toBeInTheDocument();
    expect(screen.getByText('知识')).toBeInTheDocument();
  });

  it('renders available apps', () => {
    render(
      <AppStore
        onAddToDesktop={mockOnAddToDesktop}
        onAddToStartMenu={mockOnAddToStartMenu}
      />
    );
    expect(screen.getByText('Google Docs')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('YouTube')).toBeInTheDocument();
  });

  it('filters apps by search query', () => {
    render(
      <AppStore
        onAddToDesktop={mockOnAddToDesktop}
        onAddToStartMenu={mockOnAddToStartMenu}
      />
    );
    const searchInput = screen.getByPlaceholderText('搜索应用...');
    fireEvent.change(searchInput, { target: { value: 'Google' } });
    expect(screen.getByText('Google Docs')).toBeInTheDocument();
    expect(screen.getByText('Google Sheets')).toBeInTheDocument();
  });

  it('filters apps by category', () => {
    render(
      <AppStore
        onAddToDesktop={mockOnAddToDesktop}
        onAddToStartMenu={mockOnAddToStartMenu}
      />
    );
    fireEvent.click(screen.getByText('开发'));
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Stack Overflow')).toBeInTheDocument();
  });

  it('calls onAddToDesktop when add to desktop button is clicked', () => {
    render(
      <AppStore
        onAddToDesktop={mockOnAddToDesktop}
        onAddToStartMenu={mockOnAddToStartMenu}
      />
    );
    const buttons = screen.getAllByText('🖥️ 添加到桌面');
    fireEvent.click(buttons[0]);
    expect(mockOnAddToDesktop).toHaveBeenCalled();
  });

  it('calls onAddToStartMenu when add to start menu button is clicked', () => {
    render(
      <AppStore
        onAddToDesktop={mockOnAddToDesktop}
        onAddToStartMenu={mockOnAddToStartMenu}
      />
    );
    const buttons = screen.getAllByText('📋 添加到开始菜单');
    fireEvent.click(buttons[0]);
    expect(mockOnAddToStartMenu).toHaveBeenCalled();
  });

  it('shows "已添加" state when app is on desktop', () => {
    mockIsAppOnDesktop.mockReturnValue(true);
    render(
      <AppStore
        onAddToDesktop={mockOnAddToDesktop}
        onAddToStartMenu={mockOnAddToStartMenu}
        isAppOnDesktop={mockIsAppOnDesktop}
      />
    );
    expect(screen.getAllByText('✅ 已添加到桌面')[0]).toBeInTheDocument();
  });

  it('shows "已添加" state when app is in start menu', () => {
    mockIsAppInStartMenu.mockReturnValue(true);
    render(
      <AppStore
        onAddToDesktop={mockOnAddToDesktop}
        onAddToStartMenu={mockOnAddToStartMenu}
        isAppInStartMenu={mockIsAppInStartMenu}
      />
    );
    expect(screen.getAllByText('✅ 已添加到开始菜单')[0]).toBeInTheDocument();
  });

  it('disables button when app is already added', () => {
    mockIsAppOnDesktop.mockReturnValue(true);
    render(
      <AppStore
        onAddToDesktop={mockOnAddToDesktop}
        onAddToStartMenu={mockOnAddToStartMenu}
        isAppOnDesktop={mockIsAppOnDesktop}
      />
    );
    const buttons = screen.getAllByText('✅ 已添加到桌面');
    expect(buttons[0]).toBeDisabled();
  });

  it('shows no results message when search returns nothing', () => {
    render(
      <AppStore
        onAddToDesktop={mockOnAddToDesktop}
        onAddToStartMenu={mockOnAddToStartMenu}
      />
    );
    const searchInput = screen.getByPlaceholderText('搜索应用...');
    fireEvent.change(searchInput, { target: { value: 'nonexistentapp12345' } });
    expect(screen.getByText('未找到相关应用')).toBeInTheDocument();
  });

  it('renders app descriptions correctly', () => {
    render(
      <AppStore
        onAddToDesktop={mockOnAddToDesktop}
        onAddToStartMenu={mockOnAddToStartMenu}
      />
    );
    expect(screen.getByText('在线文档编辑器')).toBeInTheDocument();
    expect(screen.getByText('代码托管和协作平台')).toBeInTheDocument();
  });

  it('renders footer with app count', () => {
    render(
      <AppStore
        onAddToDesktop={mockOnAddToDesktop}
        onAddToStartMenu={mockOnAddToStartMenu}
      />
    );
    expect(screen.getByText(/共.*个可用应用/)).toBeInTheDocument();
  });
});
