/**
 * Background Sync Service
 * 后台同步服务 - 当 APP 切换到后台时不停止轮询，继续监听剪贴板
 *
 * 不再使用前台服务，而是让 HomeScreen 和 ClipboardMonitor 的轮询在后台继续运行。
 * 本服务仅负责：
 * - 跟踪后台同步激活状态（供 HomeScreen/ClipboardMonitor 查询）
 * - 在后台时运行调试通知（可选）
 */

import { AppState, AppStateStatus, Platform } from 'react-native';

/**
 * 后台同步服务（单例）
 *
 * 当 enableBackgroundSync 开启时：
 * - HomeScreen 的远程轮询 / SignalR 在后台不会停止
 * - ClipboardMonitor 的本地轮询在后台不会停止
 * - 可选运行调试通知计时器
 */
class BackgroundSyncService {
  private static instance: BackgroundSyncService | null = null;

  /** 后台同步功能是否已启用（注册了 AppState 监听） */
  private enabled = false;
  /** APP 当前是否在后台且后台同步激活中 */
  private isInBackground = false;
  private appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

  private constructor() {}

  static getInstance(): BackgroundSyncService {
    if (!BackgroundSyncService.instance) {
      BackgroundSyncService.instance = new BackgroundSyncService();
    }
    return BackgroundSyncService.instance;
  }

  /**
   * 启用后台同步（注册生命周期监听）
   */
  enable(): void {
    if (Platform.OS !== 'android') return;
    if (this.appStateSubscription) return;

    this.enabled = true;
    console.log('[BackgroundSync] Enabled - registering app state listener');
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  /**
   * 禁用后台同步
   */
  disable(): void {
    console.log('[BackgroundSync] Disabled');
    this.enabled = false;
    this.isInBackground = false;

    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }

  /**
   * 检查后台同步是否已启用
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * 检查后台同步是否激活中（APP 在后台且后台同步已启用）
   */
  isBackgroundSyncActive(): boolean {
    return this.enabled && this.isInBackground;
  }

  /**
   * 处理 APP 状态变化
   */
  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background') {
      console.log('[BackgroundSync] App going to background');
      this.isInBackground = true;
    } else if (nextAppState === 'active') {
      console.log('[BackgroundSync] App coming to foreground');
      this.isInBackground = false;
    }
  };
}

/**
 * 获取后台同步服务单例
 */
export function getBackgroundSyncService(): BackgroundSyncService {
  return BackgroundSyncService.getInstance();
}
