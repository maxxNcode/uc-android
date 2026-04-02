"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("expo/config-plugins");
/**
 * Adds Background Sync foreground service and required permissions to AndroidManifest.xml
 */
function addBackgroundSyncService(androidManifest) {
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
            });
            console.log(`✓ Added permission: ${perm}`);
        }
    }
    // Add the foreground service to the application
    const application = manifest.application[0];
    if (!application.service) {
        application.service = [];
    }
    const serviceName = 'expo.modules.backgroundsync.BackgroundSyncForegroundService';
    const existingIndex = application.service.findIndex((s) => s.$?.['android:name'] === serviceName);
    const serviceConfig = {
        $: {
            'android:name': serviceName,
            'android:exported': 'false',
            'android:foregroundServiceType': 'dataSync',
        },
    };
    if (existingIndex >= 0) {
        application.service[existingIndex] = serviceConfig;
    }
    else {
        application.service.push(serviceConfig);
    }
    console.log('✓ Added BackgroundSyncForegroundService to AndroidManifest');
    return androidManifest;
}
/**
 * Plugin to add Background Sync service to AndroidManifest
 */
const withBackgroundSyncService = (config) => {
    return (0, config_plugins_1.withAndroidManifest)(config, (config) => {
        config.modResults = addBackgroundSyncService(config.modResults);
        return config;
    });
};
exports.default = (0, config_plugins_1.createRunOncePlugin)(withBackgroundSyncService, 'withBackgroundSyncService', '1.0.0');
