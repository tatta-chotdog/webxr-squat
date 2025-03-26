import * as THREE from "three";
import { ARButton } from "three/examples/jsm/Addons.js";

export class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      90,
      window.innerWidth / window.innerHeight,
      0.01,
      20
    );
    this._initRenderer();
    this._initLights();

    window.addEventListener("resize", this._onWindowResize.bind(this), false);
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.xr.enabled = true;
    document.body.appendChild(this.renderer.domElement);
  }

  _initLights() {
    const frontLight = new THREE.DirectionalLight(0xffffff, 3.0);
    frontLight.position.set(0, 1, 2);
    frontLight.castShadow = true;
    frontLight.shadow.radius = 3;
    this.scene.add(frontLight);

    const leftLight = new THREE.DirectionalLight(0xffffff, 1.8);
    leftLight.position.set(-1.5, 1, 0);
    this.scene.add(leftLight);

    const rightLight = new THREE.DirectionalLight(0xffffff, 1.8);
    rightLight.position.set(1.5, 1, 0);
    this.scene.add(rightLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 1.8);
    topLight.position.set(0, 2, 0);
    this.scene.add(topLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 1);
    backLight.position.set(0, 1, -2);
    this.scene.add(backLight);
  }

  initAR() {
    document.body.appendChild(ARButton.createButton(this.renderer));
  }

  _onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
