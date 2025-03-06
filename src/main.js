import { Text } from "troika-three-text";
import { SceneManager } from "./utils/SceneManager.js";

let sceneManager, baseHeight, textMesh, xrReferenceSpace;
const jumpThreshold = 0.1;
const crouchThreshold = -0.4;

const init = () => {
  sceneManager = new SceneManager();
  sceneManager.initAR();
  textMesh = new Text();
  textMesh.text = "STAND UP";
  textMesh.fontSize = 0.2;
  textMesh.color = 0xff0000;
  textMesh.anchorX = "center";
  textMesh.anchorY = "middle";
  textMesh.position.set(0, 0, -2);
  sceneManager.scene.add(textMesh);
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
      if (currentHeight - baseHeight > jumpThreshold) {
        updateText(0x00ff00, "JUMP");
      } else if (currentHeight - baseHeight < crouchThreshold) {
        updateText(0x0000ff, "CROUCH");
      } else {
        updateText(0xff0000, "STAND UP");
      }
    }
  }
  sceneManager.renderer.render(sceneManager.scene, sceneManager.camera);
};

const updateText = (color, text) => {
  textMesh.color = color;
  textMesh.text = text;
  textMesh.sync();
};

const animate = () => {
  sceneManager.renderer.setAnimationLoop(render);
};

init();
animate();
