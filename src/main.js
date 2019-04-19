const THREE = require('three');
import Noise from './Noise';
var OrbitControls = require('./OrbitControls.js');
var Stats = require('./stats.min.js');
var dat = require('./dat.gui.min.js');
var OBJLoader = require('./OBJLoader.js');
// if ( WEBGL.isWebGLAvailable() === false ) {
//   document.body.appendChild( WEBGL.getWebGLErrorMessage() );
//   document.getElementById( 'container' ).innerHTML = "";
// }
var container, stats;
var camera, controls, scene, renderer, raycaster;
var worldWidth = 128, worldDepth = 128;
var mouse = new THREE.Vector2(),INTERSECTED;
var loader = new THREE.OBJLoader();

var gui;

// Info from OBJ
var objMin, objMax, objSize;

// var texture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/minecraft/atlas.png' );
// texture.magFilter = THREE.NearestFilter;
var material = new THREE.MeshLambertMaterial({color:0x0259df});
var geometry = new THREE.BoxBufferGeometry(1, 1, 1);

loadScene();
animate();


function loadScene() {
  // Set up sections of window- renderer and stats
  container = document.getElementById('container');
  container.innerHTML = "";
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  stats = new Stats();
  container.appendChild( stats.dom );
  container.appendChild(renderer.domElement);

  gui = new dat.GUI();


  // Set up camera, scene
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 20000);
  camera.position.set(-10, 10, -10);
  controls = new THREE.OrbitControls(camera); // Move through scene with mouse and arrow keys
  controls.update();
  controls.enablePan = true;
  controls.enableZoom = true;
  controls.keyPanSpeed = 15.0;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xc5ecf9);

  var cube = new THREE.Mesh(geometry, material);
  cube.position.set(0, 0, 0);
  scene.add(cube);

  // Lights!
  var ambientLight = new THREE.AmbientLight( 0xcccccc );
  scene.add(ambientLight);

  var directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(20, 25, -15);

  scene.add(directionalLight);

  // For mouse movement tracking
  raycaster = new THREE.Raycaster();
  document.addEventListener('mousedown', onDocumentMouseDown, false);
  window.addEventListener('keydown', onKeyDown, false);
  window.addEventListener('keyup', onKeyUp, false);
  window.addEventListener('resize', onWindowResize, false);
}

// Load a resource- fromm three.js docs
loader.load(
	// resource URL
	'https://raw.githubusercontent.com/catyang97/lego-project/master/src/Bigmax_White_OBJ.obj',
	// called when resource is loaded
	function (object) {
    object.traverse( function ( child ) {
      // console.log(object.children[0].children[0].geometry.vertices
        // );
      if ( child instanceof THREE.Mesh ) {
        console.log(child);
        //child.material.map = texture;

      }

    } );
    object.position.set(0,0,0);
    scene.add(object);
    var box = new THREE.Box3().setFromObject(object);
    objMin = box.min,
    objMax = box.max,
    objSize = box.getSize();
    console.log(loader.vertices);

	},
	// called when loading is in progresses
	function (xhr) {
		console.log((xhr.loaded / xhr.total * 100) + '% loaded');
	},
	// called when loading has errors
	function (error) {
		console.log('An error happened');
	}
);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  // controls.handleResize();
}

function animate() {
  requestAnimationFrame(animate);
  render();
  stats.update();
}

function render() {
  controls.update();
  renderer.render(scene, camera);
}
function onDocumentMouseDown(event) {
  
}

function handleKeyDown(event) {

}

function onKeyDown(event) {
  handleKeyDown(event);
}

function onKeyUp(event) {

}
