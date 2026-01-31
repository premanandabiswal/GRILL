import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { gsap } from "https://cdn.skypack.dev/gsap";

// Scene
const scene = new THREE.Scene();
scene.background = null;

// Camera
const camera = new THREE.PerspectiveCamera(
  10,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(8, -0.6, +8);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
document.getElementById("container3D").appendChild(renderer.domElement);

// Lights
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
scene.add(hemiLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);
scene.add(new THREE.AmbientLight(0xffffff, 1));
const topLight = new THREE.DirectionalLight(0xffffff, 1.2);
topLight.position.set(400, 400, 400);
scene.add(topLight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Load 3D model
let model, mixer;
const loader = new GLTFLoader();
loader.load(
  "assets/images/3d_ramen.glb",
  function (gltf) {
    model = gltf.scene;
    model.scale.set(7, 7, 7);
    model.position.set(1.7, -0.5, 0); // initial position
    scene.add(model);

    if (gltf.animations.length) {
      mixer = new THREE.AnimationMixer(model);
      mixer.clipAction(gltf.animations[0]).play();
    }

    initModelMovement(); // set scroll & click mapping
  }
);

// Clock
const clock = new THREE.Clock();

// Animate
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Dynamic Position Mapping ---
const arrPositionModel = [

  // Center (start)
  {
    id: "home",
    position: { x: 0.6, y: -0.5, z: 0 },
    rotation: { x: 0.2, y: 0, z: 0 }
  },

  // Right
  {
    id: "service",
    position: { x: 2.8, y: -1, z: 0 },
    rotation: { x: 0.5, y: 0.8, z: 0 }
  },

  // Left
  {
    id: "about",
    position: { x: -2.5, y: -0.1, z: 0 },
    rotation: { x: 0.4, y: -0.8, z: 0 }
  },

  // Right (more forward)
  {
    id: "menu",
    position: { x: 2.3, y: -0.6, z: 0 },
    rotation: { x: 0.5, y: 1.2, z: 0 }
  },

  // Left (more tilt)
  {
    id: "reservation",
    position: { x: -2.8, y: -1, z: 0 },
    rotation: { x: 0.6, y: -1.2, z: 0 }
  },

  // Right soft
  {
    id: "features",
    position: { x: 2, y: -0.8, z: 0 },
    rotation: { x: 0.3, y: 0.6, z: 0 }
  },

  // Center finish
  {
    id: "event",
    position: { x: -0.5, y: -0.6, z: 0 },
    rotation: { x: 0.2, y: Math.PI, z: 0 }
  }

];



function moveToId(id) {
  if (!model) return;
  const mapping = arrPositionModel.find(m => m.id === id);
  if (!mapping) return;

  gsap.to(model.position, {
    x: mapping.position.x,
    y: mapping.position.y,
    z: mapping.position.z,
    duration: 1.2,  
    ease: "power2.out"
  });

  gsap.to(model.rotation, {
    x: mapping.rotation.x,
    y: mapping.rotation.y,
    z: mapping.rotation.z,
    duration: 1.2,
    ease: "power2.out"
  });
}

function modelMove() {
  if (!model) return;
  let best = null;
  let bestDist = Infinity;

  arrPositionModel.forEach(mapping => {
    const el = document.getElementById(mapping.id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const elCenter = rect.top + rect.height / 2;
    const viewCenter = window.innerHeight / 2;
    const dist = Math.abs(elCenter - viewCenter);
    if (dist < bestDist) {
      bestDist = dist;
      best = mapping;
    }
  });

  if (best) moveToId(best.id);
}

function initModelMovement() {
  arrPositionModel.forEach(mapping => {
    const el = document.getElementById(mapping.id);
    if (el) {
      el.style.cursor = "pointer";
      el.addEventListener("click", () => moveToId(mapping.id));
    }
  });

  window.addEventListener("scroll", modelMove);
}

