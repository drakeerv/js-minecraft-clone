import Adapter from "../../adapter.js";

import Shader from "./shader.js";
import Matrix from "./matrix.js";

class Window {
    constructor() {
        this.gl = document.getElementById("game").getContext("webgl2", {
            depth: true,
            antialias: true
        });
        
        this.adapter = new Adapter(this);
    }

    async update(deltaTime) {
        this.x += deltaTime;
    }

    async onInit() {
        // create vertex array object

        this.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vao);

        // create vertex buffer object

        this.vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);

        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertexPositions), this.gl.STATIC_DRAW);

        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(0);

        // create index buffer object

        this.ibo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo);

        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), this.gl.STATIC_DRAW);

        // create shader

        this.shader = new Shader(gl, "./src/vert.glsl", "./src/frag.glsl");
        await this.shader.loadShaders();
        this.shaderMatrixLocation = this.shader.findUniform("matrix");
        this.shader.use();

        // create matrices

        this.mvMatrix = new Matrix(); // modelview
        this.pMatrix = new Matrix(); // projection

        this.x = 9; // temporary variable

        this.adapter.scheduleInterval(this.update.bind(this), 1000 / 60);
    }

    async onDraw() {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        // create projection matrix

        this.pMatrix.loadIdentity();
        this.pMatrix.perspective(90, this.gl.canvas.width / this.gl.canvas.height, 0.1, 500);

        // create model view matrix

        this.mvMatrix.loadIdentity();
        this.mvMatrix.translate(0, 0, -1);
        this.mvMatrix.rotate2d(this.x + 6.28 / 4, Math.sin(this.x / 3 * 2) / 2);

        // multiply the two matrices together and send to the shader program

        const mvpMatrix = this.pMatrix.multiply(this.mvMatrix);
        this.shader.uniformMatrix(this.shaderMatrixLocation, mvpMatrix.data);

        // draw stuff

        this.gl.drawElements(this.gl.TRIANGLES, indices.length, this.gl.UNSIGNED_INT, 0);
    }

    async onResize(width, height) {
        console.log(`Resize ${width} * ${height}`);
        this.gl.viewport(0, 0, width, height);
    }
}

class Game {
    constructor() {
        this.window = new Window();
    }

    run() {
        this.window.adapter.run();
    }
}

const game = new Game();
game.run();