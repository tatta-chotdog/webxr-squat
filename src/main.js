import { AnimationMixer } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { Text } from "troika-three-text";
import { Status } from "./constants/Status.js";
import { TextColor } from "./constants/TextColor.js";
import { SceneManager } from "./utils/SceneManager.js";
import { ControllerManager } from "./utils/ControllerManager.js";

let sceneManager, controllerManager;
let baseHeight,
  textMesh,
  secondTextMesh,
  xrReferenceSpace,
  model,
  mixer,
  action,
  audio,
  firstPhrase,
  finalPhrase,
  animations;
let count = 0;
let second = 0;
let lastDurationUpdate = 0;
let status = Status.READY;
let audioPlaying = false;
let squatInProgress = false;
let textSize = 0.2;
const textOriginSize = 0.2;
const squatThreshold = -0.4;

const init = () => {
  // Scene
  sceneManager = new SceneManager();
  sceneManager.initAR();

  // Text
  textMesh = initText(textMesh, "", 0.5);
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
    second = Math.floor(audio.duration) - 2;
    secondTextMesh = initText(secondTextMesh, "", 0);
    sceneManager.scene.add(secondTextMesh);
  });

  animate();
};

const initModel = () => {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.load(
    "/models/hmdMan.glb",
    (gltf) => {
      // After loading the model
      init();
      model = gltf.scene;
      model.visible = false;
      model.scale.set(0.35, 0.35, 0.35);
      model.position.set(0, -2, -3);
      model.traverse((node) => {
        if (node.isMesh) {
          node.material.opacity = 1.0;
          node.material.transparent = false;
          node.material.depthWrite = true;
        }
      });
      mixer = new AnimationMixer(model);
      if (gltf.animations.length > 0) {
        animations = gltf.animations;
      }
      sceneManager.scene.add(model);
    },
    (_progress) => {
      // console.log("Loading the glb model:", _progress);
    },
    (error) => {
      console.error("Failed to load the glb model:", error);
    }
  );
};

const initText = (mesh, text, y) => {
  mesh = new Text();
  mesh.text = text;
  mesh.fontSize = textSize;
  mesh.color = TextColor.white;
  mesh.position.set(0, y, -2);
  mesh.anchorX = "center";
  mesh.anchorY = "middle";
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
          updateStatus(firstPhrase, Status.READY, Status.SQUATTING, 1);
          break;
        case Status.SQUATTING:
          updateStatus(audio, Status.SQUATTING, Status.FINISHED, 0);
          updateText(textMesh, TextColor.white, `COUNT: ${count}`);
          countSquat(viewerPose);
          break;
        case Status.FINISHED:
          updateStatus(finalPhrase, Status.FINISHED, null, 2);
          updateText(secondTextMesh, TextColor.red, "");
          break;
      }
    }
  }
  sceneManager.renderer.render(sceneManager.scene, sceneManager.camera);
};

const updateStatus = (audio, currentStatus, newStatus, nextAction) => {
  if (audio && audio.paused && !audioPlaying && status === currentStatus) {
    audio.play();
    audioPlaying = true;
    updateAction(nextAction);
  }
  if (audio.paused && audioPlaying && status === currentStatus && newStatus) {
    audioPlaying = false;
    status = newStatus;
  }
};

const countSquat = (viewerPose) => {
  updateSecond();

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
    updateText(textMesh, TextColor.red, `COUNT: ${count}`);
  } else if (squatInProgress && Math.abs(deltaHeight) < 0.05) {
    count++;
    squatInProgress = false;
    updateText(textMesh, TextColor.white, `COUNT: ${count}`);
  }
};

const updateSecond = () => {
  const now = performance.now();
  if (lastDurationUpdate === 0) {
    lastDurationUpdate = now;
  }
  if (now - lastDurationUpdate >= 1000) {
    second--;
    lastDurationUpdate = now;
    if (second < 6) {
      textSize = textOriginSize;
      updateText(secondTextMesh, TextColor.yellow, `${second}`);
    }
  }
  if (second < 6) {
    textSize += 0.007;
    secondTextMesh.fontSize = textSize;
    secondTextMesh.sync();
  }
  if (second < 0) {
    secondTextMesh.visible = false;
    secondTextMesh.sync();
  }
};

const updateText = (mesh, color, text) => {
  mesh.color = color;
  mesh.text = text;
  mesh.sync();
};

const updateAction = (nextAction) => {
  if (status === Status.READY) {
    action = mixer.clipAction(animations[nextAction]).play();
  } else {
    const previousAction = action;
    action = mixer.clipAction(animations[nextAction]);
    previousAction.fadeOut(0.5);
    action.reset().fadeIn(0.5).play();
  }
};

const resetHeight = (currentHeight) => {
  updateText(textMesh, TextColor.yellow, `COUNT: ${count}`);
  setTimeout(() => {
    updateText(textMesh, TextColor.white, `COUNT: ${count}`);
  }, 1000);
  baseHeight = currentHeight;
};

const animate = () => {
  sceneManager.renderer.setAnimationLoop(render);
};

initModel();
