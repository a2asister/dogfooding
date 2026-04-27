import { create } from 'zustand';
import type {
  Designer,
  WorkExperience,
  PortfolioCategory,
  Portfolio,
  CaseStudy,
  ServicePackage,
  Order,
  QuickReply,
  Review,
  MaterialCategory,
  Material,
  User,
  ChatSession,
  ChatMessage,
  UserFavorite,
  DownloadRecord,
  Analytics,
  OperationLog,
  LoginRecord
} from '../types';

// 应用状态接口
interface AppState {
  // 设计师相关
  designer: Designer | null;
  workExperiences: WorkExperience[];
  setDesigner: (designer: Designer | null) => void;
  setWorkExperiences: (experiences: WorkExperience[]) => void;

  // 作品相关
  portfolioCategories: PortfolioCategory[];
  portfolios: Portfolio[];
  currentPortfolio: Portfolio | null;
  setPortfolioCategories: (categories: PortfolioCategory[]) => void;
  setPortfolios: (portfolios: Portfolio[]) => void;
  setCurrentPortfolio: (portfolio: Portfolio | null) => void;

  // 案例项目相关
  caseStudies: CaseStudy[];
  currentCaseStudy: CaseStudy | null;
  setCaseStudies: (caseStudies: CaseStudy[]) => void;
  setCurrentCaseStudy: (caseStudy: CaseStudy | null) => void;

  // 服务套餐相关
  servicePackages: ServicePackage[];
  setServicePackages: (packages: ServicePackage[]) => void;

  // 订单相关
  orders: Order[];
  currentOrder: Order | null;
  setOrders: (orders: Order[]) => void;
  setCurrentOrder: (order: Order | null) => void;

  // 聊天相关
  chatSessions: ChatSession[];
  chatMessages: ChatMessage[];
  currentSession: ChatSession | null;
  unreadMessageCount: number;
  setChatSessions: (sessions: ChatSession[]) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  setCurrentSession: (session: ChatSession | null) => void;
  setUnreadMessageCount: (count: number) => void;
  addMessage: (message: ChatMessage) => void;

  // 快捷回复相关
  quickReplies: QuickReply[];
  setQuickReplies: (replies: QuickReply[]) => void;

  // 评价相关
  reviews: Review[];
  setReviews: (reviews: Review[]) => void;

  // 素材相关
  materialCategories: MaterialCategory[];
  materials: Material[];
  userFavorites: UserFavorite[];
  downloadRecords: DownloadRecord[];
  setMaterialCategories: (categories: MaterialCategory[]) => void;
  setMaterials: (materials: Material[]) => void;
  setUserFavorites: (favorites: UserFavorite[]) => void;
  setDownloadRecords: (records: DownloadRecord[]) => void;

  // 数据统计相关
  analytics: Analytics[];
  operationLogs: OperationLog[];
  loginRecords: LoginRecord[];
  setAnalytics: (analytics: Analytics[]) => void;
  setOperationLogs: (logs: OperationLog[]) => void;
  setLoginRecords: (records: LoginRecord[]) => void;

  // 用户相关
  currentUser: User | null;
  isAuthenticated: boolean;
  setCurrentUser: (user: User | null) => void;
  setIsAuthenticated: (isAuth: boolean) => void;
  logout: () => void;

  // UI 状态
  isLoading: boolean;
  error: string | null;
  currentPage: string;
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentPage: (page: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;

  // 数据初始化状态
  isDataInitialized: boolean;
  setIsDataInitialized: (initialized: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // 设计师相关初始值
  designer: null,
  workExperiences: [],
  setDesigner: (designer) => set({ designer }),
  setWorkExperiences: (experiences) => set({ workExperiences: experiences }),

  // 作品相关初始值
  portfolioCategories: [],
  portfolios: [],
  currentPortfolio: null,
  setPortfolioCategories: (categories) => set({ portfolioCategories: categories }),
  setPortfolios: (portfolios) => set({ portfolios }),
  setCurrentPortfolio: (portfolio) => set({ currentPortfolio: portfolio }),

  // 案例项目相关初始值
  caseStudies: [],
  currentCaseStudy: null,
  setCaseStudies: (caseStudies) => set({ caseStudies }),
  setCurrentCaseStudy: (caseStudy) => set({ currentCaseStudy: caseStudy }),

  // 服务套餐相关初始值
  servicePackages: [],
  setServicePackages: (packages) => set({ servicePackages: packages }),

  // 订单相关初始值
  orders: [],
  currentOrder: null,
  setOrders: (orders) => set({ orders }),
  setCurrentOrder: (order) => set({ currentOrder: order }),

  // 聊天相关初始值
  chatSessions: [],
  chatMessages: [],
  currentSession: null,
  unreadMessageCount: 0,
  setChatSessions: (sessions) => set({ chatSessions: sessions }),
  setChatMessages: (messages) => set({ chatMessages: messages }),
  setCurrentSession: (session) => set({ currentSession: session }),
  setUnreadMessageCount: (count) => set({ unreadMessageCount: count }),
  addMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages, message]
  })),

  // 快捷回复相关初始值
  quickReplies: [],
  setQuickReplies: (replies) => set({ quickReplies: replies }),

  // 评价相关初始值
  reviews: [],
  setReviews: (reviews) => set({ reviews }),

  // 素材相关初始值
  materialCategories: [],
  materials: [],
  userFavorites: [],
  downloadRecords: [],
  setMaterialCategories: (categories) => set({ materialCategories: categories }),
  setMaterials: (materials) => set({ materials }),
  setUserFavorites: (favorites) => set({ userFavorites: favorites }),
  setDownloadRecords: (records) => set({ downloadRecords: records }),

  // 数据统计相关初始值
  analytics: [],
  operationLogs: [],
  loginRecords: [],
  setAnalytics: (analytics) => set({ analytics }),
  setOperationLogs: (logs) => set({ operationLogs: logs }),
  setLoginRecords: (records) => set({ loginRecords: records }),

  // 用户相关初始值
  currentUser: null,
  isAuthenticated: false,
  setCurrentUser: (user) => set({ currentUser: user }),
  setIsAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),
  logout: () => set({
    currentUser: null,
    isAuthenticated: false,
  }),

  // UI 状态初始值
  isLoading: false,
  error: null,
  currentPage: 'home',
  sidebarOpen: true,
  mobileMenuOpen: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

  // 数据初始化状态
  isDataInitialized: false,
  setIsDataInitialized: (initialized) => set({ isDataInitialized: initialized }),
}));

// 选择器函数，用于优化性能
export const selectDesigner = (state: AppState) => state.designer;
export const selectWorkExperiences = (state: AppState) => state.workExperiences;
export const selectPortfolioCategories = (state: AppState) => state.portfolioCategories;
export const selectPortfolios = (state: AppState) => state.portfolios;
export const selectCaseStudies = (state: AppState) => state.caseStudies;
export const selectServicePackages = (state: AppState) => state.servicePackages;
export const selectOrders = (state: AppState) => state.orders;
export const selectChatSessions = (state: AppState) => state.chatSessions;
export const selectChatMessages = (state: AppState) => state.chatMessages;
export const selectUnreadMessageCount = (state: AppState) => state.unreadMessageCount;
export const selectReviews = (state: AppState) => state.reviews;
export const selectMaterialCategories = (state: AppState) => state.materialCategories;
export const selectMaterials = (state: AppState) => state.materials;
export const selectAnalytics = (state: AppState) => state.analytics;
export const selectCurrentUser = (state: AppState) => state.currentUser;
export const selectIsAuthenticated = (state: AppState) => state.isAuthenticated;
export const selectIsLoading = (state: AppState) => state.isLoading;
export const selectError = (state: AppState) => state.error;
export const selectCurrentPage = (state: AppState) => state.currentPage;
export const selectSidebarOpen = (state: AppState) => state.sidebarOpen;
export const selectMobileMenuOpen = (state: AppState) => state.mobileMenuOpen;
export const selectIsDataInitialized = (state: AppState) => state.isDataInitialized;
