import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LockScreen from '../LockScreen';

describe('LockScreen Component', () => {
  const mockOnUnlock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders LockScreen component', () => {
    render(<LockScreen onUnlock={mockOnUnlock} />);
    expect(screen.getByLabelText(/密码/i)).toBeInTheDocument();
  });

  it('displays current time', () => {
    render(<LockScreen onUnlock={mockOnUnlock} />);
    const timeRegex = /\d{2}:\d{2}:\d{2}/;
    expect(screen.getByText(timeRegex)).toBeInTheDocument();
  });

  it('displays current date', () => {
    render(<LockScreen onUnlock={mockOnUnlock} />);
    const dateRegex = /\d{4}年\d{1,2}月\d{1,2}日/;
    expect(screen.getByText(dateRegex)).toBeInTheDocument();
  });

  it('has a password input field', () => {
    render(<LockScreen onUnlock={mockOnUnlock} />);
    const input = screen.getByLabelText(/密码/i);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('has a show password button', () => {
    render(<LockScreen onUnlock={mockOnUnlock} />);
    expect(screen.getByRole('button', { name: /显示|隐藏/i })).toBeInTheDocument();
  });

  it('toggles password visibility when show password button is clicked', () => {
    render(<LockScreen onUnlock={mockOnUnlock} />);
    const input = screen.getByLabelText(/密码/i) as HTMLInputElement;
    const toggleButton = screen.getByRole('button', { name: /显示|隐藏/i });

    expect(input.type).toBe('password');
    fireEvent.click(toggleButton);
    expect(input.type).toBe('text');
    fireEvent.click(toggleButton);
    expect(input.type).toBe('password');
  });

  it('unlocks with correct password (empty)', () => {
    render(<LockScreen onUnlock={mockOnUnlock} />);
    const input = screen.getByLabelText(/密码/i);
    const form = input.closest('form');

    fireEvent.submit(form!);
    expect(mockOnUnlock).toHaveBeenCalled();
  });

  it('unlocks with correct password ("1234")', () => {
    render(<LockScreen onUnlock={mockOnUnlock} />);
    const input = screen.getByLabelText(/密码/i);
    const form = input.closest('form');

    fireEvent.change(input, { target: { value: '1234' } });
    fireEvent.submit(form!);
    expect(mockOnUnlock).toHaveBeenCalled();
  });

  it('shows error message with wrong password', () => {
    render(<LockScreen onUnlock={mockOnUnlock} />);
    const input = screen.getByLabelText(/密码/i);
    const form = input.closest('form');

    fireEvent.change(input, { target: { value: 'wrong' } });
    fireEvent.submit(form!);
    expect(screen.getByText('密码错误，请重试')).toBeInTheDocument();
    expect(mockOnUnlock).not.toHaveBeenCalled();
  });

  it('clears password input after wrong attempt', () => {
    render(<LockScreen onUnlock={mockOnUnlock} />);
    const input = screen.getByLabelText(/密码/i) as HTMLInputElement;
    const form = input.closest('form');

    fireEvent.change(input, { target: { value: 'wrong' } });
    fireEvent.submit(form!);
    expect(input.value).toBe('');
  });

  it('updates time every second', () => {
    render(<LockScreen onUnlock={mockOnUnlock} />);
    const initialTime = screen.getByText(/\d{2}:\d{2}:\d{2}/).textContent;

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const newTime = screen.getByText(/\d{2}:\d{2}:\d{2}/).textContent;
    expect(newTime).not.toBe(initialTime);
  });

  it('renders unlock button', () => {
    render(<LockScreen onUnlock={mockOnUnlock} />);
    expect(screen.getByRole('button', { name: /解锁/i })).toBeInTheDocument();
  });

  it('renders welcome message', () => {
    render(<LockScreen onUnlock={mockOnUnlock} />);
    expect(screen.getByText('欢迎回来')).toBeInTheDocument();
  });

  it('clears error when user starts typing after wrong password', () => {
    render(<LockScreen onUnlock={mockOnUnlock} />);
    const input = screen.getByLabelText(/密码/i) as HTMLInputElement;
    const form = input.closest('form');

    fireEvent.change(input, { target: { value: 'wrong' } });
    fireEvent.submit(form!);
    expect(screen.getByText('密码错误，请重试')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '1' } });
    expect(screen.queryByText('密码错误，请重试')).not.toBeInTheDocument();
  });
});
