import { PygletWindowAdapter, pygletAdapter } from "../../adapter.js";

import Shader from "./shader.js";
import Matrix from "./matrix.js";

const vertexPositions = [ // set the Z component to 0.0 so that our object is centered
    -0.5, 0.5, 0.0,
    -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0,
    0.5, 0.5, 0.0,
];

const indices = [
    0, 1, 2, // first triangle
    0, 2, 3, // second triangle
];

class Window extends PygletWindowAdapter {
    async onInit() {
        // create vertex array object

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        // create vertex buffer object

        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);

        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        // create index buffer object

        this.ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);

        // create shader

        this.shader = new Shader("./src/vert.glsl", "./src/frag.glsl");
        await this.shader.loadShaders();
        this.shaderMatrixLocation = this.shader.findUniform("matrix");
        this.shader.use();

        // create matrices

        this.mvMatrix = new Matrix(); // modelview
        this.pMatrix = new Matrix(); // projection

        this.x = 0; // temporary variable

        pygletAdapter.clock.scheduleInterval(this.update.bind(this), 1000 / 60);
    }

    async update(deltaTime) {
        this.x += deltaTime;
    }

    async onDraw() {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // create projection matrix

        this.pMatrix.loadIdentity();
        this.pMatrix.perspective(90, gl.canvas.width / gl.canvas.height, 0.1, 500);

        // create model view matrix

        this.mvMatrix.loadIdentity();
        this.mvMatrix.translate(0, 0, -1);
        this.mvMatrix.rotate2d(this.x + 6.28 / 4, Math.sin(this.x / 3 * 2) / 2);

        // multiply the two matrices together and send to the shader program

        const mvpMatrix = this.pMatrix.multiply(this.mvMatrix);
        this.shader.uniformMatrix(this.shaderMatrixLocation, mvpMatrix.data);

        // draw stuff

        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_INT, 0);
    }

    async onResize(width, height) {
        console.log(`Resize ${width} * ${height}`);
        gl.viewport(0, 0, width, height);
    }
}

class Game {
    constructor() {
        this.window = new Window();
    }

    run() {
        this.window.run();
    }
}

const game = new Game();
game.run();