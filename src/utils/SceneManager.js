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
    const ambientLight = new THREE.AmbientLight(0xffffff, 8);
    ambientLight.color.setHex(0xcccccc);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
    directionalLight.position.set(-5, 10, 3);
    directionalLight.castShadow = true;

    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 20;
    directionalLight.shadow.radius = 3;

    this.scene.add(directionalLight);
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
