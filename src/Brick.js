const THREE = require('three');
var OBJLoader = require('./OBJLoader.js');
var brickLoader = new THREE.OBJLoader();

var geo;

// brickLoader.load(
//     // Resource URL
//     'https://raw.githubusercontent.com/catyang97/lego-project/master/src/fourbytwolego.obj',
//     // Called when resource is loaded
//     function (object) {
//         // Add all vertices of the obj to objVertices
//         object.traverse(function(child) {
//             if (child instanceof THREE.Mesh) {
//                 // scene.add(child);
//                 geo = child;
//                 build(geo, material);
//             }
//         });
//     },
//     // called when loading is in progresses
//     function (xhr) {
//         console.log((xhr.loaded / xhr.total * 100) + '% loaded');
//     },
//     // called when loading has errors
//     function (error) {
//         console.log('An error happened');
//     }
// );

// export default class Brick extends THREE.Mesh {
//     constructor(material) {
//         // const props = build(geo, material);

//         console.log(geo);
//         super(geo, material);

//     }
// }

// function build(geo, material) {
//     console.log(geo);
//     return [geo, material];
// }