import ExpoModulesCore
import LocalAuthentication
import UIKit

public class ScreenSecurityModule: Module {
  private var screenshotObserver: NSObjectProtocol?

  public func definition() -> ModuleDefinition {
    Name("ScreenSecurity")

    Events("onScreenshotTaken")

    Function("getDeviceId") { () -> String in
      UIDevice.current.identifierForVendor?.uuidString ?? "unknown-device"
    }

    AsyncFunction("isBiometricAuthenticated") { (promise: Promise) in
      self.authenticate(promise: promise)
    }
    .runOnQueue(.main)

    OnStartObserving {
      self.startScreenshotObserver()
    }

    OnStopObserving {
      self.stopScreenshotObserver()
    }
  }

  private func authenticate(promise: Promise) {
    let context = LAContext()
    context.localizedCancelTitle = "Cancel"
    context.localizedFallbackTitle = ""

    var nsError: NSError?
    let canEvaluate = context.canEvaluatePolicy(
      .deviceOwnerAuthenticationWithBiometrics,
      error: &nsError
    )

    if !canEvaluate {
      if nsError?.domain == LAError.errorDomain && nsError?.code == LAError.biometryNotEnrolled.rawValue {
        promise.reject("BIOMETRICS_NOT_ENROLLED", "Biometrics are not set up on this device")
      } else {
        promise.reject("BIOMETRICS_UNAVAILABLE", "Biometric authentication is unavailable")
      }
      return
    }

    context.evaluatePolicy(
      .deviceOwnerAuthenticationWithBiometrics,
      localizedReason: "Authenticate to send this payout"
    ) { success, _ in
      promise.resolve(success)
    }
  }

  private func startScreenshotObserver() {
    guard screenshotObserver == nil else {
      return
    }

    screenshotObserver = NotificationCenter.default.addObserver(
      forName: UIApplication.userDidTakeScreenshotNotification,
      object: nil,
      queue: .main
    ) { [weak self] _ in
      self?.sendEvent("onScreenshotTaken")
    }
  }

  private func stopScreenshotObserver() {
    if let screenshotObserver {
      NotificationCenter.default.removeObserver(screenshotObserver)
    }
    screenshotObserver = nil
  }
}
