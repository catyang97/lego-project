const THREE = require('three');
var OrbitControls = require('./OrbitControls.js');
var Stats = require('./stats.min.js');
var dat = require('./dat.gui.min.js');
var OBJLoader = require('./OBJLoader.js');

// if (WEBGL.isWebGLAvailable() === false) {
//   document.body.appendChild(WEBGL.getWebGLErrorMessage());
//   document.getElementById('container').innerHTML = "";
// }

// Set Up
var container, stats;
var camera, controls, scene, renderer, raycaster, raycasterSelect, raycasterCheck;
var mouse = new THREE.Vector2(),INTERSECTED, SELECTED, NEW;
var loader = new THREE.OBJLoader();
var upKey = false, downKey = false, deleteKey = false;

var mapLayers = new Map();
var mapLayersOdd = new Map();

// TODO: be able to save original map so we can reload bricks with different numbers
var mapLayersBackup = new Map();
var mapLayersOddBackup = new Map();

// var positionOffsets = new Array(3);
var gui;
scene = new THREE.Scene();

var runProgram = false;

// Info from OBJ
// var objVertices = [];
var objMin, objMax, objSize;
var startX, endX, startY, endY, startZ, endZ;
var num2by2, num2by3, num2by4, num2by6, num2by8;

raycaster = new THREE.Raycaster();
raycasterSelect = new THREE.Raycaster();
raycasterCheck = new THREE.Raycaster();

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

// Modes
var mode;
var currAdd = 'Two By Two', prevAdd = 'Two By Two'; // What type of brick we are adding right now

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
container.appendChild(stats.dom);
container.appendChild(renderer.domElement);

// Set up camera, scene
camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 20000);
camera.position.set(30, 20, 30);
controls = new THREE.OrbitControls(camera, renderer.domElement); // Move through scene with mouse and arrow keys
controls.update();
controls.enablePan = true;
controls.enableZoom = true;
controls.keyPanSpeed = 15.0;
scene.background = new THREE.Color(0xc5ecf9);
// scene.add(new THREE.AxesHelper(20));

gui = new dat.gui.GUI();
var vocab = {
  // TwoByTwo: 200,
  // TwoByThree: '200',
  TwoByFour: '200',
  TwoBySix: '200',
  TwoByEight: '200',
  Color: 0x0259df,
  Mode: 'Navigate'
};

// num2by2 = Number(vocab.TwoByTwo);
// num2by3 = Number(vocab.TwoByThree);
num2by4 = Number(vocab.TwoByFour);
num2by6 = Number(vocab.TwoBySix);
num2by8 = Number(vocab.TwoByEight);
mode = vocab.Mode;

// TODO: add numbers and controls to gui
gui.add(vocab, 'TwoByFour').onChange(function(newVal) {
  num2by4 = Number(vocab.TwoByFour);
});
gui.add(vocab, 'TwoBySix').onChange(function(newVal) {
  num2by6 = Number(vocab.TwoBySix);
});
gui.add(vocab, 'TwoByEight').onChange(function(newVal) {
  num2by8 = Number(vocab.TwoByEight);
});
gui.addColor(vocab, 'Color');
var startButton = {BUILD:function() { 
  console.log("clicked") ;
  runProgram = true;
  setUpBricks();
}};
gui.add(startButton,'BUILD');

gui.add(vocab, 'Mode', ['Navigate', 'Build', 'Delete']).onChange(function(value) {
  mode = vocab.Mode;
  if (mode === 'Build') {
    brickFolder.open();
    scene.add(rollOverMesh);
  } else if (mode === 'Delete' || mode === 'Navigate') {
    brickFolder.close();
  }
});

var types = {
  BrickType: 'Two By Two',
  Color: 0x0259df
};
var brickFolder = gui.addFolder('Bricks');
brickFolder.add(types, 'BrickType', ['Two By Two', 'Two By Four', 'Two By Six', 'Two By Eight',
                                     'Four By Two', 'Six By Two', 'Eight By Two']).onChange(function(value) {
  currAdd = types.BrickType;
});
brickFolder.addColor(types, 'Color');

// var material = new THREE.MeshStandardMaterial({color:vocab.Color, metalness: 0.4, roughness: 0.5});
// var brick = new THREE.Mesh(geo2by8, material);
// brick.rotation.x = Math.PI / 2;
// brick.position.set(20, 0, 0);
// scene.add(brick);

// For brick selection
var material = new THREE.MeshStandardMaterial({color:vocab.Color, metalness: 0.4, roughness: 0.5});

var rollOverMesh, rollOverMesh24, rollOverMesh26, rollOverMesh28;
var rollOverMesh42, rollOverMesh62, rollOverMesh82, rollOverMaterial;
rollOverMaterial = new THREE.MeshBasicMaterial({color: 0xff0000, opacity: 0.5, transparent: true});
rollOverMesh = new THREE.Mesh(geometry, rollOverMaterial);
rollOverMesh.name = 'rollover';

rollOverMesh24 = new THREE.Mesh(geo2by4, rollOverMaterial);
rollOverMesh24.name = 'rollover';

rollOverMesh26 = new THREE.Mesh(geo2by6, rollOverMaterial);
rollOverMesh26.name = 'rollover';

rollOverMesh28 = new THREE.Mesh(geo2by8, rollOverMaterial);
rollOverMesh28.name = 'rollover';

rollOverMesh42 = new THREE.Mesh(geo4by2, rollOverMaterial);
rollOverMesh42.name = 'rollover';

rollOverMesh62 = new THREE.Mesh(geo6by2, rollOverMaterial);
rollOverMesh62.name = 'rollover';

rollOverMesh82 = new THREE.Mesh(geo8by2, rollOverMaterial);
rollOverMesh82.name = 'rollover';

// Lights!
var ambientLight = new THREE.AmbientLight(0xcccccc);
ambientLight.castShadow = true;
scene.add(ambientLight);

var directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.position.set(0, 10, 15);
directionalLight.castShadow = true;
scene.add(directionalLight);


// loadObj();
// console.log(positionOffsets);

document.addEventListener('mousedown', onDocumentMouseDown, false);
document.addEventListener('mousemove', onDocumentMouseMove, false);
window.addEventListener('keydown', onKeyDown, false);
window.addEventListener('keyup', onKeyUp, false);
window.addEventListener('resize', onWindowResize, false);
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
        // positionOffsets[0] = startX;
        // positionOffsets[1] = startY;
        // positionOffsets[2] = startZ;
        var xSize = endX - startX;
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
      // setUpBricks();
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
  // console.log(mapLayers);
  // console.log(mapLayersOdd);
  // loadScene();
  // animate();
  console.log(num2by8);
  console.log(num2by6);
  console.log(num2by4);

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
                  var material = new THREE.MeshStandardMaterial({color:vocab.Color, metalness: 0.4, roughness: 0.5});
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
                curr-=curr2by6*3;
                // Draw
                for (var draw = 0; draw < curr2by6; draw++) {
                  var material = new THREE.MeshStandardMaterial({color:vocab.Color, metalness: 0.4, roughness: 0.5});
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
                  var material = new THREE.MeshStandardMaterial({color:vocab.Color, metalness: 0.4, roughness: 0.5});
                  var brick = new THREE.Mesh(geo2by4, material);
                  brick.position.set(j, i, k-1.5-(draw*2)-curr);
                  scene.add(brick);
                }
              }
            }

            if (curr > 0) { // Fill remaining spots with single bricks
              for (var draw = 0; draw < curr; draw++) {
                var material = new THREE.MeshStandardMaterial({color:vocab.Color, metalness: 0.4, roughness: 0.5});
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
                  var material = new THREE.MeshStandardMaterial({color:vocab.Color, metalness: 0.4, roughness: 0.5});
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
                curr-=curr2by6*3;
                // Draw
                for (var draw = 0; draw < curr2by6; draw++) {
                  var material = new THREE.MeshStandardMaterial({color:vocab.Color, metalness: 0.4, roughness: 0.5});
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
                  var material = new THREE.MeshStandardMaterial({color:vocab.Color, metalness: 0.4, roughness: 0.5});
                  var brick = new THREE.Mesh(geo4by2, material);
                  brick.position.set(j-1.5-(draw*2)-curr, i, k);
                  scene.add(brick);
                }
              }
            }

            if (curr > 0) { // Fill remaining spots with single bricks
              for (var draw = 0; draw < curr; draw++) {
                var material = new THREE.MeshStandardMaterial({color:vocab.Color, metalness: 0.4, roughness: 0.5});
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
  // var geometry1 = new THREE.PlaneGeometry( 100, 100, 100 );
  // var material1 = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
  // var plane = new THREE.Mesh( geometry1, material1 );
  // plane.position.set(0, startY, 0);
  // plane.rotateX( - Math.PI / 2);
  // scene.add( plane );
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

function onDocumentMouseMove(event) {
  // event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
	vector.unproject(camera);
	var dir = vector.sub(camera.position).normalize();
	var distance = - camera.position.z / dir.z;
	var pos = camera.position.clone().add(dir.multiplyScalar(distance));
  
  raycasterSelect.setFromCamera(mouse, camera);
  // create an array containing all objects in the scene with which the ray intersects
  var intersectsBrick = raycasterSelect.intersectObjects(scene.children);
  if (intersectsBrick.length > 0) {
    // if the closest object intersected is not the currently stored intersection object
    if (INTERSECTED != intersectsBrick[0].object) {
      if (intersectsBrick[0].object.name !== 'rollover') {
        deleteRollovers();
        // restore previous intersection object (if it exists) to its original color
        if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
        // store reference to closest object as current intersection object
        INTERSECTED = intersectsBrick[ 0 ].object;
        // store color of closest object (for later restoration)
        INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
        // set a new color for closest object
        INTERSECTED.material.emissive.setHex(0xff0000);
      }

    }
  } else {
    // restore previous intersection object (if it exists) to its original color
    if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
    // remove previous intersection object reference
    INTERSECTED = null;

    if (mode === 'Build') {
      deleteRollovers();
      if (currAdd === 'Two By Two') {
        rollOverMesh.position.copy(pos);
        rollOverMesh.position.divideScalar(1).floor().multiplyScalar(1);
        scene.add(rollOverMesh);      
      } else if (currAdd === 'Two By Four') {
        rollOverMesh24.position.copy(pos);
        rollOverMesh24.position.divideScalar(1).floor().multiplyScalar(1);
        scene.add(rollOverMesh24);    
      } else if (currAdd === 'Two By Six') {
        rollOverMesh26.position.copy(pos);
        rollOverMesh26.position.divideScalar(1).floor().multiplyScalar(1);
        scene.add(rollOverMesh26);
      } else if (currAdd === 'Two By Eight') {
        rollOverMesh28.position.copy(pos);
        rollOverMesh28.position.divideScalar(1).floor().multiplyScalar(1);
        scene.add(rollOverMesh28);
      } else if (currAdd === 'Four By Two') {
        rollOverMesh42.position.copy(pos);
        rollOverMesh42.position.divideScalar(1).floor().multiplyScalar(1);
        scene.add(rollOverMesh42);
      } else if (currAdd === 'Six By Two') {
        rollOverMesh62.position.copy(pos);
        rollOverMesh62.position.divideScalar(1).floor().multiplyScalar(1);
        scene.add(rollOverMesh62);
      } else if (currAdd === 'Eight By Two') {
        rollOverMesh82.position.copy(pos);
        rollOverMesh82.position.divideScalar(1).floor().multiplyScalar(1);
        scene.add(rollOverMesh82);
      }
    }
  }
}

function onDocumentMouseDown(event) {
  // event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  // Clicking on blocks
  raycasterSelect.setFromCamera(mouse, camera);
  var intersects = raycasterSelect.intersectObjects(scene.children);
  if (intersects.length > 0) {
    // console.log('hi');
    // console.log(intersects[0].object);
    if (SELECTED != intersects[0].object) {
      SELECTED = intersects[0].object;
      if (mode == 'Delete') {
        if (deleteKey) {
          scene.remove(SELECTED);
        }
      } else if (mode === 'Build') {
        var selPos = SELECTED.position;
        var depth = SELECTED.geometry.parameters.depth; // z
        var width = SELECTED.geometry.parameters.width; // x
        // Choose to put a block below or above?

        // raycasterCheck.setFromCamera(mouse, camera);
        // var intersectsCheck = raycasterCheck.intersectObjects(scene.children);
        var material = new THREE.MeshStandardMaterial({color:types.Color, metalness: 0.4, roughness: 0.5});

        if (upKey && SELECTED.name !== 'rollover') {
          // Multiple combinations
          // TODO: can add in middle too?
          if (depth === 1) { // in x direction or is 2 by 2
            if (currAdd === 'Two By Two') {
              var brick = new THREE.Mesh(geometry, material);
              brick.position.set(selPos.x, selPos.y + 1, selPos.z);
              scene.add(brick);
            } else if (currAdd === 'Two By Four') {
              var brick = new THREE.Mesh(geo2by4, material);
              brick.position.set(selPos.x, selPos.y + 1, selPos.z);
              scene.add(brick);
            } else if (currAdd === 'Two By Six') {
              var brick = new THREE.Mesh(geo2by6, material);
              brick.position.set(selPos.x, selPos.y + 1, selPos.z);
              scene.add(brick);
            } else if (currAdd === 'Two By Eight') {
              var brick = new THREE.Mesh(geo2by8, material);
              brick.position.set(selPos.x, selPos.y + 1, selPos.z);
              scene.add(brick);
            } else if (currAdd === 'Four By Two') {
              var brick = new THREE.Mesh(geo4by2, material);
              brick.position.set(selPos.x, selPos.y + 1, selPos.z);
              scene.add(brick);
            } else if (currAdd === 'Six By Two') {
              var brick = new THREE.Mesh(geo6by2, material);
              brick.position.set(selPos.x, selPos.y + 1, selPos.z);
              scene.add(brick);
            } else {
              var brick = new THREE.Mesh(geo8by2, material);
              brick.position.set(selPos.x, selPos.y + 1, selPos.z);
              scene.add(brick);
            }
          } else { // in z direction
            if (currAdd === 'Two By Two') {
              var brick = new THREE.Mesh(geometry, material);
              brick.position.set(selPos.x, selPos.y + 1, selPos.z);
              scene.add(brick);
            } else if (currAdd === 'Two By Four') {
              var brick = new THREE.Mesh(geo2by4, material);
              brick.position.set(selPos.x, selPos.y + 1, selPos.z);
              scene.add(brick);
            } else if (currAdd === 'Two By Six') {
              var brick = new THREE.Mesh(geo2by6, material);
              brick.position.set(selPos.x, selPos.y + 1, selPos.z);
              scene.add(brick);
            } else if (currAdd === 'Two By Eight') {
              var brick = new THREE.Mesh(geo2by8, material);
              brick.position.set(selPos.x, selPos.y + 1, selPos.z);
              scene.add(brick);
            } else if (currAdd === 'Four By Two') {
              var brick = new THREE.Mesh(geo4by2, material);
              brick.position.set(selPos.x, selPos.y + 1, selPos.z);
              scene.add(brick);
            } else if (currAdd === 'Six By Two') {
              var brick = new THREE.Mesh(geo6by2, material);
              brick.position.set(selPos.x, selPos.y + 1, selPos.z);
              scene.add(brick);
            } else {
              var brick = new THREE.Mesh(geo8by2, material);
              brick.position.set(selPos.x, selPos.y + 1, selPos.z);
              scene.add(brick);
            }
          }
        } 
        if (downKey  && SELECTED.name !== 'rollover') {
          // Multiple combinations
          // TODO: can add in middle too?
          if (depth === 1) { // in x direction or is 2 by 2
            if (currAdd === 'Two By Two') {
              var brick = new THREE.Mesh(geometry, material);
              brick.position.set(selPos.x, selPos.y - 1, selPos.z);
              scene.add(brick);
            } else if (currAdd === 'Two By Four') {
              var brick = new THREE.Mesh(geo2by4, material);
              brick.position.set(selPos.x, selPos.y - 1, selPos.z);
              scene.add(brick);
            } else if (currAdd === 'Two By Six') {
              var brick = new THREE.Mesh(geo2by6, material);
              brick.position.set(selPos.x, selPos.y - 1, selPos.z);
              scene.add(brick);
            } else if (currAdd === 'Two By Eight') {
              var brick = new THREE.Mesh(geo2by8, material);
              brick.position.set(selPos.x, selPos.y - 1, selPos.z);
              scene.add(brick);
            } else if (currAdd === 'Four By Two') {
              var brick = new THREE.Mesh(geo4by2, material);
              brick.position.set(selPos.x, selPos.y - 1, selPos.z);
              scene.add(brick);
            } else if (currAdd === 'Six By Two') {
              var brick = new THREE.Mesh(geo6by2, material);
              brick.position.set(selPos.x, selPos.y - 1, selPos.z);
              scene.add(brick);
            } else {
              var brick = new THREE.Mesh(geo8by2, material);
              brick.position.set(selPos.x, selPos.y - 1, selPos.z);
              scene.add(brick);
            }
          } else { // in z direction
            if (currAdd === 'Two By Two') {
              var brick = new THREE.Mesh(geometry, material);
              brick.position.set(selPos.x, selPos.y - 1, selPos.z);
              scene.add(brick);
            } else if (currAdd === 'Two By Four') {
              var brick = new THREE.Mesh(geo2by4, material);
              brick.position.set(selPos.x, selPos.y - 1, selPos.z);
              scene.add(brick);
            } else if (currAdd === 'Two By Six') {
              var brick = new THREE.Mesh(geo2by6, material);
              brick.position.set(selPos.x, selPos.y - 1, selPos.z);
              scene.add(brick);
            } else if (currAdd === 'Two By Eight') {
              var brick = new THREE.Mesh(geo2by8, material);
              brick.position.set(selPos.x, selPos.y - 1, selPos.z);
              scene.add(brick);
            } else if (currAdd === 'Four By Two') {
              var brick = new THREE.Mesh(geo4by2, material);
              brick.position.set(selPos.x, selPos.y - 1, selPos.z);
              scene.add(brick);
            } else if (currAdd === 'Six By Two') {
              var brick = new THREE.Mesh(geo6by2, material);
              brick.position.set(selPos.x, selPos.y - 1, selPos.z);
              scene.add(brick);
            } else {
              var brick = new THREE.Mesh(geo8by2, material);
              brick.position.set(selPos.x, selPos.y - 1, selPos.z);
              scene.add(brick);
            }
          }
        }

        // TODO: Decide the position depending on the type of block clicked
      }
    }
    if (intersects[0].object.name === 'rollover' && upKey) {
      console.log('intersecting');
      addABrick();
    }
  } else {
    if (mode === 'Build' && upKey) {
      console.log('blank');

      addABrick();
    }
  }
}

function handleKeyDown(event) {
  switch (event.keyCode) {
    case 87:
      upKey = true;
      break;
    case 83:
      downKey = true;
      break;
    case 68:
      deleteKey = true;
  }
}

function onKeyDown(event) {
  handleKeyDown(event);
}

function onKeyUp(event) {
  upKey = false;
  downKey = false;
  deleteKey = false;
}

function addABrick() {
  var material = new THREE.MeshStandardMaterial({color:types.Color, metalness: 0.4, roughness: 0.5});
  if (currAdd === 'Two By Two') {
    var brick = new THREE.Mesh(geometry, material);
    brick.position.set(rollOverMesh.position.x, rollOverMesh.position.y, rollOverMesh.position.z);
    scene.add(brick);
  } else if (currAdd === 'Two By Four') {
    var brick = new THREE.Mesh(geo2by4, material);
    brick.position.set(rollOverMesh24.position.x, rollOverMesh24.position.y, rollOverMesh24.position.z);
    scene.add(brick);
  } else if (currAdd === 'Two By Six') {
    var brick = new THREE.Mesh(geo2by6, material);
    brick.position.set(rollOverMesh26.position.x, rollOverMesh26.position.y, rollOverMesh26.position.z);
    scene.add(brick);
  } else if (currAdd === 'Two By Eight') {
    var brick = new THREE.Mesh(geo2by8, material);
    brick.position.set(rollOverMesh28.position.x, rollOverMesh28.position.y, rollOverMesh28.position.z);
    scene.add(brick);
  } else if (currAdd === 'Four By Two') {
    var brick = new THREE.Mesh(geo4by2, material);
    brick.position.set(rollOverMesh42.position.x, rollOverMesh42.position.y, rollOverMesh42.position.z);
    scene.add(brick);
  } else if (currAdd === 'Six By Two') {
    var brick = new THREE.Mesh(geo6by2, material);
    brick.position.set(rollOverMesh62.position.x, rollOverMesh62.position.y, rollOverMesh62.position.z);
    scene.add(brick);
  } else if (currAdd === 'Eight By Two') {
    var brick = new THREE.Mesh(geo8by2, material);
    brick.position.set(rollOverMesh82.position.x, rollOverMesh82.position.y, rollOverMesh82.position.z);
    scene.add(brick);
  }
}

function deleteRollovers() {
  scene.remove(rollOverMesh);
  scene.remove(rollOverMesh24);
  scene.remove(rollOverMesh26);
  scene.remove(rollOverMesh28);
  scene.remove(rollOverMesh42);
  scene.remove(rollOverMesh62);
  scene.remove(rollOverMesh82);
}