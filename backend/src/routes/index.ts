import { Router } from 'express';
import * as monitoringPointController from '../controllers/monitoringPointController';
import * as waterQualityController from '../controllers/waterQualityController';
import * as alertController from '../controllers/alertController';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '京杭大运河污染大屏监控系统 API 服务运行正常',
    timestamp: new Date().toISOString(),
  });
});

router.get('/monitoring-points', monitoringPointController.getAllMonitoringPoints);
router.get('/monitoring-points/statistics', monitoringPointController.getMonitoringPointsStatistics);
router.get('/monitoring-points/:id', monitoringPointController.getMonitoringPointById);
router.post('/monitoring-points', monitoringPointController.createMonitoringPoint);
router.put('/monitoring-points/:id', monitoringPointController.updateMonitoringPoint);
router.delete('/monitoring-points/:id', monitoringPointController.deleteMonitoringPoint);

router.get('/water-quality', waterQualityController.getWaterQualityData);
router.get('/water-quality/latest', waterQualityController.getLatestWaterQuality);
router.get('/water-quality/statistics', waterQualityController.getWaterQualityStatistics);
router.get('/water-quality/trend', waterQualityController.getWaterQualityTrend);
router.post('/water-quality', waterQualityController.createWaterQualityData);

router.get('/alerts', alertController.getAllAlerts);
router.get('/alerts/statistics', alertController.getAlertsStatistics);
router.get('/alerts/:id', alertController.getAlertById);
router.post('/alerts', alertController.createAlert);
router.put('/alerts/:id', alertController.updateAlert);
router.put('/alerts/:id/read', alertController.markAsRead);
router.put('/alerts/:id/handle', alertController.handleAlert);

export default router;
