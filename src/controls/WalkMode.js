import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

/**
 * WalkMode: chế độ người nhìn thứ nhất (FPS).
 * - WASD / phím mũi tên để đi, Shift để chạy.
 * - Va chạm đơn giản bằng raycast theo từng trục, trượt dọc tường.
 * - Giữ chiều cao mắt trên mặt sàn của tầng hiện tại.
 */
export class WalkMode {
  /**
   * @param {THREE.Camera} camera
   * @param {HTMLElement} domElement
   * @param {{colliders: THREE.Object3D[]}} world
   */
  constructor(camera, domElement, world) {
    this.camera = camera;
    this.world = world;
    this.controls = new PointerLockControls(camera, domElement);

    this.eyeHeight = 1.65;
    this.speed = 3.0;         // m/s
    this.runMultiplier = 2.0;
    this.radius = 0.3;        // bán kính va chạm của người

    this.keys = {};
    this.active = false;

    this._raycaster = new THREE.Raycaster();
    this._forward = new THREE.Vector3();
    this._right = new THREE.Vector3();
    this._input = new THREE.Vector3();

    this._onKeyDown = (e) => (this.keys[e.code] = true);
    this._onKeyUp = (e) => (this.keys[e.code] = false);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  enter(groundY = 0) {
    this.active = true;
    this.camera.position.y = groundY + this.eyeHeight;
    this.controls.lock();
  }

  exit() {
    this.active = false;
    this.controls.unlock();
  }

  /** Gọi mỗi khung hình. dt tính bằng giây. */
  update(dt, groundY) {
    if (!this.active || !this.controls.isLocked) return;

    const sprint = this.keys.ShiftLeft || this.keys.ShiftRight ? this.runMultiplier : 1;
    const move = this.speed * sprint * dt;

    // Hướng đi theo camera, bỏ thành phần thẳng đứng
    this.camera.getWorldDirection(this._forward);
    this._forward.y = 0;
    if (this._forward.lengthSq() === 0) return;
    this._forward.normalize();
    this._right.crossVectors(this._forward, this.camera.up).normalize();

    this._input.set(0, 0, 0);
    if (this.keys.KeyW || this.keys.ArrowUp) this._input.add(this._forward);
    if (this.keys.KeyS || this.keys.ArrowDown) this._input.sub(this._forward);
    if (this.keys.KeyA || this.keys.ArrowLeft) this._input.sub(this._right);
    if (this.keys.KeyD || this.keys.ArrowRight) this._input.add(this._right);

    if (this._input.lengthSq() > 0) {
      this._input.normalize().multiplyScalar(move);
      // Di chuyển theo từng trục để trượt dọc tường
      this._moveAxis(new THREE.Vector3(this._input.x, 0, 0));
      this._moveAxis(new THREE.Vector3(0, 0, this._input.z));
    }

    // Giữ chiều cao mắt trên mặt sàn tầng hiện tại
    this.camera.position.y = groundY + this.eyeHeight;
  }

  _moveAxis(step) {
    const len = step.length();
    if (len === 0) return;
    const dir = step.clone().normalize();

    this._raycaster.set(this.camera.position, dir);
    this._raycaster.far = len + this.radius;
    const hits = this._raycaster.intersectObjects(this.world.colliders, true);

    if (hits.length === 0 || hits[0].distance > len + this.radius) {
      this.camera.position.add(step);
    }
  }
}
