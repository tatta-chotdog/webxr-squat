export class ControllerManager {
  constructor(renderer) {
    this.renderer = renderer;
    this.wasPressed = false;
  }

  pressedTrigger() {
    if (this.renderer.xr.isPresenting) {
      const session = this.renderer.xr.getSession();
      const inputSources = session.inputSources;
      const rightInputSource = Array.from(inputSources).find(
        (inputSource) => inputSource.handedness === "right"
      );
      if (rightInputSource && rightInputSource.gamepad) {
        const gamepad = rightInputSource.gamepad;
        const trigger = gamepad.buttons[0];
        if (trigger) {
          const isPressed = trigger.pressed;
          if (isPressed && !this.wasPressed) {
            return true;
          }
          this.wasPressed = isPressed;
        }
      }
    }
    return false;
  }
}
