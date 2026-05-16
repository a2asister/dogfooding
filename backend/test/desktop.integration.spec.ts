import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { DesktopConfig } from '../src/desktop/entities/desktop-config.entity';
import { DesktopModule } from '../src/desktop/desktop.module';
import { AuthModule } from '../src/auth/auth.module';

describe('Desktop Integration Tests', () => {
  let app: INestApplication;
  let repository: Repository<DesktopConfig>;
  let jwtService: JwtService;
  let authToken: string;

  const mockDesktopConfig: Partial<DesktopConfig> = {
    wallpaper: 'https://example.com/wallpaper.jpg',
    layout: [
      { id: '1', name: '此电脑', icon: 'computer', x: 20, y: 20, type: 'app' as const },
      { id: '4', name: '任务管理器', icon: 'task-manager', x: 20, y: 320, type: 'app' as const },
      { id: '5', name: '应用商店', icon: 'app-store', x: 20, y: 420, type: 'app' as const },
    ],
    taskbarConfig: { showTime: true, position: 'bottom', showSearch: true, showNotifications: true, autoHide: false },
    startMenu: [
      { id: '1', name: '文件资源管理器', icon: 'explorer' },
      { id: '4', name: '任务管理器', icon: 'task-manager' },
      { id: '5', name: '应用商店', icon: 'app-store' },
    ],
    theme: {
      mode: 'dark' as const,
      primaryColor: '#0078d7',
      glassmorphism: {
        enabled: true,
        blur: 20,
        opacity: 0.85,
        saturation: 1.2,
      },
      transparency: 0.85,
    },
    display: {
      scale: 1,
      fontFamily: 'Segoe UI',
      animationsEnabled: true,
      iconSize: 'medium' as const,
    },
    dateTime: {
      timeFormat: '24h' as const,
      dateFormat: 'YYYY-MM-DD',
      showSeconds: false,
      showDate: true,
    },
    personalization: {
      accentColor: '#0078d7',
      soundEffects: true,
      notificationsEnabled: true,
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [DesktopModule, AuthModule],
    })
      .overrideProvider(getRepositoryToken(DesktopConfig))
      .useValue({
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    repository = moduleFixture.get<Repository<DesktopConfig>>(getRepositoryToken(DesktopConfig));
    jwtService = moduleFixture.get<JwtService>(JwtService);

    authToken = jwtService.sign({ userId: 1, username: 'testuser' });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/desktop/config', () => {
    it('should return desktop config when authenticated', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockDesktopConfig as DesktopConfig);

      const response = await request(app.getHttpServer())
        .get('/api/desktop/config')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDesktopConfig);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app.getHttpServer()).get('/api/desktop/config');

      expect(response.status).toBe(401);
    });

    it('should include task manager in layout', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockDesktopConfig as DesktopConfig);

      const response = await request(app.getHttpServer())
        .get('/api/desktop/config')
        .set('Authorization', `Bearer ${authToken}`);

      const hasTaskManager = response.body.layout.some(item => item.id === '4' && item.name === '任务管理器');
      expect(hasTaskManager).toBe(true);
    });

    it('should include app store in layout', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockDesktopConfig as DesktopConfig);

      const response = await request(app.getHttpServer())
        .get('/api/desktop/config')
        .set('Authorization', `Bearer ${authToken}`);

      const hasAppStore = response.body.layout.some(item => item.id === '5' && item.name === '应用商店');
      expect(hasAppStore).toBe(true);
    });
  });

  describe('POST /api/desktop/layout', () => {
    it('should save layout successfully', async () => {
      const newLayout = [
        { id: '1', name: '此电脑', icon: 'computer', x: 100, y: 100, type: 'app' as const },
        { id: '4', name: '任务管理器', icon: 'task-manager', x: 100, y: 200, type: 'app' as const },
      ];
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockDesktopConfig as DesktopConfig);
      jest.spyOn(repository, 'save').mockResolvedValue({ ...mockDesktopConfig, layout: newLayout } as DesktopConfig);

      const response = await request(app.getHttpServer())
        .post('/api/desktop/layout')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newLayout);

      expect(response.status).toBe(200);
      expect(response.body.layout).toEqual(newLayout);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/desktop/layout')
        .send([]);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/desktop/theme', () => {
    it('should save theme configuration successfully', async () => {
      const newTheme = {
        mode: 'light' as const,
        primaryColor: '#ff0000',
        glassmorphism: {
          enabled: false,
          blur: 10,
          opacity: 0.5,
          saturation: 1,
        },
        transparency: 0.5,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockDesktopConfig as DesktopConfig);
      jest.spyOn(repository, 'save').mockResolvedValue({ ...mockDesktopConfig, theme: newTheme } as DesktopConfig);

      const response = await request(app.getHttpServer())
        .post('/api/desktop/theme')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTheme);

      expect(response.status).toBe(200);
      expect(response.body.theme).toEqual(newTheme);
    });
  });

  describe('POST /api/desktop/wallpaper', () => {
    it('should save wallpaper successfully', async () => {
      const newWallpaper = 'https://example.com/new-wallpaper.jpg';
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockDesktopConfig as DesktopConfig);
      jest.spyOn(repository, 'save').mockResolvedValue({ ...mockDesktopConfig, wallpaper: newWallpaper } as DesktopConfig);

      const response = await request(app.getHttpServer())
        .post('/api/desktop/wallpaper')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ wallpaper: newWallpaper });

      expect(response.status).toBe(200);
      expect(response.body.wallpaper).toEqual(newWallpaper);
    });
  });

  describe('POST /api/desktop/taskbar', () => {
    it('should save taskbar configuration successfully', async () => {
      const newTaskbarConfig = {
        showTime: false,
        position: 'top' as const,
        showSearch: false,
        showNotifications: false,
        autoHide: true,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockDesktopConfig as DesktopConfig);
      jest.spyOn(repository, 'save').mockResolvedValue({ ...mockDesktopConfig, taskbarConfig: newTaskbarConfig } as DesktopConfig);

      const response = await request(app.getHttpServer())
        .post('/api/desktop/taskbar')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTaskbarConfig);

      expect(response.status).toBe(200);
      expect(response.body.taskbarConfig).toEqual(newTaskbarConfig);
    });
  });

  describe('POST /api/desktop/display', () => {
    it('should save display configuration successfully', async () => {
      const newDisplayConfig = {
        scale: 1.25,
        fontFamily: 'Arial',
        animationsEnabled: false,
        iconSize: 'large' as const,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockDesktopConfig as DesktopConfig);
      jest.spyOn(repository, 'save').mockResolvedValue({ ...mockDesktopConfig, display: newDisplayConfig } as DesktopConfig);

      const response = await request(app.getHttpServer())
        .post('/api/desktop/display')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newDisplayConfig);

      expect(response.status).toBe(200);
      expect(response.body.display).toEqual(newDisplayConfig);
    });
  });

  describe('POST /api/desktop/datetime', () => {
    it('should save date time configuration successfully', async () => {
      const newDateTimeConfig = {
        timeFormat: '12h' as const,
        dateFormat: 'MM/DD/YYYY',
        showSeconds: true,
        showDate: false,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockDesktopConfig as DesktopConfig);
      jest.spyOn(repository, 'save').mockResolvedValue({ ...mockDesktopConfig, dateTime: newDateTimeConfig } as DesktopConfig);

      const response = await request(app.getHttpServer())
        .post('/api/desktop/datetime')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newDateTimeConfig);

      expect(response.status).toBe(200);
      expect(response.body.dateTime).toEqual(newDateTimeConfig);
    });
  });

  describe('POST /api/desktop/personalization', () => {
    it('should save personalization configuration successfully', async () => {
      const newPersonalizationConfig = {
        accentColor: '#ff00ff',
        soundEffects: false,
        notificationsEnabled: false,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockDesktopConfig as DesktopConfig);
      jest.spyOn(repository, 'save').mockResolvedValue({ ...mockDesktopConfig, personalization: newPersonalizationConfig } as DesktopConfig);

      const response = await request(app.getHttpServer())
        .post('/api/desktop/personalization')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPersonalizationConfig);

      expect(response.status).toBe(200);
      expect(response.body.personalization).toEqual(newPersonalizationConfig);
    });
  });

  describe('GET /api/desktop/default-icons', () => {
    it('should return default icons', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/desktop/default-icons')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/desktop/repair', () => {
    it('should repair config successfully', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockDesktopConfig as DesktopConfig);

      const response = await request(app.getHttpServer())
        .post('/api/desktop/repair')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDesktopConfig);
    });
  });

  describe('Full Configuration Flow', () => {
    it('should complete full configuration update flow', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockDesktopConfig as DesktopConfig);

      const initialResponse = await request(app.getHttpServer())
        .get('/api/desktop/config')
        .set('Authorization', `Bearer ${authToken}`);
      expect(initialResponse.status).toBe(200);

      const updatedTheme = { ...initialResponse.body.theme, mode: 'light' };
      jest.spyOn(repository, 'save').mockResolvedValue({ ...mockDesktopConfig, theme: updatedTheme } as DesktopConfig);
      const themeResponse = await request(app.getHttpServer())
        .post('/api/desktop/theme')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedTheme);
      expect(themeResponse.status).toBe(200);
      expect(themeResponse.body.theme.mode).toBe('light');

      const updatedWallpaper = 'https://example.com/updated-wallpaper.jpg';
      jest.spyOn(repository, 'save').mockResolvedValue({ ...mockDesktopConfig, wallpaper: updatedWallpaper } as DesktopConfig);
      const wallpaperResponse = await request(app.getHttpServer())
        .post('/api/desktop/wallpaper')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ wallpaper: updatedWallpaper });
      expect(wallpaperResponse.status).toBe(200);
      expect(wallpaperResponse.body.wallpaper).toBe(updatedWallpaper);
    });
  });
});
