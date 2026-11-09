package expo.modules.screensecurity

import android.app.Activity
import android.os.Build
import android.provider.Settings
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import expo.modules.kotlin.Promise
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.concurrent.atomic.AtomicBoolean

class ScreenSecurityModule : Module() {
  private var screenCaptureCallback: Activity.ScreenCaptureCallback? = null

  override fun definition() = ModuleDefinition {
    Name("ScreenSecurity")

    Events("onScreenshotTaken")

    Function("getDeviceId") {
      val resolver = appContext.reactContext?.contentResolver
      if (resolver == null) {
        "unknown-device"
      } else {
        Settings.Secure.getString(resolver, Settings.Secure.ANDROID_ID) ?: "unknown-device"
      }
    }

    AsyncFunction("isBiometricAuthenticated") { promise: Promise ->
      authenticate(promise)
    }.runOnQueue(Queues.MAIN)

    OnStartObserving {
      registerScreenshotCallback()
    }

    OnStopObserving {
      unregisterScreenshotCallback()
    }
  }

  private fun authenticate(promise: Promise) {
    val activity = appContext.currentActivity as? FragmentActivity
    if (activity == null) {
      promise.reject("BIOMETRICS_UNAVAILABLE", "Biometric authentication is unavailable", null)
      return
    }

    val authenticators = BiometricManager.Authenticators.BIOMETRIC_STRONG
    val canAuthenticate = BiometricManager.from(activity).canAuthenticate(authenticators)
    if (canAuthenticate == BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED) {
      promise.reject("BIOMETRICS_NOT_ENROLLED", "Biometrics are not set up on this device", null)
      return
    }
    if (canAuthenticate != BiometricManager.BIOMETRIC_SUCCESS) {
      promise.reject("BIOMETRICS_UNAVAILABLE", "Biometric authentication is unavailable", null)
      return
    }

    val settled = AtomicBoolean(false)
    val executor = ContextCompat.getMainExecutor(activity)
    val prompt = BiometricPrompt(
      activity,
      executor,
      object : BiometricPrompt.AuthenticationCallback() {
        override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
          if (settled.compareAndSet(false, true)) {
            promise.resolve(true)
          }
        }

        override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
          if (!settled.compareAndSet(false, true)) {
            return
          }
          if (
            errorCode == BiometricPrompt.ERROR_NO_BIOMETRICS ||
            errorCode == BiometricPrompt.ERROR_NO_DEVICE_CREDENTIAL
          ) {
            promise.reject("BIOMETRICS_NOT_ENROLLED", "Biometrics are not set up on this device", null)
          } else {
            promise.resolve(false)
          }
        }
      },
    )

    val info = BiometricPrompt.PromptInfo.Builder()
      .setTitle("Confirm payout")
      .setSubtitle("Authenticate to send this payout")
      .setNegativeButtonText("Cancel")
      .setAllowedAuthenticators(authenticators)
      .build()

    prompt.authenticate(info)
  }

  private fun registerScreenshotCallback() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      return
    }

    val activity = appContext.currentActivity ?: return
    unregisterScreenshotCallback()

    val callback = Activity.ScreenCaptureCallback {
      sendEvent("onScreenshotTaken")
    }
    screenCaptureCallback = callback

    try {
      activity.registerScreenCaptureCallback(ContextCompat.getMainExecutor(activity), callback)
    } catch (_: IllegalStateException) {
      screenCaptureCallback = null
    }
  }

  private fun unregisterScreenshotCallback() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      screenCaptureCallback = null
      return
    }

    val activity = appContext.currentActivity
    val callback = screenCaptureCallback
    screenCaptureCallback = null
    if (activity == null || callback == null) {
      return
    }

    try {
      activity.unregisterScreenCaptureCallback(callback)
    } catch (_: IllegalStateException) {
      // The activity may already have stopped. There is nothing further to release.
    }
  }
}
