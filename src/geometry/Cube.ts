import {vec3, vec4} from 'gl-matrix'
import Drawable from '../rendering/gl/Drawable'
import {gl} from '../globals'

class Cube extends Drawable {
    indices: Uint32Array;
    positions: Float32Array;
    normals: Float32Array;
    center: vec4;
    radius: number;

    constructor(center: vec3, radius: number) {
        super();
        this.center = vec4.fromValues(center[0], center[1], center[2], 1);
        this.radius = radius;
    }

    create() {
        let r = this.radius;
        this.indices = new Uint32Array([0, 1, 2,
                                        0, 2, 3,
                                        2, 6, 5,
                                        2, 5, 3,
                                        6, 7, 4,
                                        6, 4, 5,
                                        0, 4, 7,
                                        0, 7, 1,
                                        0, 3, 5,
                                        0, 5, 4,
                                        1, 7, 6,
                                        1, 6, 2]);

        this.normals = new Float32Array([1, 0, 0, 0,
                                         1, 0, 0, 0,
                                         0, 1, 0, 0,
                                         0, 1, 0, 0,
                                         -1, 0, 0, 0,
                                         -1, 0, 0, 0,
                                         0, -1, 0, 0,
                                         0, -1, 0, 0,
                                         0, 0, 1, 0,
                                         0, 0, 1, 0]);
        
        this.positions = new Float32Array([r, -r, r, 1,
                                           r, -r, -r, 1,
                                           r, r, -r, 1,
                                           r, r, r, 1,
                                           -r, -r, r, 1,
                                           -r, r, r, 1,
                                           -r, r, -r, 1,
                                           -r, -r, -r, 1]);

        this.generateIdx();
        this.generatePos();
        this.generateNor();

        this.count = this.indices.length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
        gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

        console.log("Created cube");
    }
};

export default Cube;