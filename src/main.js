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
var mouse = new THREE.Vector2(),INTERSECTED;
var loader = new THREE.OBJLoader();
var mapLayers = new Map();
var mapOffsets = new Map();
var gui;

// Info from OBJ
var objVertices = [];
var objMin, objMax, objSize;
raycaster = new THREE.Raycaster();
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
  camera.position.set(10, 10, 10);
  controls = new THREE.OrbitControls(camera); // Move through scene with mouse and arrow keys
  controls.update();
  controls.enablePan = true;
  controls.enableZoom = true;
  controls.keyPanSpeed = 15.0;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xc5ecf9);
  scene.add(new THREE.AxesHelper(20));

  // Lights!
  var ambientLight = new THREE.AmbientLight( 0xcccccc );
  scene.add(ambientLight);

  var directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(20, 25, -15);
  scene.add(directionalLight);


  document.addEventListener('mousedown', onDocumentMouseDown, false);
  window.addEventListener('keydown', onKeyDown, false);
  window.addEventListener('keyup', onKeyUp, false);
  window.addEventListener('resize', onWindowResize, false);
}

// Load a resource- from three.js docs
loader.load(
	// Resource URL
  // 'https://raw.githubusercontent.com/catyang97/lego-project/master/src/baymax.obj',
  'https://raw.githubusercontent.com/catyang97/566-final-project/master/src/assets/wahoo.obj',
	// Called when resource is loaded
	function (object) {
    var box = new THREE.Box3().setFromObject(object);
    objMin = box.min,
    objMax = box.max,
    objSize = box.getSize();
    // Add all vertices of the obj to objVertices
    object.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        // scene.add(child);

        // Start from bottom to top- y values
        var startY = Math.floor(objMin.y);
        var endY = Math.ceil(objMax.y);
        var rem = ((objMax.x-objMin.x)/2.0)%1;
        rem = 0;
        for (var i = startY; i < endY; i++) {
          // Create 2D array


          var startX = Math.floor(objMin.x);
          var endX = Math.ceil(objMax.x);
          var startZ = Math.floor(objMin.z);
          var endZ = Math.ceil(objMax.z);
          for (var j = startX; j < endX; j++) {
            var start, end;
            var yes = false;
            // Shoot ray from front
            raycaster.set(new THREE.Vector3(j+rem, i+0.5, endZ+5), new THREE.Vector3(0, 0, -1));
            var intersects = raycaster.intersectObject(child);
            if (intersects.length > 1 && j == 4) { 
              for (var hello = 0; hello < intersects.length; hello++) {
                                var cube = new THREE.Mesh(geometry, material);
                cube.position.set(intersects[hello].point.x, intersects[hello].point.y, intersects[hello].point.z);
                // scene.add(cube);
              }
              console.log(intersects);}
            if (intersects.length === 0) {
              // empty??
              yes = false;
            } else {
              yes = true;
              var points = intersects[0].point;
              end = points;
            }

            // Shoot ray from back
            raycaster.set(new THREE.Vector3(j+rem, i+0.5, startZ-5), new THREE.Vector3(0, 0, 1));
            var intersects = raycaster.intersectObject(child);
            if (intersects.length > 1 && j == 4) {               for (var hello = 0; hello < intersects.length; hello++) {
              var cube = new THREE.Mesh(geometry, material);
cube.position.set(intersects[hello].point.x, intersects[hello].point.y, intersects[hello].point.z);
// scene.add(cube);
}console.log(intersects);}

            if (intersects.length === 0) {
              // empty??
              yes = false;
            } else {
              if (yes) {
                yes = true;
              }
              var points = intersects[0].point;
              start = points;
            }
            if (yes) {
              // This adds the 1by1 blocks
              for (var k = Math.ceil(start.z); k < Math.ceil(end.z); k++) {
                var cube = new THREE.Mesh(geometry, material);
                cube.position.set(j+rem, i, k);
                scene.add(cube);
              }
              
              // Save info
              // x = j+rem, y = k, z = Math.ceil(start.z to Math.ceil(end.z)
            }
          }
        }

        // var objPos = child.geometry.attributes.position;
        // for (var i = 0; i < objPos.count; i++) {
        //   var vector = new THREE.Vector3();
        //   vector.fromBufferAttribute(objPos, i);
        //   objVertices.push(vector);
        // }
      }
    });
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
