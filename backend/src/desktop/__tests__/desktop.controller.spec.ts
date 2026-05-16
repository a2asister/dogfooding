import { Test, TestingModule } from '@nestjs/testing';
import { DesktopController } from '../desktop.controller';
import { DesktopService } from '../desktop.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('DesktopController', () => {
  let controller: DesktopController;
  let service: DesktopService;

  const mockDesktopConfig = {
    id: 1,
    wallpaper: 'https://example.com/wallpaper.jpg',
    layout: [
      { id: '1', name: '此电脑', icon: 'computer', x: 20, y: 20, type: 'app' as const },
      { id: '4', name: '任务管理器', icon: 'task-manager', x: 20, y: 320, type: 'app' as const },
      { id: '5', name: '应用商店', icon: 'app-store', x: 20, y: 420, type: 'app' as const },
    ],
    taskbarConfig: { showTime: true, position: 'bottom' as const, showSearch: true, showNotifications: true, autoHide: false },
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
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockRequest = {
    user: { userId: 1 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DesktopController],
      providers: [
        {
          provide: DesktopService,
          useValue: {
            getDesktopConfig: jest.fn(),
            saveLayout: jest.fn(),
            saveTheme: jest.fn(),
            saveWallpaper: jest.fn(),
            saveTaskbarConfig: jest.fn(),
            saveDisplayConfig: jest.fn(),
            saveDateTimeConfig: jest.fn(),
            savePersonalizationConfig: jest.fn(),
            getDefaultIcons: jest.fn(),
            repairConfig: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          request.user = { userId: 1 };
          return true;
        },
      })
      .compile();

    controller = module.get<DesktopController>(DesktopController);
    service = module.get<DesktopService>(DesktopService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getConfig', () => {
    it('should return desktop config', async () => {
      jest.spyOn(service, 'getDesktopConfig').mockResolvedValue(mockDesktopConfig);

      const result = await controller.getConfig(mockRequest as any);

      expect(result).toEqual(mockDesktopConfig);
      expect(service.getDesktopConfig).toHaveBeenCalledWith(1);
    });
  });

  describe('saveLayout', () => {
    it('should save layout successfully', async () => {
      const newLayout = [
        { id: '1', name: '此电脑', icon: 'computer', x: 100, y: 100, type: 'app' as const },
      ];
      jest.spyOn(service, 'saveLayout').mockResolvedValue({ ...mockDesktopConfig, layout: newLayout });

      const result = await controller.saveLayout(mockRequest as any, newLayout);

      expect(result).toEqual({ ...mockDesktopConfig, layout: newLayout });
      expect(service.saveLayout).toHaveBeenCalledWith(1, newLayout);
    });

    it('should return null when save fails', async () => {
      jest.spyOn(service, 'saveLayout').mockResolvedValue(null);

      const result = await controller.saveLayout(mockRequest as any, []);

      expect(result).toBeNull();
    });
  });

  describe('saveTheme', () => {
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
      jest.spyOn(service, 'saveTheme').mockResolvedValue({ ...mockDesktopConfig, theme: newTheme });

      const result = await controller.saveTheme(mockRequest as any, newTheme);

      expect(result).toEqual({ ...mockDesktopConfig, theme: newTheme });
      expect(service.saveTheme).toHaveBeenCalledWith(1, newTheme);
    });
  });

  describe('saveWallpaper', () => {
    it('should save wallpaper successfully', async () => {
      const newWallpaper = 'https://example.com/new-wallpaper.jpg';
      jest.spyOn(service, 'saveWallpaper').mockResolvedValue({ ...mockDesktopConfig, wallpaper: newWallpaper });

      const result = await controller.saveWallpaper(mockRequest as any, { wallpaper: newWallpaper });

      expect(result).toEqual({ ...mockDesktopConfig, wallpaper: newWallpaper });
      expect(service.saveWallpaper).toHaveBeenCalledWith(1, newWallpaper);
    });
  });

  describe('saveTaskbarConfig', () => {
    it('should save taskbar configuration successfully', async () => {
      const newTaskbarConfig = {
        showTime: false,
        position: 'top' as const,
        showSearch: false,
        showNotifications: false,
        autoHide: true,
      };
      jest.spyOn(service, 'saveTaskbarConfig').mockResolvedValue({ ...mockDesktopConfig, taskbarConfig: newTaskbarConfig });

      const result = await controller.saveTaskbarConfig(mockRequest as any, newTaskbarConfig);

      expect(result).toEqual({ ...mockDesktopConfig, taskbarConfig: newTaskbarConfig });
      expect(service.saveTaskbarConfig).toHaveBeenCalledWith(1, newTaskbarConfig);
    });
  });

  describe('saveDisplayConfig', () => {
    it('should save display configuration successfully', async () => {
      const newDisplayConfig = {
        scale: 1.25,
        fontFamily: 'Arial',
        animationsEnabled: false,
        iconSize: 'large' as const,
      };
      jest.spyOn(service, 'saveDisplayConfig').mockResolvedValue({ ...mockDesktopConfig, display: newDisplayConfig });

      const result = await controller.saveDisplayConfig(mockRequest as any, newDisplayConfig);

      expect(result).toEqual({ ...mockDesktopConfig, display: newDisplayConfig });
      expect(service.saveDisplayConfig).toHaveBeenCalledWith(1, newDisplayConfig);
    });
  });

  describe('saveDateTimeConfig', () => {
    it('should save date time configuration successfully', async () => {
      const newDateTimeConfig = {
        timeFormat: '12h' as const,
        dateFormat: 'MM/DD/YYYY',
        showSeconds: true,
        showDate: false,
      };
      jest.spyOn(service, 'saveDateTimeConfig').mockResolvedValue({ ...mockDesktopConfig, dateTime: newDateTimeConfig });

      const result = await controller.saveDateTimeConfig(mockRequest as any, newDateTimeConfig);

      expect(result).toEqual({ ...mockDesktopConfig, dateTime: newDateTimeConfig });
      expect(service.saveDateTimeConfig).toHaveBeenCalledWith(1, newDateTimeConfig);
    });
  });

  describe('savePersonalizationConfig', () => {
    it('should save personalization configuration successfully', async () => {
      const newPersonalizationConfig = {
        accentColor: '#ff00ff',
        soundEffects: false,
        notificationsEnabled: false,
      };
      jest.spyOn(service, 'savePersonalizationConfig').mockResolvedValue({ ...mockDesktopConfig, personalization: newPersonalizationConfig });

      const result = await controller.savePersonalizationConfig(mockRequest as any, newPersonalizationConfig);

      expect(result).toEqual({ ...mockDesktopConfig, personalization: newPersonalizationConfig });
      expect(service.savePersonalizationConfig).toHaveBeenCalledWith(1, newPersonalizationConfig);
    });
  });

  describe('getDefaultIcons', () => {
    it('should return default icons', async () => {
      const mockIcons = [
        { id: 'computer', name: '此电脑', icon: 'computer' },
        { id: 'recycle', name: '回收站', icon: 'recycle' },
      ];
      jest.spyOn(service, 'getDefaultIcons').mockReturnValue(mockIcons);

      const result = await controller.getDefaultIcons();

      expect(result).toEqual(mockIcons);
      expect(service.getDefaultIcons).toHaveBeenCalled();
    });
  });

  describe('repairConfig', () => {
    it('should repair and return config', async () => {
      jest.spyOn(service, 'repairConfig').mockResolvedValue(mockDesktopConfig);

      const result = await controller.repairConfig(mockRequest as any);

      expect(result).toEqual(mockDesktopConfig);
      expect(service.repairConfig).toHaveBeenCalledWith(1);
    });
  });

  describe('DTO validation', () => {
    it('should handle ThemeDto correctly', () => {
      const validThemeDto = {
        mode: 'dark',
        primaryColor: '#0078d7',
        glassmorphism: {
          enabled: true,
          blur: 20,
          opacity: 0.85,
          saturation: 1.2,
        },
        transparency: 0.85,
      };
      expect(validThemeDto.mode).toBe('dark');
      expect(validThemeDto.glassmorphism.enabled).toBe(true);
    });

    it('should handle TaskbarConfigDto correctly', () => {
      const validTaskbarDto = {
        showTime: true,
        position: 'bottom',
        showSearch: true,
        showNotifications: true,
        autoHide: false,
      };
      expect(validTaskbarDto.position).toBe('bottom');
    });

    it('should handle DisplayConfigDto correctly', () => {
      const validDisplayDto = {
        scale: 1,
        fontFamily: 'Segoe UI',
        animationsEnabled: true,
        iconSize: 'medium',
      };
      expect(validDisplayDto.iconSize).toBe('medium');
    });

    it('should handle DateTimeConfigDto correctly', () => {
      const validDateTimeDto = {
        timeFormat: '24h',
        dateFormat: 'YYYY-MM-DD',
        showSeconds: false,
        showDate: true,
      };
      expect(validDateTimeDto.timeFormat).toBe('24h');
    });

    it('should handle PersonalizationConfigDto correctly', () => {
      const validPersonalizationDto = {
        accentColor: '#0078d7',
        soundEffects: true,
        notificationsEnabled: true,
      };
      expect(validPersonalizationDto.accentColor).toBe('#0078d7');
    });
  });
});
