package expo.modules.backgroundsync

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

class BackgroundSyncForegroundService : Service() {

    companion object {
        const val ACTION_START = "expo.modules.backgroundsync.ACTION_START"
        const val ACTION_STOP = "expo.modules.backgroundsync.ACTION_STOP"
        const val ACTION_UPDATE = "expo.modules.backgroundsync.ACTION_UPDATE"
        const val EXTRA_TITLE = "extra_title"
        const val EXTRA_TEXT = "extra_text"

        private const val CHANNEL_ID = "background_sync_channel"
        private const val NOTIFICATION_ID = 9527

        @Volatile
        var isRunning: Boolean = false
            private set
    }

    private var notificationTitle = "后台同步"
    private var notificationText = "正在同步剪贴板..."

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                notificationTitle = intent.getStringExtra(EXTRA_TITLE) ?: notificationTitle
                notificationText = intent.getStringExtra(EXTRA_TEXT) ?: notificationText
                startForeground()
                isRunning = true
            }
            ACTION_STOP -> {
                stopSelf()
            }
            ACTION_UPDATE -> {
                val title = intent.getStringExtra(EXTRA_TITLE)
                val text = intent.getStringExtra(EXTRA_TEXT)
                if (title != null) notificationTitle = title
                if (text != null) notificationText = text
                updateNotification()
            }
        }
        return START_STICKY
    }

    override fun onDestroy() {
        isRunning = false
        super.onDestroy()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "后台同步",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "剪贴板后台同步服务通知"
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        // Create a PendingIntent to open the app when tapping the notification
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED)
        }
        val pendingIntent = if (launchIntent != null) {
            PendingIntent.getActivity(
                this, 0, launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
        } else null

        // Create a stop action
        val stopIntent = Intent(this, BackgroundSyncForegroundService::class.java).apply {
            action = ACTION_STOP
        }
        val stopPendingIntent = PendingIntent.getService(
            this, 1, stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val appIcon = applicationInfo.icon

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(appIcon)
            .setContentTitle(notificationTitle)
            .setContentText(notificationText)
            .setOngoing(true)
            .setSilent(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setContentIntent(pendingIntent)
            .addAction(0, "停止同步", stopPendingIntent)
            .build()
    }

    private fun startForeground() {
        val notification = buildNotification()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    private fun updateNotification() {
        val manager = getSystemService(NotificationManager::class.java)
        manager?.notify(NOTIFICATION_ID, buildNotification())
    }
}
