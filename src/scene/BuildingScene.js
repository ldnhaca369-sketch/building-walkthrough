import * as THREE from 'three';

/**
 * BuildingScene: nhận mô hình GLB, phân loại mesh theo tầng
 * dựa trên metadata và quản lý hiển thị từng tầng.
 *
 * Mesh trong GLB nên có tên bắt đầu bằng "L1_", "L2_",... để gán tầng.
 * Tên bắt đầu bằng tiền tố layer (A-WALL, A-DOOR...) để xác định loại.
 */
export class BuildingScene {
  constructor(scene, gltf, meta) {
    this.root = gltf.scene;
    this.meta = meta;
    this.floors = new Map(); // floorId -> THREE.Group
    this.walkables = [];     // mesh sàn
    this.colliders = [];     // mesh tường và cửa để chặn va chạm

    scene.add(this.root);
    this._classify();
  }

  _classify() {
    // Tạo group cho mỗi tầng
    for (const f of this.meta.floors) {
      const g = new THREE.Group();
      g.name = f.id;
      g.userData = { elevation: f.elevation, height: f.height, name: f.name };
      this.floors.set(f.id, g);
    }

    // Gán tầng và loại cho từng mesh
    const meshes = [];
    this.root.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.castShadow = true;
      obj.receiveShadow = true;

      const floorId = this._resolveFloorId(obj.name);
      const category = this._resolveCategory(obj.name);
      obj.userData.category = category;
      obj.userData.floorId = floorId;

      if (category === 'wall' || category === 'door') this.colliders.push(obj);
      if (category === 'floor') this.walkables.push(obj);
      meshes.push(obj);
    });

    // Gom mesh vào group tầng tương ứng (mesh không gán được -> giữ nguyên)
    for (const obj of meshes) {
      const group = this.floors.get(obj.userData.floorId);
      if (group) group.attach(obj);
    }
    for (const group of this.floors.values()) this.root.add(group);
  }

  _resolveFloorId(name = '') {
    const match = name.match(/^(L\d+)_/i);
    return match ? match[1].toUpperCase() : 'GLOBAL';
  }

  _resolveCategory(name = '') {
    const layers = this.meta.layers || {};
    const upper = name.toUpperCase();
    for (const [prefix, category] of Object.entries(layers)) {
      if (upper.startsWith(prefix)) return category;
    }
    return 'other';
  }

  /** Chỉ hiển thị một tầng (chế độ cắt tầng). */
  showFloor(floorId) {
    for (const [id, group] of this.floors) {
      group.visible = id === floorId;
    }
  }

  /** Hiển thị tất cả tầng. */
  showAll() {
    for (const group of this.floors.values()) group.visible = true;
  }

  getFloorElevation(floorId) {
    return this.floors.get(floorId)?.userData.elevation ?? 0;
  }

  /** Danh sách tầng để dựng UI chọn tầng. */
  listFloors() {
    return this.meta.floors.map((f) => ({ id: f.id, name: f.name, elevation: f.elevation }));
  }

  /** Bounding box toàn công trình. */
  getBounds() {
    return new THREE.Box3().setFromObject(this.root);
  }
}
