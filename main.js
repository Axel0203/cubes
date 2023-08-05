import * as THREE from 'three';
import * as  CANNON from "cannon-es"

const world = new CANNON.World({
  gravity: new CANNON.Vec3(0,0,-9.81)
})

const timeStep = 1/60

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.001, 100000 );
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
scene.background = new THREE.Color(0xf1faee);
renderer.setSize( window.innerWidth, window.innerHeight );

//light

const sunLight = new THREE.DirectionalLight("#ffffff", 4);
sunLight.castShadow = true;
sunLight.shadow.camera.far = 20;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.normalBias = 0.05;
sunLight.position.set(8, 8, 8);
scene.add(sunLight);
const light = new THREE.AmbientLight(0xffffff, 0.5); // soft white light
scene.add(light);


document.body.appendChild( renderer.domElement );


//plane
const geometry = new THREE.PlaneGeometry( 8, 8 );
const material = new THREE.MeshStandardMaterial( {color: 0xbfd4d6, side: THREE.DoubleSide} );
const plane = new THREE.Mesh( geometry, material );
plane.position.set(4,4,0)
plane.castShadow = true;
plane.receiveShadow = true;
scene.add( plane ); 
sunLight.lookAt(plane)


//camera position

if(window.innerWidth<480){
  camera.position.z = 10;
  camera.position.x = 4;
  camera.position.y = -2;
}else {
  camera.position.z = 8;
  camera.position.x = 4;
  camera.position.y = 0;
}
camera.lookAt(plane.position)



const threeBoxes = []
const cannonBoxes = []
document.body.addEventListener("click",(event) => {
  const geometry = new THREE.BoxGeometry( 0.6, 0.6, 0.6 );
  const material = new THREE.MeshStandardMaterial()
  const cube = new THREE.Mesh( geometry, material );
  const cubeX = (event.clientX / window.innerWidth)*8
  const cubeY = ((window.innerHeight - event.clientY) / window.innerHeight)*8
  cube.position.set(cubeX,cubeY,5)
  cube.castShadow = true;
  cube.receiveShadow = true;
  const boxBody = new CANNON.Body({
    mass:1,
    shape: new CANNON.Box(new CANNON.Vec3(0.3,0.3,0.3))
  })
  
  boxBody.position.set(cubeX,cubeY,5)
  scene.add( cube );
  threeBoxes.push(cube)
  world.addBody(boxBody)
  cannonBoxes.push(boxBody)
})

const groundBody = new CANNON.Body({
  shape: new CANNON.Box(new CANNON.Vec3(4,4,0.01))
})

groundBody.position.set(4,4,0)

world.addBody(groundBody)

function animate() {
	requestAnimationFrame( animate );
  plane.position.copy(groundBody.position)
  plane.quaternion.copy(groundBody.quaternion)
  for (let index = 0; index < threeBoxes.length; index++) {
    threeBoxes[index].position.copy(cannonBoxes[index].position)
    threeBoxes[index].quaternion.copy(cannonBoxes[index].quaternion)
  }
  world.step(timeStep)
	renderer.render( scene, camera );
}

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}


animate();  