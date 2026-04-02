import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

const MODULE_NAME = 'BackgroundSyncModule';

interface BackgroundSyncModuleInterface {
  startForegroundService(title: string, text: string): void;
  stopForegroundService(): void;
  isServiceRunning(): boolean;
  updateNotification(title: string, text: string): void;
  showDebugNotification(title: string, text: string): void;
  dismissDebugNotification(): void;
}

const NativeModule: BackgroundSyncModuleInterface | null =
  Platform.OS === 'android' ? requireNativeModule(MODULE_NAME) : null;

export function startForegroundService(title: string, text: string): void {
  if (NativeModule) {
    NativeModule.startForegroundService(title, text);
  }
}

export function stopForegroundService(): void {
  if (NativeModule) {
    NativeModule.stopForegroundService();
  }
}

export function isServiceRunning(): boolean {
  if (NativeModule) {
    return NativeModule.isServiceRunning();
  }
  return false;
}

export function updateNotification(title: string, text: string): void {
  if (NativeModule) {
    NativeModule.updateNotification(title, text);
  }
}

export function showDebugNotification(title: string, text: string): void {
  if (NativeModule) {
    NativeModule.showDebugNotification(title, text);
  }
}

export function dismissDebugNotification(): void {
  if (NativeModule) {
    NativeModule.dismissDebugNotification();
  }
}
