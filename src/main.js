const THREE = require('three');
import Noise from './Noise';
import { runInNewContext } from 'vm';
import { Int8Attribute } from 'three';
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
var positionOffsets = new Array(3);
var gui;
scene = new THREE.Scene();

// Info from OBJ
// var objVertices = [];
var objMin, objMax, objSize;
var startX, endX, startY, endY, startZ, endZ;
var num2by2, num2by3, num2by4, num2by6, num2by8;

raycaster = new THREE.Raycaster();
// var texture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/minecraft/atlas.png' );
// texture.magFilter = THREE.NearestFilter;
var material = new THREE.MeshLambertMaterial({color:0x0259df});
// Different brick shapes
var geometry = new THREE.BoxBufferGeometry(1, 1, 1);
var geo2by3 = new THREE.BoxBufferGeometry(1, 1, 1.5);
var geo2by4 = new THREE.BoxBufferGeometry(1, 1, 2);
var geo2by6 = new THREE.BoxBufferGeometry(1, 1, 3);
var geo2by8 = new THREE.BoxBufferGeometry(1, 1, 4);
var geo3by2 = new THREE.BoxBufferGeometry(1.5, 1, 1);
var geo4by2 = new THREE.BoxBufferGeometry(2, 1, 1);
var geo6by2 = new THREE.BoxBufferGeometry(3, 1, 1);
var geo8by2 = new THREE.BoxBufferGeometry(4, 1, 1);

// loadScene();
// animate();

// function loadScene() {
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
var vocab = {
  TwoByTwo: 200,
  TwoByThree: 200,
  TwoByFour: 200,
  TwoBySix: 200,
  TwoByEight: 200
};

num2by2 = vocab.TwoByTwo;
num2by3 = vocab.TwoByThree;
num2by4 = vocab.TwoByFour;
num2by6 = vocab.TwoBySix;
num2by8 = vocab.TwoByEight;

// TODO: add numbers to gui

// Set up camera, scene
camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 20000);
camera.position.set(20, 20, 20);
controls = new THREE.OrbitControls(camera); // Move through scene with mouse and arrow keys
controls.update();
controls.enablePan = true;
controls.enableZoom = true;
controls.keyPanSpeed = 15.0;
scene.background = new THREE.Color(0xc5ecf9);
scene.add(new THREE.AxesHelper(20));

// Lights!
var ambientLight = new THREE.AmbientLight( 0xcccccc );
scene.add(ambientLight);

var directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.position.set(20, 25, -15);
scene.add(directionalLight);

// loadObj();
// console.log(positionOffsets);

document.addEventListener('mousedown', onDocumentMouseDown, false);
window.addEventListener('keydown', onKeyDown, false);
window.addEventListener('keyup', onKeyUp, false);
window.addEventListener('resize', onWindowResize, false);
// }
animate();


// Load a resource- from three.js docs
loader.load(
	// Resource URL
  'https://raw.githubusercontent.com/catyang97/lego-project/master/src/baymax.obj',
  // 'https://raw.githubusercontent.com/catyang97/lego-project/master/src/mario.obj',
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
        startX = Math.floor(objMin.x);
        endX = Math.ceil(objMax.x);
        startY = Math.floor(objMin.y);
        endY = Math.ceil(objMax.y);
        startZ = Math.floor(objMin.z);
        endZ = Math.ceil(objMax.z);
        positionOffsets[0] = startX;
        positionOffsets[1] = startY;
        positionOffsets[2] = startZ;
        var xSize = endX - startX;
        // console.log('here');
        var rem = ((objMax.x-objMin.x)/2.0)%1;
        rem = 0;
        for (var i = startY; i < endY; i++) {
          // Create 2D array
          var xArray = new Array(xSize);

          for (var j = startX; j < endX; j++) {
            var zSize = endZ - startZ;
            var zArray = new Array(zSize);

            var start, end;
            var yes = false;
            // Shoot ray from front
            raycaster.set(new THREE.Vector3(j+rem, i+0.5, endZ+5), new THREE.Vector3(0, 0, -1));
            var intersects = raycaster.intersectObject(child);
            // if (intersects.length > 1 && j == 4) { 
            //   for (var hello = 0; hello < intersects.length; hello++) {
            //     var cube = new THREE.Mesh(geometry, material);
            //     cube.position.set(intersects[hello].point.x, intersects[hello].point.y, intersects[hello].point.z);
            //     // scene.add(cube);
            //   }
            //   console.log(intersects);
            // }
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
              // for (var k = Math.ceil(start.z); k < Math.ceil(end.z); k++) {
              //   var cube = new THREE.Mesh(geometry, material);
              //   cube.position.set(j+rem, i, k);
              //   scene.add(cube);
              // }
              
              // Save info
              // x = j+rem, y = k, z = Math.ceil(start.z to Math.ceil(end.z)

              for (var k = startZ; k < endZ; k++) {
                if (k >= Math.ceil(start.z) && k < Math.ceil(end.z)) {
                  zArray[k] = 2; // Regular 2 by 2 bricks
                } else {
                  zArray[k] = 0;
                }

              }

            } else {
              for (var k = startZ; k < endZ; k++) {
                zArray[k] = 0;
              }
            }
            xArray[j] = zArray;
          }

          // Pass number 2 


          mapLayers.set(i, xArray);
        }

        // var objPos = child.geometry.attributes.position;
        // for (var i = 0; i < objPos.count; i++) {
        //   var vector = new THREE.Vector3();
        //   vector.fromBufferAttribute(objPos, i);
        //   objVertices.push(vector);
        // }
      }
      setUpBricks();
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

// loader.onLoadComplete = function () {
//   // console.log(positionOffsets[0]);
// console.log('hi');
// }

function setUpBricks() {
  console.log(mapLayers);
  // loadScene();
  // animate();

  // var curr;

  for (var i = startY; i < endY; i++) {
    var xzArray = mapLayers.get(i);

    if (i % 2 == 0) { // even - x then z
      for (var j = startX; j < endX; j++) {
        // Getting the 2D array
        var zArray = xzArray[j];
        var curr = 0;
        var curr2by3, curr2by4, curr2by6, curr2by8, curr2by2 = 0;

        for (var k = startZ; k < endZ; k++) {
          if (zArray[k] === 2) {
            curr++;
          } else {
            // What is curr right now??
            if (num2by8 > 0) { // Are there enough bricks?
              // console.log('we out here');
              curr2by8 = Math.floor(curr/4);
              if (num2by8 - curr2by8 < 0) { // Not enough blocks
                curr2by8 = num2by8;
              }
              num2by8 -= curr2by8; // Subtract from total available
              // Renumber
              for (var renum = (k-(curr2by8*4)); renum < k; renum++) {
                zArray[renum] = 8;
              }
              // // Draw
              for (var draw = 0; draw < curr2by8; draw++) {
                var brick = new THREE.Mesh(geo2by8, material);
                brick.position.set(j, i, k-2.5-(draw*4));
                scene.add(brick);
              }
            }



            var count = 0;
            // while (num2by8 > 0 && curr2by8 > 0) {
            //   // Renumber
            //   for (var re = (k-8))
            //   // Draw

            //   // Subtract
            // }
            // curr-=count;


            curr2by3, curr2by4, curr2by6, curr2by8, curr2by2, curr = 0;
            // mapLayers.set(i, zArray); // Update the map with updated array
          }
        }

        // Get numbers needed of each brick size
        // var curr2by3, curr2by4, curr2by6, curr2by8, curr2by2 = 0;

        // curr2by6 = Math.floor(curr/3);
        // curr-=curr2by6;
        // curr2by4 = Math.floor(curr/2);
        // curr-=curr2by4;
        // curr2by2 = curr;
        

      }
    } else { // odd - z then x
      for (var k = startZ; k < endZ; k++) {
        for (var j = startX; j < endX; j++) {
          var val = xzArray[j][k];
          if (val === 1) {
            // var cube = new THREE.Mesh(geometry, material);
            // cube.position.set(j, i, k);
            // scene.add(cube);
          }
        }
      }
    }


  }

}

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
