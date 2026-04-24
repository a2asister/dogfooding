import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import type { RoomStatus, OrderStatus, RoomType, PriceType } from '@/types';
import { ROOM_STATUS_NAMES, ORDER_STATUS_NAMES, ROOM_TYPE_NAMES, PRICE_TYPE_NAMES } from '@/types';

export const formatDate = (date: string | Date, pattern: string = 'yyyy-MM-dd'): string => {
  if (typeof date === 'string') {
    return format(parseISO(date), pattern);
  }
  return format(date, pattern);
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'yyyy-MM-dd HH:mm');
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculateNights = (checkInDate: string, checkOutDate: string): number => {
  return differenceInDays(parseISO(checkOutDate), parseISO(checkInDate));
};

export const getRoomStatusColor = (status: RoomStatus): string => {
  const colorMap: Record<RoomStatus, string> = {
    available: 'bg-green-100 text-green-800',
    booked: 'bg-yellow-100 text-yellow-800',
    occupied: 'bg-blue-100 text-blue-800',
    cleaning: 'bg-purple-100 text-purple-800',
    maintenance: 'bg-red-100 text-red-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export const getOrderStatusColor = (status: OrderStatus): string => {
  const colorMap: Record<OrderStatus, string> = {
    pending: 'bg-gray-100 text-gray-800',
    confirmed: 'bg-blue-100 text-blue-800',
    checked_in: 'bg-green-100 text-green-800',
    checked_out: 'bg-gray-100 text-gray-500',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export const getRoomStatusDot = (status: RoomStatus): string => {
  const colorMap: Record<RoomStatus, string> = {
    available: 'bg-green-500',
    booked: 'bg-yellow-500',
    occupied: 'bg-blue-500',
    cleaning: 'bg-purple-500',
    maintenance: 'bg-red-500',
  };
  return colorMap[status] || 'bg-gray-500';
};

export const getRoomStatusName = (status: RoomStatus): string => {
  return ROOM_STATUS_NAMES[status] || status;
};

export const getOrderStatusName = (status: OrderStatus): string => {
  return ORDER_STATUS_NAMES[status] || status;
};

export const getRoomTypeName = (type: RoomType): string => {
  return ROOM_TYPE_NAMES[type] || type;
};

export const getPriceTypeName = (type: PriceType): string => {
  return PRICE_TYPE_NAMES[type] || type;
};

export const generateOrderNumber = (): string => {
  const now = new Date();
  const dateStr = format(now, 'yyyyMMdd');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${dateStr}${random}`;
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const maskIdNumber = (idNumber: string): string => {
  if (idNumber.length <= 8) return idNumber;
  return `${idNumber.slice(0, 6)}********${idNumber.slice(-4)}`;
};

export const maskPhone = (phone: string): string => {
  if (phone.length <= 7) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
};

export const exportToCSV = (data: Record<string, unknown>[], filename: string): void => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${formatDate(new Date(), 'yyyyMMdd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (data: unknown, filename: string): void => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${formatDate(new Date(), 'yyyyMMdd')}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getTodayString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const isWeekend = (date: string): boolean => {
  const d = parseISO(date);
  const day = d.getDay();
  return day === 0 || day === 6;
};

export const getPaymentStatusText = (status: 'pending' | 'partial' | 'paid'): string => {
  const map: Record<string, string> = {
    pending: '待支付',
    partial: '部分支付',
    paid: '已支付',
  };
  return map[status] || status;
};

export const getPaymentStatusColor = (status: 'pending' | 'partial' | 'paid'): string => {
  const map: Record<string, string> = {
    pending: 'bg-orange-100 text-orange-800',
    partial: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};

export const getChannelText = (channel: 'online' | 'offline' | 'third_party'): string => {
  const map: Record<string, string> = {
    online: '线上',
    offline: '线下',
    third_party: '第三方',
  };
  return map[channel] || channel;
};
