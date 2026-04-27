import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import vehiclesReducer from './slices/vehiclesSlice';
import driversReducer from './slices/driversSlice';
import ordersReducer from './slices/ordersSlice';
import tripsReducer from './slices/tripsSlice';
import alertsReducer from './slices/alertsSlice';
import configReducer from './slices/configSlice';
import systemReducer from './slices/systemSlice';
import reportReducer from './slices/reportSlice';

export const store = configureStore({
  reducer: {
    vehicles: vehiclesReducer,
    drivers: driversReducer,
    orders: ordersReducer,
    trips: tripsReducer,
    alerts: alertsReducer,
    config: configReducer,
    system: systemReducer,
    report: reportReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
