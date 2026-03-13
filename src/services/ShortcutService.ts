/**
 * ShortcutService
 *
 * Wraps the Android ShortcutModule native module to expose a clean TypeScript
 * API for creating pinned home-screen shortcuts.
 *
 * Shortcuts use the same deep-link URLs as the Quick Settings Tiles so that
 * tapping them triggers the isQuickTile flow in App.tsx.
 */

import { Platform } from 'react-native';
import { requestPinShortcut, isShortcutModuleAvailable } from 'shortcut';
import { lightColors } from '../theme';

export const ShortcutService = {
  /**
   * Ask the launcher to add a "Download clipboard" shortcut to the home screen.
   * Tapping it launches the app via `syncclipboard://quick-tile`.
   */
  addDownloadShortcut(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return Promise.reject(new Error('Home-screen shortcuts are only supported on Android'));
    }
    if (!isShortcutModuleAvailable) {
      return Promise.reject(new Error('ShortcutModule is not available'));
    }
    return requestPinShortcut(
      'shortcut_download',
      '下载剪贴板',
      'syncclipboard://quick-tile',
      'ic_tile_download',
      lightColors.primary
    ).catch((error) => {
      console.error('ShortcutModule addDownloadShortcut error:', error);
      throw error;
    });
  },

  /**
   * Ask the launcher to add an "Upload clipboard" shortcut to the home screen.
   * Tapping it launches the app via `syncclipboard://quick-tile-upload`.
   */
  addUploadShortcut(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return Promise.reject(new Error('Home-screen shortcuts are only supported on Android'));
    }
    if (!isShortcutModuleAvailable) {
      return Promise.reject(new Error('ShortcutModule is not available'));
    }
    return requestPinShortcut(
      'shortcut_upload',
      '上传剪贴板',
      'syncclipboard://quick-tile-upload',
      'ic_tile_upload',
      lightColors.primary
    ).catch((error) => {
      console.error('ShortcutModule addUploadShortcut error:', error);
      throw error;
    });
  },
};
