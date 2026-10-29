import * as THREE from 'three';
import './style.css';
import { Engine } from './core/Engine.js';
import { loadBuilding } from './core/Loader.js';
import { BuildingScene } from './scene/BuildingScene.js';
import { ControllerManager } from './controls/ControllerManager.js';

const canvas = document.getElementById('scene');
const engine = new Engine(canvas);

// Ánh sáng cơ bản
engine.scene.add(new THREE.HemisphereLight(0xffffff, 0x444466, 1.0));
const sun = new THREE.DirectionalLight(0xffffff, 1.5);
sun.position.set(50, 100, 30);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
engine.scene.add(sun);

// Mặt đất tham chiếu
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000),
  new THREE.MeshStandardMaterial({ color: 0x2a2f38 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
engine.scene.add(ground);

async function init() {
  const { gltf, meta } = await loadBuilding(
    '/models/building.glb',
    '/models/building.json'
  );

  const building = new BuildingScene(engine.scene, gltf, meta);
  const controllers = new ControllerManager({
    engine,
    building,
    domElement: canvas,
  });

  // Camera ban đầu nhìn toàn công trình
  const box = building.getBounds();
  const size = box.getSize(new THREE.Vector3()).length();
  engine.camera.position.set(
    box.max.x + size * 0.4,
    size * 0.4,
    box.max.z + size * 0.4
  );

  buildUI(building, controllers);
  controllers.switchTo('orbit');
}

function buildUI(building, controllers) {
  const hint = document.getElementById('hint');
  const crosshair = document.getElementById('crosshair');

  // Nút chế độ
  document.querySelectorAll('[data-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-mode]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.dataset.mode;
      if (mode === 'exterior') controllers.viewExterior();
      else controllers.switchTo(mode);

      crosshair.hidden = mode !== 'walk';
      hint.hidden = mode === 'orbit';
    });
  });

  // Nút chọn tầng
  const floorBox = document.getElementById('floors');
  for (const f of building.listFloors()) {
    const b = document.createElement('button');
    b.textContent = f.name;
    b.addEventListener('click', () => {
      controllers.goToFloor(f.id);
    });
    floorBox.appendChild(b);
  }
}

init().catch((err) => {
  console.error(err);
  document.getElementById('hint').textContent = 'Lỗi tải mô hình: ' + err.message;
});
