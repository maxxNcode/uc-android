import {
  AndroidConfig,
  ConfigPlugin,
  withAndroidManifest,
  createRunOncePlugin,
} from 'expo/config-plugins';

/**
 * Adds Background Sync foreground service and required permissions to AndroidManifest.xml
 */
function addBackgroundSyncService(
  androidManifest: AndroidConfig.Manifest.AndroidManifest
): AndroidConfig.Manifest.AndroidManifest {
  const { manifest } = androidManifest;

  if (!Array.isArray(manifest.application)) {
    console.warn('withBackgroundSyncService: No application array in manifest?');
    return androidManifest;
  }

  // Add FOREGROUND_SERVICE permission
  if (!manifest['uses-permission']) {
    manifest['uses-permission'] = [];
  }

  const requiredPermissions = [
    'android.permission.FOREGROUND_SERVICE',
    'android.permission.FOREGROUND_SERVICE_DATA_SYNC',
    'android.permission.POST_NOTIFICATIONS',
  ];

  for (const perm of requiredPermissions) {
    const exists = manifest['uses-permission'].some((p) => p.$?.['android:name'] === perm);
    if (!exists) {
      manifest['uses-permission'].push({
        $: { 'android:name': perm },
      } as NonNullable<(typeof manifest)['uses-permission']>[0]);
      console.log(`✓ Added permission: ${perm}`);
    }
  }

  // Add the foreground service to the application
  const application = manifest.application[0];

  if (!application.service) {
    application.service = [];
  }

  const serviceName = 'expo.modules.backgroundsync.BackgroundSyncForegroundService';
  type ManifestService = (typeof application.service)[0];
  const existingIndex = application.service.findIndex(
    (s) =>
      (s as unknown as Record<string, Record<string, string>>).$?.['android:name'] === serviceName
  );

  const serviceConfig = {
    $: {
      'android:name': serviceName,
      'android:exported': 'false',
      'android:foregroundServiceType': 'dataSync',
    },
  };

  if (existingIndex >= 0) {
    application.service[existingIndex] = serviceConfig as unknown as ManifestService;
  } else {
    application.service.push(serviceConfig as unknown as ManifestService);
  }

  console.log('✓ Added BackgroundSyncForegroundService to AndroidManifest');

  return androidManifest;
}

/**
 * Plugin to add Background Sync service to AndroidManifest
 */
const withBackgroundSyncService: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    config.modResults = addBackgroundSyncService(config.modResults);
    return config;
  });
};

export default createRunOncePlugin(withBackgroundSyncService, 'withBackgroundSyncService', '1.0.0');
