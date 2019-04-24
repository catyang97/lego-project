const THREE = require('three');
var OrbitControls = require('./OrbitControls.js');
var Stats = require('./stats.min.js');
var dat = require('./dat.gui.min.js');
var OBJLoader = require('./OBJLoader.js');

// if ( WEBGL.isWebGLAvailable() === false ) {
//   document.body.appendChild( WEBGL.getWebGLErrorMessage() );
//   document.getElementById( 'container' ).innerHTML = "";
// }

// Set Up
var container, stats;
var camera, controls, scene, renderer, raycaster, raycasterSelect;
var mouse = new THREE.Vector2(),INTERSECTED;
var loader = new THREE.OBJLoader();

var mapLayers = new Map();
var mapLayersOdd = new Map();
var positionOffsets = new Array(3);
var gui;
scene = new THREE.Scene();

// Info from OBJ
// var objVertices = [];
var objMin, objMax, objSize;
var startX, endX, startY, endY, startZ, endZ;
var num2by2, num2by3, num2by4, num2by6, num2by8;

raycaster = new THREE.Raycaster();
raycasterSelect = new THREE.Raycaster();

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

// For brick selection
var material = new THREE.MeshLambertMaterial({color:0x0259df});


// Lights!
var ambientLight = new THREE.AmbientLight( 0xcccccc );
scene.add(ambientLight);

var directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.position.set(20, 25, -15);
scene.add(directionalLight);

// loadObj();
// console.log(positionOffsets);

document.addEventListener('mousedown', onDocumentMouseDown, false);
document.addEventListener( 'mousemove', onDocumentMouseMove, false );
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
          var oddZArray = new Array(zSize);

          // Set up array for odd y values
          for (var k = startZ; k < endZ; k++) {          
            var oddXArray = new Array(xSize);
            // for (var j = startX; j < endX; j++) {
            //   oddXArray = 0;
            // }
            oddZArray[k] = oddXArray;
          }

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
              for (var k = startZ; k < endZ; k++) {
                if (k >= Math.ceil(start.z) && k < Math.ceil(end.z)) {
                  zArray[k] = 2; // Regular 2 by 2 bricks
                  oddZArray[k][j] = 2;
                } else {
                  zArray[k] = 0;
                  oddZArray[k][j] = 0;
                }
              }

            } else {
              for (var k = startZ; k < endZ; k++) {
                zArray[k] = 0;
                oddZArray[k][j] = 0;
              }
            }
            xArray[j] = zArray;
          }

          // TODO: Pass number 2 


          // if (i % 2 == 0) {
          mapLayers.set(i, xArray);
          // } else {
          mapLayersOdd.set(i, oddZArray);
          // }
        }

        // Get all vertices
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
  console.log(mapLayersOdd);
  // loadScene();
  // animate();

  for (var i = startY; i < endY; i++) {
    var xzArray = mapLayers.get(i);
    var zxArray = mapLayersOdd.get(i);

    if (i % 2 == 0) { // even - x then z
      for (var j = startX; j < endX; j++) {
        // Getting the 2D array
        var zArray = xzArray[j];
        var curr = 0;
        var curr2by3, curr2by4, curr2by6, curr2by8, curr2by2 = 0;

        for (var k = startZ; k < endZ+1; k++) {
          if (zArray[k] === 2 && k < endZ) {
            curr++;
          } else {
            // What is curr right now??
            if (num2by8 > 0) { // Are there enough bricks?
              curr2by8 = Math.floor(curr/4);
              if (curr2by8 > 0) {
                if (num2by8 - curr2by8 < 0) { // Not enough blocks
                  curr2by8 = num2by8;
                }
                num2by8 -= curr2by8; // Subtract from total available
                // Renumber
                var startK = k-(curr2by8*4)-curr;
                var endK = startK + (curr2by8*4);
                for (var renum = startK; renum < endK; renum++) {
                  zArray[renum] = 8;
                }
                curr-=curr2by8*4;
                // Draw
                for (var draw = 0; draw < curr2by8; draw++) {
                  var material = new THREE.MeshLambertMaterial({color:0x0259df});
                  var brick = new THREE.Mesh(geo2by8, material);
                  brick.position.set(j, i, k-2.5-(draw*4)-curr);
                  scene.add(brick);
                }
              }
            }

            if (num2by6 > 0) { // Are there enough bricks?
              curr2by6 = Math.floor(curr/3);
              if (curr2by6 > 0) {
                if (num2by6 - curr2by6 < 0) { // Not enough blocks
                  curr2by6 = num2by6;
                }
                num2by6 -= curr2by6; // Subtract from total available
                // Renumber
                var startK = k-(curr2by6*3)-curr;
                var endK = startK + (curr2by6*3);
                for (var renum = startK; renum < endK; renum++) {
                  zArray[renum] = 6;
                }
                curr-=curr2by6*3; //?
                // Draw
                for (var draw = 0; draw < curr2by6; draw++) {
                  var material = new THREE.MeshLambertMaterial({color:0x0259df});
                  var brick = new THREE.Mesh(geo2by6, material);
                  brick.position.set(j, i, k-2-(draw*3)-curr);
                  scene.add(brick);
                }

              }
            }

            if (num2by4 > 0) { // Are there enough bricks?
              curr2by4 = Math.floor(curr/2);
              if (curr2by4 > 0) {
                if (num2by4 - curr2by4 < 0) { // Not enough blocks
                  curr2by4 = num2by4;
                }
                num2by4 -= curr2by4; // Subtract from total available
                // Renumber
                var startK = k-(curr2by4*2)-curr;
                var endK = startK + (curr2by4*2);
                for (var renum = startK; renum < endK; renum++) {
                  zArray[renum] = 4;
                }
                curr-=curr2by4*2;
                // Draw
                for (var draw = 0; draw < curr2by4; draw++) {
                  var material = new THREE.MeshLambertMaterial({color:0x0259df});
                  var brick = new THREE.Mesh(geo2by4, material);
                  brick.position.set(j, i, k-1.5-(draw*2)-curr);
                  scene.add(brick);
                }
              }
            }

            if (curr > 0) { // Fill remaining spots with single bricks
              for (var draw = 0; draw < curr; draw++) {
                var material = new THREE.MeshLambertMaterial({color:0x0259df});
                var brick = new THREE.Mesh(geometry, material);
                brick.position.set(j, i, k-1-draw);
                scene.add(brick);
              }            
            }
            curr2by3, curr2by4, curr2by6, curr2by8, curr2by2, curr = 0;
          }
        }
        xzArray[j] = zArray; // Update 2D array for this level
      }
    } else { // odd - z then x
      for (var k = startZ; k < endZ; k++) {
        // Getting the 2D array
        var xArray = zxArray[k];
        var curr = 0;
        var curr2by3, curr2by4, curr2by6, curr2by8, curr2by2 = 0;

        for (var j = startX; j < endX+1; j++) {
          if (xArray[j] === 2 && j < endX) {
            curr++;
          } else {
            // What is curr right now??
            if (num2by8 > 0) { // Are there enough bricks?
              curr2by8 = Math.floor(curr/4);
              if (curr2by8 > 0) {
                if (num2by8 - curr2by8 < 0) { // Not enough blocks
                  curr2by8 = num2by8;
                }
                num2by8 -= curr2by8; // Subtract from total available
                // Renumber
                var startJ = j-(curr2by8*4)-curr;
                var endJ = startJ + (curr2by8*4);
                for (var renum = startJ; renum < endJ; renum++) {
                  xArray[renum] = 8;
                }
                curr-=curr2by8*4;
                // Draw
                for (var draw = 0; draw < curr2by8; draw++) {
                  var material = new THREE.MeshLambertMaterial({color:0x0259df});
                  var brick = new THREE.Mesh(geo8by2, material);
                  brick.position.set(j-2.5-(draw*4)-curr, i, k);
                  scene.add(brick);
                }
              }
            }

            if (num2by6 > 0) { // Are there enough bricks?
              curr2by6 = Math.floor(curr/3);
              if (curr2by6 > 0) {
                if (num2by6 - curr2by6 < 0) { // Not enough blocks
                  curr2by6 = num2by6;
                }
                num2by6 -= curr2by6; // Subtract from total available
                // Renumber
                var startJ = j-(curr2by6*3)-curr;
                var endJ = startJ + (curr2by6*3);
                for (var renum = startJ; renum < endJ; renum++) {
                  xArray[renum] = 6;
                }
                curr-=curr2by6*3; //?
                // Draw
                for (var draw = 0; draw < curr2by6; draw++) {
                  var material = new THREE.MeshLambertMaterial({color:0x0259df});
                  var brick = new THREE.Mesh(geo6by2, material);
                  brick.position.set(j-2-(draw*3)-curr, i, k);
                  scene.add(brick);
                }

              }
            }

            if (num2by4 > 0) { // Are there enough bricks?
              curr2by4 = Math.floor(curr/2);
              if (curr2by4 > 0) {
                if (num2by4 - curr2by4 < 0) { // Not enough blocks
                  curr2by4 = num2by4;
                }
                num2by4 -= curr2by4; // Subtract from total available
                // Renumber
                var startJ = j-(curr2by4*2)-curr;
                var endJ = startJ + (curr2by4*2);
                for (var renum = startJ; renum < endJ; renum++) {
                  xArray[renum] = 4;
                }
                curr-=curr2by4*2;
                // Draw
                for (var draw = 0; draw < curr2by4; draw++) {
                  var material = new THREE.MeshLambertMaterial({color:0x0259df});
                  var brick = new THREE.Mesh(geo4by2, material);
                  brick.position.set(j-1.5-(draw*2)-curr, i, k);
                  scene.add(brick);
                }
              }
            }

            if (curr > 0) { // Fill remaining spots with single bricks
              for (var draw = 0; draw < curr; draw++) {
                var material = new THREE.MeshLambertMaterial({color:0x0259df});
                var brick = new THREE.Mesh(geometry, material);
                brick.position.set(j-1-draw, i, k);
                scene.add(brick);
              }            
            }
            curr2by3, curr2by4, curr2by6, curr2by8, curr2by2, curr = 0;
          }
        }
        zxArray[j] = xArray; // Update 2D array for this level
      }

    }
    mapLayers.set(i, xzArray); // Update the map with updated arrays
    mapLayers.set(i, zxArray);
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

  // Be able to select bricks
  // raycasterSelect.setFromCamera(mouse, camera);
  // var intersectsBrick = raycasterSelect.intersectObjects(scene.children);
  // if ( intersectsBrick.length > 0 ) {
  //   if (INTERSECTED != intersectsBrick[0].object) {
  //     INTERSECTED = intersectsBrick[0].object;
  //   console.log(INTERSECTED);
  //     INTERSECTED.material.color.set(0xff0000);   
  //   // INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();

  //   }
  // }

  renderer.render(scene, camera);
}

function onDocumentMouseMove( event ) {
  event.preventDefault();
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onDocumentMouseDown(event) {
  event.preventDefault();
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  raycasterSelect.setFromCamera(mouse, camera);
  var intersectsBrick = raycasterSelect.intersectObjects(scene.children);
  if ( intersectsBrick.length > 0 ) {
    if (INTERSECTED != intersectsBrick[0].object) {
      if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
      INTERSECTED = intersectsBrick[ 0 ].object;
      INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      INTERSECTED.material.emissive.setHex( 0xff0000 );
    } else {
      if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
      INTERSECTED = null;
    }
  }
}

function handleKeyDown(event) {

}

function onKeyDown(event) {
  handleKeyDown(event);
}

function onKeyUp(event) {

}
