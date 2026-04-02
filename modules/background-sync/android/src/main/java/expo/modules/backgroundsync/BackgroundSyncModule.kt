package expo.modules.backgroundsync

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class BackgroundSyncModule : Module() {

    companion object {
        private const val DEBUG_CHANNEL_ID = "debug_notification_channel"
        private const val DEBUG_NOTIFICATION_ID = 9528
        private var debugChannelCreated = false
    }

    override fun definition() = ModuleDefinition {
        Name("BackgroundSyncModule")

        Function("startForegroundService") { title: String, text: String ->
            appContext.reactContext?.let { context ->
                val intent = Intent(context, BackgroundSyncForegroundService::class.java).apply {
                    action = BackgroundSyncForegroundService.ACTION_START
                    putExtra(BackgroundSyncForegroundService.EXTRA_TITLE, title)
                    putExtra(BackgroundSyncForegroundService.EXTRA_TEXT, text)
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(intent)
                } else {
                    context.startService(intent)
                }
            }
        }

        Function("stopForegroundService") {
            appContext.reactContext?.let { context ->
                val intent = Intent(context, BackgroundSyncForegroundService::class.java).apply {
                    action = BackgroundSyncForegroundService.ACTION_STOP
                }
                context.startService(intent)
            }
        }

        Function("isServiceRunning") {
            BackgroundSyncForegroundService.isRunning
        }

        Function("updateNotification") { title: String, text: String ->
            appContext.reactContext?.let { context ->
                val intent = Intent(context, BackgroundSyncForegroundService::class.java).apply {
                    action = BackgroundSyncForegroundService.ACTION_UPDATE
                    putExtra(BackgroundSyncForegroundService.EXTRA_TITLE, title)
                    putExtra(BackgroundSyncForegroundService.EXTRA_TEXT, text)
                }
                context.startService(intent)
            }
        }

        Function("showDebugNotification") { title: String, text: String ->
            appContext.reactContext?.let { context ->
                ensureDebugChannel(context)
                val appIcon = context.applicationInfo.icon
                val notification = NotificationCompat.Builder(context, DEBUG_CHANNEL_ID)
                    .setSmallIcon(appIcon)
                    .setContentTitle(title)
                    .setContentText(text)
                    .setStyle(NotificationCompat.BigTextStyle().bigText(text))
                    .setSilent(true)
                    .setPriority(NotificationCompat.PRIORITY_LOW)
                    .setOngoing(false)
                    .build()
                val manager = context.getSystemService(NotificationManager::class.java)
                manager?.notify(DEBUG_NOTIFICATION_ID, notification)
            }
        }

        Function("dismissDebugNotification") {
            appContext.reactContext?.let { context ->
                val manager = context.getSystemService(NotificationManager::class.java)
                manager?.cancel(DEBUG_NOTIFICATION_ID)
            }
        }

    }

    private fun ensureDebugChannel(context: android.content.Context) {
        if (debugChannelCreated) return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                DEBUG_CHANNEL_ID,
                "调试通知",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "后台同步调试信息"
                setShowBadge(false)
            }
            val manager = context.getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
        debugChannelCreated = true
    }
}
