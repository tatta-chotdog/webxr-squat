import { Text } from "troika-three-text";
import { SceneManager } from "./utils/SceneManager.js";
import { ControllerManager } from "./utils/ControllerManager.js";

let sceneManager, controllerManager;
let baseHeight, textMesh, heightTextMesh, xrReferenceSpace;
const jumpThreshold = 0.1;
const crouchThreshold = -0.4;

const init = () => {
  sceneManager = new SceneManager();
  sceneManager.initAR();

  textMesh = setUpText(textMesh, "STAND UP", 0);
  heightTextMesh = setUpText(heightTextMesh, "", -0.5);

  sceneManager.scene.add(textMesh);
  sceneManager.scene.add(heightTextMesh);

  controllerManager = new ControllerManager(sceneManager.renderer);
};

const setUpText = (mesh, text, y) => {
  mesh = new Text();
  mesh.text = text;
  mesh.fontSize = 0.2;
  mesh.color = 0xff0000;
  mesh.anchorX = "center";
  mesh.anchorY = "middle";
  mesh.position.set(0, y, -2);
  return mesh;
};

const render = (_, xrFrame) => {
  if (xrFrame) {
    if (!xrReferenceSpace) {
      xrReferenceSpace = sceneManager.renderer.xr.getReferenceSpace();
    }
    const viewerPose = xrFrame.getViewerPose(xrReferenceSpace);
    if (viewerPose) {
      const currentHeight = viewerPose.views[0].transform.position.y;
      if (!baseHeight) {
        baseHeight = currentHeight;
      }
      if (controllerManager.pressedTrigger()) {
        updateText(heightTextMesh, 0xffff00, "RESET HEIGHT");
        setTimeout(() => {
          updateText(heightTextMesh, 0xff0000, "");
        }, 1000);
        baseHeight = currentHeight;
      }
      if (currentHeight - baseHeight > jumpThreshold) {
        updateText(textMesh, 0x00ff00, "JUMP");
      } else if (currentHeight - baseHeight < crouchThreshold) {
        updateText(textMesh, 0x0000ff, "CROUCH");
      } else {
        updateText(textMesh, 0xff0000, "STAND UP");
      }
    }
  }
  sceneManager.renderer.render(sceneManager.scene, sceneManager.camera);
};

const updateText = (mesh, color, text) => {
  mesh.color = color;
  mesh.text = text;
  mesh.sync();
};

const animate = () => {
  sceneManager.renderer.setAnimationLoop(render);
};

init();
animate();
