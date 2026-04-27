import { describe, it, expect } from 'vitest';
import type { PermissionLevel } from '@/types';
import {
  generateRoadSegments,
  generateIntersections,
  generateTrafficFlowData,
  generateAlarms,
  generateDevices,
  generateStatistics,
  generateUsers,
  updateRoadStatus,
  updateSignalState,
} from '@/mock/dataGenerator';
import { hasPermission } from '@/store/trafficStore';

describe('Data Generator Tests', () => {
  describe('generateRoadSegments', () => {
    it('should generate road segments with required properties', () => {
      const roads = generateRoadSegments();
      expect(roads.length).toBeGreaterThan(0);
      roads.forEach((road) => {
        expect(road).toHaveProperty('id');
        expect(road).toHaveProperty('name');
        expect(road).toHaveProperty('startPoint');
        expect(road).toHaveProperty('endPoint');
        expect(road).toHaveProperty('lanes');
        expect(road).toHaveProperty('status');
        expect(road).toHaveProperty('speedLimit');
        expect(road).toHaveProperty('currentSpeed');
        expect(road).toHaveProperty('trafficDensity');
      });
    });

    it('should have valid road statuses', () => {
      const roads = generateRoadSegments();
      const validStatuses = ['normal', 'congested', 'blocked', 'unknown'];
      roads.forEach((road) => {
        expect(validStatuses).toContain(road.status);
      });
    });

    it('should have valid lane counts', () => {
      const roads = generateRoadSegments();
      roads.forEach((road) => {
        expect(road.lanes).toBeGreaterThanOrEqual(2);
        expect(road.lanes).toBeLessThanOrEqual(6);
      });
    });

    it('should connect to intersection coordinates', () => {
      const roads = generateRoadSegments();
      const intersections = generateIntersections();
      roads.forEach((road) => {
        const startOnIntersection = intersections.some(
          (i) => i.coordinate.x === road.startPoint.x && i.coordinate.y === road.startPoint.y
        );
        const endOnIntersection = intersections.some(
          (i) => i.coordinate.x === road.endPoint.x && i.coordinate.y === road.endPoint.y
        );
        expect(startOnIntersection).toBe(true);
        expect(endOnIntersection).toBe(true);
      });
    });
  });

  describe('generateIntersections', () => {
    it('should generate intersections with signal timing', () => {
      const intersections = generateIntersections();
      expect(intersections.length).toBeGreaterThan(0);
      intersections.forEach((intersection) => {
        expect(intersection.signalTiming).toBeDefined();
        expect(intersection.signalTiming.redDuration).toBeGreaterThan(0);
        expect(intersection.signalTiming.greenDuration).toBeGreaterThan(0);
        expect(intersection.signalTiming.yellowDuration).toBeGreaterThan(0);
      });
    });

    it('should have valid signal states', () => {
      const intersections = generateIntersections();
      const validStates = ['red', 'green', 'yellow'];
      intersections.forEach((intersection) => {
        expect(validStates).toContain(intersection.signalState);
      });
    });

    it('should have connected roads', () => {
      const intersections = generateIntersections();
      const roads = generateRoadSegments();
      intersections.forEach((intersection) => {
        expect(intersection.roads.length).toBeGreaterThan(0);
        intersection.roads.forEach((roadId) => {
          const road = roads.find((r) => r.id === roadId);
          expect(road).toBeDefined();
        });
      });
    });
  });

  describe('generateTrafficFlowData', () => {
    it('should generate data for the specified number of hours', () => {
      const data = generateTrafficFlowData('road-1', 24);
      expect(data).toHaveLength(24);
    });

    it('should have valid traffic flow values', () => {
      const data = generateTrafficFlowData('road-1', 10);
      data.forEach((item) => {
        expect(item.volume).toBeGreaterThanOrEqual(0);
        expect(item.avgSpeed).toBeGreaterThanOrEqual(0);
        expect(item.density).toBeGreaterThanOrEqual(0);
        expect(item.density).toBeLessThanOrEqual(1);
      });
    });

    it('should have timestamps in correct order', () => {
      const data = generateTrafficFlowData('road-1', 5);
      for (let i = 1; i < data.length; i++) {
        expect(data[i].timestamp).toBeGreaterThan(data[i - 1].timestamp);
      }
    });
  });

  describe('generateAlarms', () => {
    it('should generate alarms sorted by timestamp descending', () => {
      const alarms = generateAlarms(15);
      expect(alarms).toHaveLength(15);
      for (let i = 1; i < alarms.length; i++) {
        expect(alarms[i - 1].timestamp).toBeGreaterThanOrEqual(alarms[i].timestamp);
      }
    });

    it('should have valid alarm types and levels', () => {
      const alarms = generateAlarms(20);
      const validTypes = ['accident', 'congestion', 'illegalParking', 'roadOccupation', 'deviceOffline'];
      const validLevels = ['low', 'medium', 'high', 'critical'];

      alarms.forEach((alarm) => {
        expect(validTypes).toContain(alarm.type);
        expect(validLevels).toContain(alarm.level);
      });
    });
  });

  describe('generateDevices', () => {
    it('should generate devices with required properties', () => {
      const devices = generateDevices(10);
      expect(devices).toHaveLength(10);

      devices.forEach((device) => {
        expect(device).toHaveProperty('id');
        expect(device).toHaveProperty('type');
        expect(device).toHaveProperty('name');
        expect(device).toHaveProperty('location');
        expect(device).toHaveProperty('status');
        expect(device).toHaveProperty('lastHeartbeat');
        expect(device).toHaveProperty('faultCount');
        expect(device).toHaveProperty('maintenanceRecords');
      });
    });

    it('should have valid device types', () => {
      const devices = generateDevices(30);
      const validTypes = ['trafficLight', 'camera', 'magneticSensor'];
      devices.forEach((device) => {
        expect(validTypes).toContain(device.type);
      });
    });

    it('should have valid device statuses', () => {
      const devices = generateDevices(20);
      const validStatuses = ['online', 'offline', 'fault', 'maintenance'];
      devices.forEach((device) => {
        expect(validStatuses).toContain(device.status);
      });
    });
  });

  describe('generateStatistics', () => {
    it('should generate statistics for the specified number of days', () => {
      const stats = generateStatistics(7);
      expect(stats).toHaveLength(7);
    });

    it('should have dates in correct format', () => {
      const stats = generateStatistics(5);
      stats.forEach((stat) => {
        expect(stat.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('should have valid statistical values', () => {
      const stats = generateStatistics(7);
      stats.forEach((stat) => {
        expect(stat.totalTrafficVolume).toBeGreaterThanOrEqual(0);
        expect(stat.congestionDuration).toBeGreaterThanOrEqual(0);
        expect(stat.alarmCount).toBeGreaterThanOrEqual(0);
        expect(stat.deviceFaultCount).toBeGreaterThanOrEqual(0);
        expect(stat.signalSchedulingCount).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('generateUsers', () => {
    it('should generate users with valid permissions', () => {
      const users = generateUsers();
      const validPermissions = ['view', 'operate', 'config', 'admin'];

      users.forEach((user) => {
        expect(user.permissions.length).toBeGreaterThan(0);
        user.permissions.forEach((perm) => {
          expect(validPermissions).toContain(perm);
        });
      });
    });

    it('should have at least one admin user', () => {
      const users = generateUsers();
      const hasAdmin = users.some((u) => u.permissions.includes('admin'));
      expect(hasAdmin).toBe(true);
    });
  });

  describe('updateRoadStatus', () => {
    it('should return a road with updated status', () => {
      const road = generateRoadSegments()[0];
      const updatedRoad = updateRoadStatus(road);

      expect(updatedRoad).toHaveProperty('status');
      expect(updatedRoad).toHaveProperty('currentSpeed');
      expect(updatedRoad).toHaveProperty('trafficDensity');
    });

    it('should set currentSpeed to 0 when status is blocked', () => {
      const road = generateRoadSegments()[0];
      let updatedRoad = updateRoadStatus(road);

      for (let i = 0; i < 100; i++) {
        if (updatedRoad.status === 'blocked') {
          expect(updatedRoad.currentSpeed).toBe(0);
          break;
        }
        updatedRoad = updateRoadStatus(updatedRoad);
      }
    });
  });

  describe('updateSignalState', () => {
    it('should return an intersection with updated signal state', () => {
      const intersection = generateIntersections()[0];
      const updatedIntersection = updateSignalState(intersection);

      expect(updatedIntersection).toHaveProperty('signalState');
      expect(['red', 'green', 'yellow']).toContain(updatedIntersection.signalState);
    });

    it('should not change locked signal timing', () => {
      let intersection = generateIntersections()[0];
      intersection = {
        ...intersection,
        signalTiming: { ...intersection.signalTiming, isLocked: true },
      };

      const updatedIntersection = updateSignalState(intersection);

      expect(updatedIntersection.signalTiming.isLocked).toBe(true);
    });
  });
});

describe('Permission Tests', () => {
  const adminUser = {
    id: '1',
    username: 'admin',
    name: 'Admin',
    permissions: ['view', 'operate', 'config', 'admin'] as PermissionLevel[],
    lastLogin: Date.now(),
  };

  const operatorUser = {
    id: '2',
    username: 'operator',
    name: 'Operator',
    permissions: ['view', 'operate'] as PermissionLevel[],
    lastLogin: Date.now(),
  };

  const viewerUser = {
    id: '3',
    username: 'viewer',
    name: 'Viewer',
    permissions: ['view'] as PermissionLevel[],
    lastLogin: Date.now(),
  };

  it('should allow admin to perform all actions', () => {
    expect(hasPermission(adminUser, 'view')).toBe(true);
    expect(hasPermission(adminUser, 'operate')).toBe(true);
    expect(hasPermission(adminUser, 'config')).toBe(true);
    expect(hasPermission(adminUser, 'admin')).toBe(true);
  });

  it('should allow operator to view and operate but not config or admin', () => {
    expect(hasPermission(operatorUser, 'view')).toBe(true);
    expect(hasPermission(operatorUser, 'operate')).toBe(true);
    expect(hasPermission(operatorUser, 'config')).toBe(false);
    expect(hasPermission(operatorUser, 'admin')).toBe(false);
  });

  it('should only allow viewer to view', () => {
    expect(hasPermission(viewerUser, 'view')).toBe(true);
    expect(hasPermission(viewerUser, 'operate')).toBe(false);
    expect(hasPermission(viewerUser, 'config')).toBe(false);
    expect(hasPermission(viewerUser, 'admin')).toBe(false);
  });

  it('should return false for null user', () => {
    expect(hasPermission(null, 'view')).toBe(false);
    expect(hasPermission(null, 'operate')).toBe(false);
    expect(hasPermission(null, 'admin')).toBe(false);
  });
});