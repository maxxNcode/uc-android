import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

export interface ShortcutModuleType {
  requestPinShortcut(
    shortcutId: string,
    label: string,
    url: string,
    iconResName: string,
    bgColorHex: string
  ): Promise<boolean>;
}

let nativeModule: ShortcutModuleType | null = null;

function getNativeModule(): ShortcutModuleType {
  if (nativeModule === null) {
    if (Platform.OS !== 'android') {
      throw new Error('ShortcutModule is only available on Android');
    }
    nativeModule = requireNativeModule<ShortcutModuleType>('ShortcutModule');
  }
  return nativeModule!;
}

export const isShortcutModuleAvailable = Platform.OS === 'android';

export async function requestPinShortcut(
  shortcutId: string,
  label: string,
  url: string,
  iconResName: string,
  bgColorHex: string
): Promise<boolean> {
  if (Platform.OS !== 'android') {
    throw new Error('ShortcutModule is only available on Android');
  }
  return getNativeModule().requestPinShortcut(shortcutId, label, url, iconResName, bgColorHex);
}
