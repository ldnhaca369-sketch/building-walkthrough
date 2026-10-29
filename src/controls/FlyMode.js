import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

/**
 * FlyMode: bay tự do theo hướng nhìn, không va chạm.
 * WASD để di chuyển, Q/E để lên/xuống, Shift để bay nhanh.
 */
export class FlyMode {
  constructor(camera, domElement) {
    this.camera = camera;
    this.speed = 12;
    this.keys = {};
    this.enabled = false;
    this.pointer = new PointerLockControls(camera, domElement);

    this._forward = new THREE.Vector3();
    this._right = new THREE.Vector3();

    window.addEventListener('keydown', (e) => (this.keys[e.code] = true));
    window.addEventListener('keyup', (e) => (this.keys[e.code] = false));
  }

  enter() {
    this.enabled = true;
    this.pointer.lock();
  }

  exit() {
    this.enabled = false;
    this.pointer.unlock();
  }

  update(dt) {
    if (!this.enabled || !this.pointer.isLocked) return;

    const boost = this.keys.ShiftLeft || this.keys.ShiftRight ? 3 : 1;
    const step = this.speed * boost * dt;

    this.camera.getWorldDirection(this._forward);
    this._right.crossVectors(this._forward, this.camera.up).normalize();

    if (this.keys.KeyW) this.camera.position.addScaledVector(this._forward, step);
    if (this.keys.KeyS) this.camera.position.addScaledVector(this._forward, -step);
    if (this.keys.KeyA) this.camera.position.addScaledVector(this._right, -step);
    if (this.keys.KeyD) this.camera.position.addScaledVector(this._right, step);
    if (this.keys.KeyE) this.camera.position.y += step;
    if (this.keys.KeyQ) this.camera.position.y -= step;
  }
}
