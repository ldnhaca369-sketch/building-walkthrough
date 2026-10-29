import * as THREE from 'three';
import { OrbitMode } from './OrbitMode.js';
import { FlyMode } from './FlyMode.js';
import { WalkMode } from './WalkMode.js';
import { ElevatorMode } from './ElevatorMode.js';

/**
 * ControllerManager: điều phối chuyển chế độ điều khiển.
 * Chỉ một chế độ hoạt động tại một thời điểm.
 */
export class ControllerManager {
  constructor({ engine, building, domElement }) {
    this.engine = engine;
    this.building = building;
    const camera = engine.camera;

    this.modes = {
      orbit: new OrbitMode(camera, domElement),
      fly: new FlyMode(camera, domElement),
      walk: new WalkMode(camera, domElement, building),
    };
    this.elevator = new ElevatorMode(camera, building);
    this.current = null;
    this.currentFloor = building.meta.floors[0]?.id ?? null;

    engine.onUpdate((dt) => this._update(dt));
  }

  switchTo(name, { center } = {}) {
    if (this.current) this.modes[this.current].exit?.();

    this.current = name;
    const mode = this.modes[name];

    if (name === 'orbit') {
      mode.enter(center ?? this._buildingCenter());
    } else if (name === 'walk') {
      mode.enter(this.building.getFloorElevation(this.currentFloor));
    } else if (name === 'fly') {
      mode.enter();
    }
  }

  /** Chuyển sang tầng khác (nút chọn tầng). */
  goToFloor(floorId) {
    this.currentFloor = floorId;
    this.elevator.goToFloor(floorId, () => {
      if (this.current === 'walk') {
        this.modes.walk.enter(this.building.getFloorElevation(floorId));
      }
    });
  }

  /** Quay về nhìn toàn cảnh bên ngoài. */
  viewExterior() {
    this.building.showAll();
    this.switchTo('orbit');
  }

  _buildingCenter() {
    return this.building.getBounds().getCenter(new THREE.Vector3());
  }

  _update(dt) {
    this.elevator.update(dt);
    if (this.current === 'orbit') this.modes.orbit.update();
    if (this.current === 'fly') this.modes.fly.update(dt);
    if (this.current === 'walk') {
      this.modes.walk.update(dt, this.building.getFloorElevation(this.currentFloor));
    }
  }
}
