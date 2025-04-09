# WebXR Squat
### Let's do squats together!

<br>

This application calculates whether you are squatting based on the current height of your HMD.<br>
Press the trigger on the right controller to reset the neutral position.

<br>

> **Note:** This experience includes background music. Please enjoy the music I created.

https://github.com/user-attachments/assets/bc1ccda9-39af-4477-93ab-2a69ff46f43b

<br>

## How to run it on your HMD?
### 1. Try it on Vercel  
The project is deployed on Vercel. You can access it directly via the following link:  

👉 **[Live Demo](https://webxr-squat.vercel.app/)**  

<br>

### 2. Run it Locally
1. Please use the model I created on [Womp](https://beta.womp.com/community?sortBy=newest&preview=1303177#discover_filter_container).

![image](https://github.com/user-attachments/assets/439a4088-64c6-4a35-861b-be4867cc7f1b)

2. Add rigging, animations, and export the model using [Mixamo](https://www.mixamo.com/#/) (Air Squat Bent Arms, Yelling, Waving).
3. Use [Blender](https://www.blender.jp/)'s NLA editor to apply multiple animations to the model.

![image](https://github.com/user-attachments/assets/0e8daf91-eb6a-4b05-8292-d12cb7edc828)

4. Compress the model and export it as a GLB file, then place it under `public/models` (the code references it as `hmdMan.glb`).
5. Run the following command.

```
yarn
yarn dev
```

6.  Open the following link in a browser that supports WebXR on an HMD.(Replace "?" with the IP address)

`https://???.???.?.?:8081/`

## Learn more about WebXR

https://immersiveweb.dev/

https://immersive-web.github.io/webxr/explainer.html

https://developers.meta.com/horizon/documentation/web/webxr-overview

https://developers.meta.com/horizon/develop/web
