import * as THREE from 'three';

/**
 * Engine: khởi tạo renderer, scene, camera và vòng lặp render.
 * Các module khác đăng ký callback qua onUpdate().
 */
export class Engine {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1b1f27);
    this.scene.fog = new THREE.Fog(0x1b1f27, 200, 800);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    this.camera.position.set(30, 25, 30);

    this._updaters = new Set();
    this._clock = new THREE.Clock();

    window.addEventListener('resize', () => this._onResize());
    this._animate = this._animate.bind(this);
    requestAnimationFrame(this._animate);
  }

  /** Đăng ký hàm cập nhật mỗi khung hình. Trả về hàm hủy đăng ký. */
  onUpdate(fn) {
    this._updaters.add(fn);
    return () => this._updaters.delete(fn);
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  _animate() {
    requestAnimationFrame(this._animate);
    const dt = Math.min(this._clock.getDelta(), 0.05); // chống nhảy khi tab bị ẩn
    for (const fn of this._updaters) fn(dt);
    this.renderer.render(this.scene, this.camera);
  }
}
