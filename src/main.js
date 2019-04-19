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


var texture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/minecraft/atlas.png' );
texture.magFilter = THREE.NearestFilter;
var material = new THREE.MeshBasicMaterial({map: texture});


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


  // Lights!
  var ambientLight = new THREE.AmbientLight( 0xcccccc );
  scene.add(ambientLight);

  // For mouse movement tracking
  raycaster = new THREE.Raycaster();
  document.addEventListener('mousedown', onDocumentMouseDown, false);
  window.addEventListener('keydown', onKeyDown, false);
  window.addEventListener('keyup', onKeyUp, false);
  window.addEventListener('resize', onWindowResize, false);
}

// load a resource
loader.load(
	// resource URL
	'./Bigmax_White_OBJ.obj',
	// called when resource is loaded
	function ( object ) {

		scene.add( object );

	},
	// called when loading is in progresses
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened' );

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
