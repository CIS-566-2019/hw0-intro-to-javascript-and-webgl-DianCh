import {vec4, mat4} from 'gl-matrix';
import Drawable from './Drawable';
import {gl} from '../../globals';

var activeProgram: WebGLProgram = null;

export class Shader {
  shader: WebGLShader;

  constructor(type: number, source: string) {
    this.shader = gl.createShader(type);
    gl.shaderSource(this.shader, source);
    gl.compileShader(this.shader);

    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      throw gl.getShaderInfoLog(this.shader);
    }
  }
};

class ShaderProgram {
  prog: WebGLProgram;

  attrPos: number;
  attrNor: number;
  attrCol: number;

  unifModel: WebGLUniformLocation;
  unifModelInvTr: WebGLUniformLocation;
  unifViewProj: WebGLUniformLocation;
  unifColor: WebGLUniformLocation;
  unifTime: WebGLUniformLocation                                  // why is attribute returning a number, whereas uniform 
                                                                  // returns a WebGLUniformLocation?

  constructor(shaders: Array<Shader>) {                           // should take vertex shader and fragment shader
    this.prog = gl.createProgram();                               // create a WebGLProgram

    for (let shader of shaders) {
      gl.attachShader(this.prog, shader.shader);                  // attach shaders to this program
    }
    gl.linkProgram(this.prog);                                    // link this program
    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {     // check the linking status
      throw gl.getProgramInfoLog(this.prog);
    }

    this.attrPos = gl.getAttribLocation(this.prog, "vs_Pos");     // get handles of vertex attributes & uniform attributes
    this.attrNor = gl.getAttribLocation(this.prog, "vs_Nor");
    this.attrCol = gl.getAttribLocation(this.prog, "vs_Col");
    this.unifModel      = gl.getUniformLocation(this.prog, "u_Model");
    this.unifModelInvTr = gl.getUniformLocation(this.prog, "u_ModelInvTr");
    this.unifViewProj   = gl.getUniformLocation(this.prog, "u_ViewProj");
    this.unifColor      = gl.getUniformLocation(this.prog, "u_Color");
    this.unifTime       = gl.getUniformLocation(this.prog, "u_Time");
  }

  use() {
    if (activeProgram !== this.prog) {                // check if the active program is this program
      gl.useProgram(this.prog);                       // if not (usually switched from GUI), tell GL to use this program
      activeProgram = this.prog;                      // update the active program to be this one
    }
  }

  // ========= functions that feed in uniform data ===============
  setModelMatrix(model: mat4) {
    this.use();
    if (this.unifModel !== -1) {
      gl.uniformMatrix4fv(this.unifModel, false, model);                    // function that feeds in the matrix data
    }

    if (this.unifModelInvTr !== -1) {
      let modelinvtr: mat4 = mat4.create();
      mat4.transpose(modelinvtr, model);
      mat4.invert(modelinvtr, modelinvtr);
      gl.uniformMatrix4fv(this.unifModelInvTr, false, modelinvtr);          // function that feeds in the matrix data
    }
  }

  setViewProjMatrix(vp: mat4) {
    this.use();
    if (this.unifViewProj !== -1) {
      gl.uniformMatrix4fv(this.unifViewProj, false, vp);                    // function that feeds in the matrix data
    }
  }

  setGeometryColor(color: vec4) {
    this.use();
    if (this.unifColor !== -1) {
      gl.uniform4fv(this.unifColor, color);                                 // function that feeds in the vector data
    }
  }

  setTime(time: number) {
    this.use();
    if (this.unifTime !== -1) {
      gl.uniform1f(this.unifTime, time);
    }
  }
  // ========= functions that feed in uniform data ===============

  // ========= draw takes care of vertex data ============
  // pass the drawable object (mesh) to the shader program to be drawn
  draw(d: Drawable) {
    this.use();

    if (this.attrPos != -1 && d.bindPos()) {                                // binding status of buffer should be checked besides attribute handle,
      gl.enableVertexAttribArray(this.attrPos);                             // vertex attribute array should be enabled, and pointer should be set
      gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
    }

    if (this.attrNor != -1 && d.bindNor()) {
      gl.enableVertexAttribArray(this.attrNor);
      gl.vertexAttribPointer(this.attrNor, 4, gl.FLOAT, false, 0, 0);
    }

    d.bindIdx();
    gl.drawElements(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0);       // function that actually draws using indices and buffers

    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);      // disable attribute arrays after drawing
    if (this.attrNor != -1) gl.disableVertexAttribArray(this.attrNor);
  }
  // ========= draw takes care of vertex data ============

};

export default ShaderProgram;
