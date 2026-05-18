import { describe, it, expect } from 'vitest'
import type {
  News,
  Event,
  Banner,
  Highlight,
  Ticket,
  Reservation,
  ComplianceDoc,
  AdminUser,
  ApiResponse
} from './index'

describe('TypeScript 类型定义', () => {
  it('应该定义 News 类型', () => {
    const news: News = {
      id: 1,
      title: '测试新闻',
      content: '<p>内容</p>',
      category: 'announcement',
      cover_image: 'https://example.com/image.jpg',
      is_top: 1,
      created_at: '2024-01-01 00:00:00',
      updated_at: '2024-01-01 00:00:00'
    }
    expect(news.id).toBe(1)
    expect(news.title).toBe('测试新闻')
    expect(news.category).toBe('announcement')
  })

  it('应该定义 Event 类型', () => {
    const event: Event = {
      id: 1,
      title: '测试活动',
      description: '<p>活动描述</p>',
      cover_image: 'https://example.com/image.jpg',
      status: 'ongoing',
      start_time: '2024-01-01 00:00:00',
      end_time: '2024-01-31 23:59:59',
      link_url: 'https://example.com',
      created_at: '2024-01-01 00:00:00',
      updated_at: '2024-01-01 00:00:00'
    }
    expect(event.id).toBe(1)
    expect(event.status).toBe('ongoing')
  })

  it('应该定义 Banner 类型', () => {
    const banner: Banner = {
      id: 1,
      image: 'https://example.com/banner.jpg',
      title: 'Banner标题',
      link: '/download'
    }
    expect(banner.id).toBe(1)
    expect(banner.image).toBeTruthy()
  })

  it('应该定义 Highlight 类型', () => {
    const highlight: Highlight = {
      id: 1,
      icon: '🎮',
      title: '游戏特色',
      description: '特色描述'
    }
    expect(highlight.icon).toBe('🎮')
  })

  it('应该定义 Ticket 类型', () => {
    const ticket: Ticket = {
      id: 1,
      title: '问题反馈',
      content: '问题描述',
      contact: 'user@example.com',
      status: 'pending',
      reply: null,
      created_at: '2024-01-01 00:00:00',
      updated_at: '2024-01-01 00:00:00'
    }
    expect(ticket.status).toBe('pending')
  })

  it('应该定义 Reservation 类型', () => {
    const reservation: Reservation = {
      id: 1,
      phone: '13800138000',
      created_at: '2024-01-01 00:00:00'
    }
    expect(reservation.phone).toBe('13800138000')
  })

  it('应该定义 ComplianceDoc 类型', () => {
    const doc: ComplianceDoc = {
      id: 1,
      doc_type: 'user_agreement',
      title: '用户协议',
      content: '<p>协议内容</p>',
      updated_at: '2024-01-01 00:00:00'
    }
    expect(doc.doc_type).toBe('user_agreement')
  })

  it('应该定义 AdminUser 类型', () => {
    const admin: AdminUser = {
      id: 1,
      username: 'admin',
      role: 'superadmin',
      created_at: '2024-01-01 00:00:00'
    }
    expect(admin.username).toBe('admin')
  })

  it('应该定义 ApiResponse 类型', () => {
    const response: ApiResponse = {
      code: 0,
      message: 'success',
      data: { list: [] }
    }
    expect(response.code).toBe(0)
  })
})
