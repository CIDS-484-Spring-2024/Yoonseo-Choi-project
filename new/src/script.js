import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Loaders
const loader = new GLTFLoader();

// Load the map model
loader.load('map.glb', function(gltf) {
    scene.add(gltf.scene);
}, function(error) {
    console.error('An error happened while loading the map:', error);
});

// Load and setup the character model
let character;
loader.load('character.glb', function(gltf) {
    character = gltf.scene;
    character.scale.set(0.5, 0.5, 0.5);
    scene.add(character);
    camera.position.set(0, 1.6, 0);  // Camera setup for first person
    character.add(camera);  // Attach camera to character
}, function(error) {
    console.error('An error happened while loading the character:', error);
});

// Controls for third-person view
const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = false;  // Start with FPV enabled

// First-person view setup
let enableFPV = true;
document.addEventListener('mousemove', function(event) {
    if (enableFPV) {
        const lookSpeed = 0.002;
        character.rotation.y -= event.movementX * lookSpeed;
        camera.rotation.x -= event.movementY * lookSpeed;
        camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));  // Limit vertical look
    }
});

// Toggle view mode
document.addEventListener('keydown', function(event) {
    if (event.key === 't') {
        enableFPV = !enableFPV;
        if (enableFPV) {
            // First-person view
            character.add(camera);
            controls.enabled = false;
            camera.position.set(0, 1.6, 0); // Adjust for head height
        } else {
            // Third-person view
            character.remove(camera);
            controls.enabled = true;
            controls.target.copy(character.position);
            camera.position.set(character.position.x, character.position.y + 5, character.position.z - 10);
        }
    }
});

// Movement
document.addEventListener('keydown', function(event) {
    const speed = 0.5;
    switch(event.key) {
        case 'w': character.translateZ(-speed); break;
        case 's': character.translateZ(speed); break;
        case 'a': character.translateX(-speed); break;
        case 'd': character.translateX(speed); break;
    }
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    if (!enableFPV) {
        controls.update();  // Update camera controls in third-person view
    }
    renderer.render(scene, camera);
}
animate();


