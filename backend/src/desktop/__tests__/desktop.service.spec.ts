import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DesktopService } from '../desktop.service';
import { DesktopConfig } from '../entities/desktop-config.entity';

describe('DesktopService', () => {
  let service: DesktopService;
  let repository: Repository<DesktopConfig>;

  const mockDesktopConfig: DesktopConfig = {
    id: 1,
    wallpaper: 'https://example.com/wallpaper.jpg',
    layout: [
      { id: '1', name: '此电脑', icon: 'computer', x: 20, y: 20, type: 'app' },
      { id: '2', name: '回收站', icon: 'recycle', x: 20, y: 120, type: 'app' },
      { id: '3', name: '文档', icon: 'folder', x: 20, y: 220, type: 'folder' },
      { id: '4', name: '任务管理器', icon: 'task-manager', x: 20, y: 320, type: 'app' },
      { id: '5', name: '应用商店', icon: 'app-store', x: 20, y: 420, type: 'app' },
    ],
    taskbarConfig: { showTime: true, position: 'bottom', showSearch: true, showNotifications: true, autoHide: false },
    startMenu: [
      { id: '1', name: '文件资源管理器', icon: 'explorer' },
      { id: '2', name: '设置', icon: 'settings' },
      { id: '4', name: '任务管理器', icon: 'task-manager' },
      { id: '5', name: '应用商店', icon: 'app-store' },
    ],
    theme: {
      mode: 'dark',
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
      iconSize: 'medium',
    },
    dateTime: {
      timeFormat: '24h',
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
  } as DesktopConfig;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DesktopService,
        {
          provide: getRepositoryToken(DesktopConfig),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DesktopService>(DesktopService);
    repository = module.get<Repository<DesktopConfig>>(getRepositoryToken(DesktopConfig));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDesktopConfig', () => {
    it('should return existing config when found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockDesktopConfig);

      const result = await service.getDesktopConfig(1);

      expect(result).toEqual(mockDesktopConfig);
      expect(repository.findOne).toHaveBeenCalled();
    });

    it('should create and return default config when none exists', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(mockDesktopConfig);
      jest.spyOn(repository, 'save').mockResolvedValue(mockDesktopConfig);

      const result = await service.getDesktopConfig(1);

      expect(result).toEqual(mockDesktopConfig);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should include task manager and app store in default layout', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockImplementation((config) => config as DesktopConfig);
      jest.spyOn(repository, 'save').mockImplementation((config) => Promise.resolve(config as DesktopConfig));

      const result = await service.getDesktopConfig(1);

      const hasTaskManager = result.layout.some(item => item.id === '4' && item.name === '任务管理器');
      const hasAppStore = result.layout.some(item => item.id === '5' && item.name === '应用商店');
      expect(hasTaskManager).toBe(true);
      expect(hasAppStore).toBe(true);
    });

    it('should include task manager and app store in default startMenu', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockImplementation((config) => config as DesktopConfig);
      jest.spyOn(repository, 'save').mockImplementation((config) => Promise.resolve(config as DesktopConfig));

      const result = await service.getDesktopConfig(1);

      const hasTaskManager = result.startMenu.some(item => item.id === '4' && item.name === '任务管理器');
      const hasAppStore = result.startMenu.some(item => item.id === '5' && item.name === '应用商店');
      expect(hasTaskManager).toBe(true);
      expect(hasAppStore).toBe(true);
    });
  });

  describe('saveLayout', () => {
    it('should save layout successfully', async () => {
      const newLayout = [
        { id: '1', name: '此电脑', icon: 'computer', x: 100, y: 100, type: 'app' as const },
      ];
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockDesktopConfig);
      jest.spyOn(repository, 'save').mockResolvedValue({ ...mockDesktopConfig, layout: newLayout });

      const result = await service.saveLayout(1, newLayout);

      expect(result.layout).toEqual(newLayout);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should return null when config not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.saveLayout(1, []);

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
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockDesktopConfig);
      jest.spyOn(repository, 'save').mockResolvedValue({ ...mockDesktopConfig, theme: newTheme });

      const result = await service.saveTheme(1, newTheme);

      expect(result.theme).toEqual(newTheme);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should return null when config not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.saveTheme(1, {} as any);

      expect(result).toBeNull();
    });
  });

  describe('saveWallpaper', () => {
    it('should save wallpaper successfully', async () => {
      const newWallpaper = 'https://example.com/new-wallpaper.jpg';
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockDesktopConfig);
      jest.spyOn(repository, 'save').mockResolvedValue({ ...mockDesktopConfig, wallpaper: newWallpaper });

      const result = await service.saveWallpaper(1, newWallpaper);

      expect(result.wallpaper).toEqual(newWallpaper);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should return null when config not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.saveWallpaper(1, 'test');

      expect(result).toBeNull();
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
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockDesktopConfig);
      jest.spyOn(repository, 'save').mockResolvedValue({ ...mockDesktopConfig, taskbarConfig: newTaskbarConfig });

      const result = await service.saveTaskbarConfig(1, newTaskbarConfig);

      expect(result.taskbarConfig).toEqual(newTaskbarConfig);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should return null when config not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.saveTaskbarConfig(1, {} as any);

      expect(result).toBeNull();
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
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockDesktopConfig);
      jest.spyOn(repository, 'save').mockResolvedValue({ ...mockDesktopConfig, display: newDisplayConfig });

      const result = await service.saveDisplayConfig(1, newDisplayConfig);

      expect(result.display).toEqual(newDisplayConfig);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should return null when config not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.saveDisplayConfig(1, {} as any);

      expect(result).toBeNull();
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
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockDesktopConfig);
      jest.spyOn(repository, 'save').mockResolvedValue({ ...mockDesktopConfig, dateTime: newDateTimeConfig });

      const result = await service.saveDateTimeConfig(1, newDateTimeConfig);

      expect(result.dateTime).toEqual(newDateTimeConfig);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should return null when config not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.saveDateTimeConfig(1, {} as any);

      expect(result).toBeNull();
    });
  });

  describe('savePersonalizationConfig', () => {
    it('should save personalization configuration successfully', async () => {
      const newPersonalizationConfig = {
        accentColor: '#ff00ff',
        soundEffects: false,
        notificationsEnabled: false,
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockDesktopConfig);
      jest.spyOn(repository, 'save').mockResolvedValue({ ...mockDesktopConfig, personalization: newPersonalizationConfig });

      const result = await service.savePersonalizationConfig(1, newPersonalizationConfig);

      expect(result.personalization).toEqual(newPersonalizationConfig);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should return null when config not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.savePersonalizationConfig(1, {} as any);

      expect(result).toBeNull();
    });
  });

  describe('getDefaultIcons', () => {
    it('should return default icons array', () => {
      const result = service.getDefaultIcons();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(icon => icon.id === 'computer')).toBe(true);
      expect(result.some(icon => icon.id === 'recycle')).toBe(true);
    });
  });

  describe('repairConfig', () => {
    it('should repair and return existing config', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockDesktopConfig);

      const result = await service.repairConfig(1);

      expect(result).toEqual(mockDesktopConfig);
    });

    it('should create new config when none exists for repair', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(mockDesktopConfig);
      jest.spyOn(repository, 'save').mockResolvedValue(mockDesktopConfig);

      const result = await service.repairConfig(1);

      expect(result).toEqual(mockDesktopConfig);
    });
  });

  describe('validateAndFixConfig', () => {
    it('should add missing task manager to layout', () => {
      const incompleteConfig = {
        ...mockDesktopConfig,
        layout: mockDesktopConfig.layout.filter(item => item.id !== '4'),
      };

      const result = service['validateAndFixConfig'](incompleteConfig);

      const hasTaskManager = result.layout.some(item => item.id === '4');
      expect(hasTaskManager).toBe(true);
    });

    it('should add missing app store to layout', () => {
      const incompleteConfig = {
        ...mockDesktopConfig,
        layout: mockDesktopConfig.layout.filter(item => item.id !== '5'),
      };

      const result = service['validateAndFixConfig'](incompleteConfig);

      const hasAppStore = result.layout.some(item => item.id === '5');
      expect(hasAppStore).toBe(true);
    });

    it('should add missing task manager to startMenu', () => {
      const incompleteConfig = {
        ...mockDesktopConfig,
        startMenu: mockDesktopConfig.startMenu.filter(item => item.id !== '4'),
      };

      const result = service['validateAndFixConfig'](incompleteConfig);

      const hasTaskManager = result.startMenu.some(item => item.id === '4');
      expect(hasTaskManager).toBe(true);
    });

    it('should add missing app store to startMenu', () => {
      const incompleteConfig = {
        ...mockDesktopConfig,
        startMenu: mockDesktopConfig.startMenu.filter(item => item.id !== '5'),
      };

      const result = service['validateAndFixConfig'](incompleteConfig);

      const hasAppStore = result.startMenu.some(item => item.id === '5');
      expect(hasAppStore).toBe(true);
    });

    it('should create default layout when layout is empty', () => {
      const incompleteConfig = {
        ...mockDesktopConfig,
        layout: [],
      };

      const result = service['validateAndFixConfig'](incompleteConfig);

      expect(result.layout.length).toBeGreaterThan(0);
    });

    it('should create default startMenu when startMenu is empty', () => {
      const incompleteConfig = {
        ...mockDesktopConfig,
        startMenu: [],
      };

      const result = service['validateAndFixConfig'](incompleteConfig);

      expect(result.startMenu.length).toBeGreaterThan(0);
    });
  });
});
