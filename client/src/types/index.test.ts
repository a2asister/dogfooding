import { describe, it, expect } from 'vitest';
import type { Store, Member, Promotion, ApiResponse } from '@/types';

describe('Type Definitions', () => {
  describe('Store Type', () => {
    it('should have required properties', () => {
      const store: Store = {
        id: 'test-123',
        name: '测试门店',
        address: '测试地址',
        manager: '张三',
        phone: '13800138000',
        createdAt: '2024-01-01T00:00:00.000Z',
        status: 'active'
      };

      expect(store.id).toBeDefined();
      expect(store.name).toBe('测试门店');
      expect(store.status).toBe('active');
    });

    it('should allow inactive status', () => {
      const store: Store = {
        id: 'test-123',
        name: '测试门店',
        address: '测试地址',
        manager: '张三',
        phone: '13800138000',
        createdAt: '2024-01-01T00:00:00.000Z',
        status: 'inactive'
      };

      expect(store.status).toBe('inactive');
    });
  });

  describe('Member Type', () => {
    it('should have required properties including points and totalSpent', () => {
      const member: Member = {
        id: 'member-123',
        storeId: 'store-123',
        name: '测试会员',
        phone: '13800138000',
        level: 'gold',
        points: 1000,
        totalSpent: 5000,
        createdAt: '2024-01-01T00:00:00.000Z',
        status: 'active'
      };

      expect(member.points).toBe(1000);
      expect(member.totalSpent).toBe(5000);
      expect(member.level).toBe('gold');
    });

    it('should support all member levels', () => {
      const levels: Member['level'][] = ['bronze', 'silver', 'gold', 'platinum'];
      levels.forEach(level => {
        const member: Member = {
          id: `member-${level}`,
          storeId: 'store-123',
          name: `${level}会员`,
          phone: '13800138000',
          level,
          points: 0,
          totalSpent: 0,
          createdAt: '2024-01-01T00:00:00.000Z',
          status: 'active'
        };
        expect(member.level).toBe(level);
      });
    });
  });

  describe('Promotion Type', () => {
    it('should support percentage discount type', () => {
      const promo: Promotion = {
        id: 'promo-1',
        storeId: 'store-123',
        name: '九折优惠',
        description: '全场九折',
        discountType: 'percentage',
        discountValue: 10,
        minPurchase: 0,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active'
      };

      expect(promo.discountType).toBe('percentage');
      expect(promo.discountValue).toBe(10);
    });

    it('should support fixed discount type', () => {
      const promo: Promotion = {
        id: 'promo-2',
        storeId: 'store-123',
        name: '满减优惠',
        description: '满100减20',
        discountType: 'fixed',
        discountValue: 20,
        minPurchase: 100,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active'
      };

      expect(promo.discountType).toBe('fixed');
      expect(promo.minPurchase).toBe(100);
    });

    it('should support buyXGetY discount type', () => {
      const promo: Promotion = {
        id: 'promo-3',
        storeId: 'store-123',
        name: '买二送一',
        description: '买二送一活动',
        discountType: 'buyXGetY',
        discountValue: 1,
        minPurchase: 2,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active'
      };

      expect(promo.discountType).toBe('buyXGetY');
    });
  });

  describe('ApiResponse Type', () => {
    it('should handle success response', () => {
      const response: ApiResponse<Store> = {
        success: true,
        data: {
          id: 'test-123',
          name: '测试门店',
          address: '测试地址',
          manager: '张三',
          phone: '13800138000',
          createdAt: '2024-01-01T00:00:00.000Z',
          status: 'active'
        }
      };

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
    });

    it('should handle error response', () => {
      const response: ApiResponse<null> = {
        success: false,
        message: '操作失败'
      };

      expect(response.success).toBe(false);
      expect(response.message).toBe('操作失败');
    });
  });
});
