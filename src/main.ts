import {vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import Cube from './geometry/Cube';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Drawable from './rendering/gl/Drawable';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 5,
  radius: 1,
  'Load Scene': loadScene, // A function pointer, essentially
  shader: 'lambert',
  color: [221, 163, 32],
  geometry: 'icosphere',
};

let icosphere: Icosphere;
let square: Square;
let cube: Cube;
let prevTesselations: number = 5;
let prevRadius: number = 1;
let m_Time: number = 0;
let m_Color: vec4;
let activeProg: ShaderProgram = null;
let activeGeometry: string = null;        // TODO: switch geometris using a dropdown list

function loadScene(shaderProg: ShaderProgram) {
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, controls.tesselations);
  icosphere.create();
  activeProg = shaderProg;
  activeGeometry = "Icosphere";
  // square = new Square(vec3.fromValues(0, 0, 0));
  // square.create();
  cube = new Cube(vec3.fromValues(0, 0, 0), controls.radius);
  cube.create();
}

function drawIcosphere() {
  if(controls.tesselations != prevTesselations)
  {
    prevTesselations = controls.tesselations;
    icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, prevTesselations);
    icosphere.create();
  }
}

function drawCube() {
  if (controls.radius != prevRadius) {
    prevRadius = controls.radius;
    cube = new Cube(vec3.fromValues(0, 0, 0), prevRadius);
    cube.create();
  }
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'tesselations', 0, 8).step(1);
  gui.add(controls, 'radius', 0, 10).step(0.2);
  gui.add(controls, 'Load Scene');
  gui.add(controls, 'shader', ['lambert', 'deform']);
  gui.add(controls, 'geometry', ['icosphere', 'cube'])
  gui.addColor(controls, 'color');

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  const deform = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/deform-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/deform-frag.glsl'))
  ]);

  // Initial call to load scene
  loadScene(lambert);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    
    if (controls.shader === 'lambert') {
      activeProg = lambert;
    } else if (controls.shader === 'deform') {
      activeProg = deform;
    } else {
      activeProg = lambert;       // if anything goes wrong, use lambert anyway
    }
    m_Color = vec4.fromValues(controls.color[0] / 255.0, controls.color[1] / 255.0, controls.color[2] / 255.0, 1);

    if (controls.geometry === 'icosphere') {
      drawIcosphere();
      renderer.render(camera, m_Time, m_Color, activeProg, [icosphere]);
    } else if (controls.geometry === 'cube') {
      drawCube();
      renderer.render(camera, m_Time, m_Color, activeProg, [cube]);
    }
    
    stats.end();
    m_Time++;
    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
