import { AnimationMixer } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Text } from "troika-three-text";
import { Status } from "./constants/Status.js";
import { SceneManager } from "./utils/SceneManager.js";
import { ControllerManager } from "./utils/ControllerManager.js";

let sceneManager, controllerManager;
let baseHeight,
  textMesh,
  durationTextMesh,
  xrReferenceSpace,
  model,
  mixer,
  action,
  audio,
  firstPhrase,
  finalPhrase,
  animations;
let count = 0;
let duration = 0;
let lastDurationUpdate = 0;
let status = Status.READY;
let audioPlaying = false;
let squatInProgress = false;
const squatThreshold = -0.4;
const actions = [2, 0, 1];

const init = () => {
  // Scene
  sceneManager = new SceneManager();
  sceneManager.initAR();

  // Text
  textMesh = setUpText(textMesh, "", 0.5);
  sceneManager.scene.add(textMesh);

  // Controller
  controllerManager = new ControllerManager(sceneManager.renderer);

  // Audio
  audio = new Audio("/audio/letsSquat.wav");
  firstPhrase = new Audio("/audio/firstPhrase.mp3");
  finalPhrase = new Audio("/audio/finalPhrase.mp3");

  audio.loop = false;
  firstPhrase.loop = false;
  finalPhrase.loop = false;

  audio.addEventListener("loadedmetadata", () => {
    duration = Math.floor(audio.duration);
    durationTextMesh = setUpText(durationTextMesh, "", 0.1);
    sceneManager.scene.add(durationTextMesh);
  });

  // Model
  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    "/models/squatMan.glb",
    (gltf) => {
      model = gltf.scene;
      model.visible = false;
      model.scale.set(1.3, 1.3, 1.3);
      model.position.set(0, -1.8, -3);
      mixer = new AnimationMixer(model);
      if (gltf.animations.length > 0) {
        animations = gltf.animations;
        action = mixer.clipAction(animations[2]);
      }
      sceneManager.scene.add(model);
    },
    (_progress) => {
      // console.log("GLBモデルの読み込み中:", _progress);
    },
    (error) => {
      console.error("GLBモデルの読み込みに失敗しました:", error);
    }
  );
};

const setUpText = (mesh, text, y) => {
  mesh = new Text();
  mesh.text = text;
  mesh.fontSize = 0.2;
  mesh.color = 0xff0000;
  mesh.position.set(0.5, y, -2);
  return mesh;
};

const render = (_timestamp, xrFrame) => {
  if (xrFrame) {
    if (!xrReferenceSpace) {
      xrReferenceSpace = sceneManager.renderer.xr.getReferenceSpace();
    }
    const viewerPose = xrFrame.getViewerPose(xrReferenceSpace);
    if (viewerPose) {
      model.visible = true;
      if (mixer) {
        mixer.update(1 / 60);
      }
      switch (status) {
        case Status.READY:
          changeStatus(firstPhrase, Status.READY, Status.SQUATTING, 1);
          break;
        case Status.SQUATTING:
          changeStatus(audio, Status.SQUATTING, Status.FINISHED, 2);
          countSquat(viewerPose);
          break;
        case Status.FINISHED:
          changeStatus(finalPhrase, Status.FINISHED, null, 3);
          break;
      }
    }
  }
  sceneManager.renderer.render(sceneManager.scene, sceneManager.camera);
};

const changeStatus = (audio, currentStatus, newStatus, nextAction) => {
  if (audio && audio.paused && !audioPlaying && status === currentStatus) {
    audio.play();
    audioPlaying = true;
    updateAction(actions[nextAction - 1]);
    updateText(textMesh, 0xff0000, `COUNT: ${count}`);
    updateText(durationTextMesh, 0xff0000, `${duration}`);
  }
  if (audio.paused && audioPlaying && status === currentStatus && newStatus) {
    audioPlaying = false;
    status = newStatus;
    updateAction(actions[nextAction]);
  }
};

const countSquat = (viewerPose) => {
  const now = performance.now();
  if (lastDurationUpdate === 0) {
    lastDurationUpdate = now;
  }
  if (now - lastDurationUpdate >= 1000) {
    if (duration > 0) {
      duration--;
    }
    updateText(durationTextMesh, 0xff0000, `${duration}`);
    lastDurationUpdate = now;
  }

  const currentHeight = viewerPose.views[0].transform.position.y;
  if (!baseHeight) {
    baseHeight = currentHeight;
  }

  if (controllerManager.pressedTrigger()) {
    resetHeight(currentHeight);
  }

  const deltaHeight = currentHeight - baseHeight;
  if (deltaHeight < squatThreshold) {
    squatInProgress = true;
    updateText(textMesh, 0x0000ff, `COUNT: ${count}`);
  } else if (squatInProgress && Math.abs(deltaHeight) < 0.05) {
    count++;
    squatInProgress = false;
    updateText(textMesh, 0xff0000, `COUNT: ${count}`);
  }
};

const updateText = (mesh, color, text) => {
  mesh.color = color;
  mesh.text = text;
  mesh.sync();
};

const updateAction = (nextAction) => {
  const previousAction = action;
  action = mixer.clipAction(animations[nextAction]);
  previousAction.fadeOut(0.5);
  action.reset().fadeIn(0.5).play();
};

const resetHeight = (currentHeight) => {
  updateText(textMesh, 0xffff00, `COUNT: ${count}`);
  setTimeout(() => {
    updateText(textMesh, 0xff0000, `COUNT: ${count}`);
  }, 1000);
  baseHeight = currentHeight;
};

const animate = () => {
  sceneManager.renderer.setAnimationLoop(render);
};

init();
animate();
