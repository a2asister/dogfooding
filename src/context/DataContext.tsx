import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type {
  Room,
  Order,
  Customer,
  WorkOrder,
  PriceStrategy,
  Discount,
  ExceptionReport,
  Notification,
} from '@/types';
import {
  mockRooms,
  mockOrders,
  mockCustomers,
  mockWorkOrders,
  mockPriceStrategies,
  mockDiscounts,
  mockExceptionReports,
  mockNotifications,
} from '@/data/mockData';

interface DataContextType {
  rooms: Room[];
  orders: Order[];
  customers: Customer[];
  workOrders: WorkOrder[];
  priceStrategies: PriceStrategy[];
  discounts: Discount[];
  exceptionReports: ExceptionReport[];
  notifications: Notification[];
  
  updateRoom: (room: Room) => void;
  updateOrder: (order: Order) => void;
  addOrder: (order: Order) => void;
  updateCustomer: (customer: Customer) => void;
  addCustomer: (customer: Customer) => void;
  updateWorkOrder: (workOrder: WorkOrder) => void;
  addWorkOrder: (workOrder: WorkOrder) => void;
  updatePriceStrategy: (strategy: PriceStrategy) => void;
  updateDiscount: (discount: Discount) => void;
  updateExceptionReport: (report: ExceptionReport) => void;
  addExceptionReport: (report: ExceptionReport) => void;
  markNotificationRead: (id: string) => void;
  addNotification: (notification: Notification) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(mockWorkOrders);
  const [priceStrategies, setPriceStrategies] = useState<PriceStrategy[]>(mockPriceStrategies);
  const [discounts, setDiscounts] = useState<Discount[]>(mockDiscounts);
  const [exceptionReports, setExceptionReports] = useState<ExceptionReport[]>(mockExceptionReports);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const updateRoom = useCallback((room: Room) => {
    setRooms(prev => prev.map(r => r.id === room.id ? room : r));
  }, []);

  const updateOrder = useCallback((order: Order) => {
    setOrders(prev => prev.map(o => o.id === order.id ? order : o));
  }, []);

  const addOrder = useCallback((order: Order) => {
    setOrders(prev => [order, ...prev]);
  }, []);

  const updateCustomer = useCallback((customer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
  }, []);

  const addCustomer = useCallback((customer: Customer) => {
    setCustomers(prev => [customer, ...prev]);
  }, []);

  const updateWorkOrder = useCallback((workOrder: WorkOrder) => {
    setWorkOrders(prev => prev.map(w => w.id === workOrder.id ? workOrder : w));
  }, []);

  const addWorkOrder = useCallback((workOrder: WorkOrder) => {
    setWorkOrders(prev => [workOrder, ...prev]);
  }, []);

  const updatePriceStrategy = useCallback((strategy: PriceStrategy) => {
    setPriceStrategies(prev => prev.map(s => s.id === strategy.id ? strategy : s));
  }, []);

  const updateDiscount = useCallback((discount: Discount) => {
    setDiscounts(prev => prev.map(d => d.id === discount.id ? discount : d));
  }, []);

  const updateExceptionReport = useCallback((report: ExceptionReport) => {
    setExceptionReports(prev => prev.map(r => r.id === report.id ? report : r));
  }, []);

  const addExceptionReport = useCallback((report: ExceptionReport) => {
    setExceptionReports(prev => [report, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  }, []);

  return (
    <DataContext.Provider
      value={{
        rooms,
        orders,
        customers,
        workOrders,
        priceStrategies,
        discounts,
        exceptionReports,
        notifications,
        updateRoom,
        updateOrder,
        addOrder,
        updateCustomer,
        addCustomer,
        updateWorkOrder,
        addWorkOrder,
        updatePriceStrategy,
        updateDiscount,
        updateExceptionReport,
        addExceptionReport,
        markNotificationRead,
        addNotification,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
