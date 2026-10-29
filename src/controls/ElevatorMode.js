import * as THREE from 'three';

/**
 * ElevatorMode: di chuyển camera theo cao độ tầng với hiệu ứng tween mượt.
 */
export class ElevatorMode {
  constructor(camera, buildingScene, eyeHeight = 1.65) {
    this.camera = camera;
    this.building = buildingScene;
    this.eyeHeight = eyeHeight;
    this.duration = 1.2; // giây
    this._tween = null;
  }

  /** Di chuyển đến tầng chỉ định. */
  goToFloor(floorId, onDone) {
    const targetY = this.building.getFloorElevation(floorId) + this.eyeHeight;

    this._tween = {
      from: this.camera.position.y,
      to: targetY,
      t: 0,
      onDone,
    };

    this.building.showFloor(floorId);
  }

  update(dt) {
    if (!this._tween) return;

    const tw = this._tween;
    tw.t = Math.min(tw.t + dt / this.duration, 1);
    const eased = THREE.MathUtils.smootherstep(tw.t, 0, 1);
    this.camera.position.y = THREE.MathUtils.lerp(tw.from, tw.to, eased);

    if (tw.t >= 1) {
      this._tween = null;
      tw.onDone?.();
    }
  }

  get isMoving() {
    return this._tween !== null;
  }
}
