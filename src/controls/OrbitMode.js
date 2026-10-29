import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * OrbitMode: quay quanh tâm công trình, phóng to/thu nhỏ bằng chuột.
 */
export class OrbitMode {
  constructor(camera, domElement) {
    this.controls = new OrbitControls(camera, domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 600;
    this.controls.maxPolarAngle = Math.PI * 0.495; // không xuống dưới mặt đất
    this.enabled = false;
  }

  enter(target) {
    this.enabled = true;
    this.controls.enabled = true;
    this.controls.target.copy(target);
    this.controls.update();
  }

  exit() {
    this.enabled = false;
    this.controls.enabled = false;
  }

  update() {
    if (this.enabled) this.controls.update();
  }
}
