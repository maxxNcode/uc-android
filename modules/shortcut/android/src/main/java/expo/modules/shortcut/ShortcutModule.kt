package expo.modules.shortcut

import android.content.Intent
import android.content.pm.ShortcutInfo
import android.content.pm.ShortcutManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.drawable.Icon
import android.net.Uri
import android.os.Build
import androidx.core.content.res.ResourcesCompat
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ShortcutModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("ShortcutModule")

        AsyncFunction("requestPinShortcut") { 
            shortcutId: String, 
            label: String, 
            url: String, 
            iconResName: String, 
            bgColorHex: String,
            promise: Promise ->
            try {
                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
                    promise.reject(
                        UnsupportedError("Pinned shortcuts require Android 8.0 (API 26) or higher")
                    )
                    return@AsyncFunction
                }

                val reactContext = appContext.reactContext ?: run {
                    promise.reject(ReactContextMissingError())
                    return@AsyncFunction
                }

                val shortcutManager = reactContext.getSystemService(ShortcutManager::class.java)
                if (shortcutManager == null || !shortcutManager.isRequestPinShortcutSupported) {
                    promise.reject(
                        UnsupportedError("The current launcher does not support pinned shortcuts")
                    )
                    return@AsyncFunction
                }

                val launchIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                    setPackage(reactContext.packageName)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
                    addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
                }

                val icon = buildIcon(reactContext, iconResName, bgColorHex)

                val shortcutInfo = ShortcutInfo.Builder(reactContext, shortcutId)
                    .setShortLabel(label)
                    .setLongLabel(label)
                    .setIcon(icon)
                    .setIntent(launchIntent)
                    .build()

                shortcutManager.requestPinShortcut(shortcutInfo, null)
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject(CodedException("${e.javaClass.simpleName}: ${e.message}"))
            }
        }
    }

    private fun buildIcon(
        reactContext: android.content.Context,
        iconResName: String,
        bgColorHex: String
    ): Icon {
        val density = reactContext.resources.displayMetrics.density
        val size = (108 * density + 0.5f).toInt()

        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = try {
                Color.parseColor(bgColorHex)
            } catch (_: IllegalArgumentException) {
                Color.parseColor("#007AFF")
            }
        }
        val radius = size / 2f
        canvas.drawCircle(radius, radius, radius, bgPaint)

        val iconResId = reactContext.resources.getIdentifier(
            iconResName, "drawable", reactContext.packageName
        )
        if (iconResId != 0) {
            val drawable = ResourcesCompat.getDrawable(
                reactContext.resources, iconResId, null
            )
            drawable?.let {
                val pad = (size * 0.33f).toInt()
                it.setBounds(pad, pad, size - pad, size - pad)
                it.setTint(Color.WHITE)
                it.draw(canvas)
            }
        }

        return Icon.createWithAdaptiveBitmap(bitmap)
    }

    private class UnsupportedError(message: String) : CodedException(message)
    private class ReactContextMissingError : CodedException("React context is not available")
}
