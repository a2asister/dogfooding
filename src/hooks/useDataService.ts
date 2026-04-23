import { useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/stores/appStore';
import { generateMockFloodData, generateHistoricalRecords } from '@/utils/mockData';
import { getWarningLevelForUpstreamLevel, getWarningLevelForDischargeFlow } from '@/utils/warning';
import type { FloodData, HistoricalRecord } from '@/types';

const DATA_UPDATE_INTERVAL = 5 * 60 * 1000;
const DEMO_UPDATE_INTERVAL = 10 * 1000;

export function useDataService() {
  const {
    setCurrentData,
    addWarning,
    setHistoricalRecords,
    setIsLoading,
    setLastUpdateTime,
    mode,
    simulationParams,
    isPlayingHistory,
  } = useAppStore();
  
  const currentDataRef = useRef<FloodData | null>(null);
  
  useEffect(() => {
    const unsubscribe = useAppStore.subscribe(
      (state) => state.currentData,
      (data) => {
        currentDataRef.current = data;
      }
    );
    return unsubscribe;
  }, []);
  
  const fetchCurrentData = useCallback(async (): Promise<FloodData> => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
    
    const newData = generateMockFloodData(currentDataRef.current || undefined);
    
    setIsLoading(false);
    setLastUpdateTime(Date.now());
    
    currentDataRef.current = newData;
    return newData;
  }, [setIsLoading, setLastUpdateTime]);
  
  const fetchHistoricalData = useCallback(async (): Promise<HistoricalRecord[]> => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
    
    const records = generateHistoricalRecords();
    
    setIsLoading(false);
    
    return records;
  }, [setIsLoading]);
  
  const checkAndAddWarnings = useCallback((data: FloodData) => {
    const upstreamWarning = getWarningLevelForUpstreamLevel(data.upstreamWaterLevel);
    if (upstreamWarning.level !== 'normal') {
      addWarning({
        type: 'upstreamLevel',
        level: upstreamWarning.level,
        currentValue: data.upstreamWaterLevel,
        threshold: upstreamWarning.threshold,
        message: `上游水位: ${data.upstreamWaterLevel.toFixed(2)}m - ${upstreamWarning.message}`,
      });
    }
    
    const dischargeWarning = getWarningLevelForDischargeFlow(data.dischargeFlow);
    if (dischargeWarning.level !== 'normal') {
      addWarning({
        type: 'dischargeFlow',
        level: dischargeWarning.level,
        currentValue: data.dischargeFlow,
        threshold: dischargeWarning.threshold,
        message: `泄洪流量: ${data.dischargeFlow.toLocaleString()}m³/s - ${dischargeWarning.message}`,
      });
    }
  }, [addWarning]);
  
  useEffect(() => {
    const initData = async () => {
      const data = await fetchCurrentData();
      setCurrentData(data);
      checkAndAddWarnings(data);
      
      const records = await fetchHistoricalData();
      setHistoricalRecords(records);
    };
    
    initData();
  }, []);
  
  useEffect(() => {
    if (mode !== 'real-time' || simulationParams.enabled || isPlayingHistory) return;
    
    const interval = setInterval(async () => {
      const data = await fetchCurrentData();
      setCurrentData(data);
      checkAndAddWarnings(data);
    }, DEMO_UPDATE_INTERVAL);
    
    return () => clearInterval(interval);
  }, [mode, simulationParams.enabled, isPlayingHistory, fetchCurrentData, setCurrentData, checkAndAddWarnings]);
  
  useEffect(() => {
    if (!simulationParams.enabled) return;
    
    const currentData = currentDataRef.current;
    
    const simulatedData: FloodData = {
      id: `sim-${Date.now()}`,
      timestamp: Date.now(),
      upstreamWaterLevel: currentData?.upstreamWaterLevel ?? 155,
      downstreamWaterLevel: currentData?.downstreamWaterLevel ?? 65,
      dischargeFlow: simulationParams.customDischargeFlow,
      dischargeDuration: currentData?.dischargeDuration ?? 60,
      openHoles: simulationParams.customOpenHoles,
      totalHoles: 77,
    };
    
    currentDataRef.current = simulatedData;
    setCurrentData(simulatedData);
  }, [simulationParams.enabled, simulationParams.customDischargeFlow, simulationParams.customOpenHoles, setCurrentData]);
  
  return {
    fetchCurrentData,
    fetchHistoricalData,
    checkAndAddWarnings,
  };
}
