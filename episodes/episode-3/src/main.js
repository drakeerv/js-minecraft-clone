import Adapter from "../../adapter.js";

import Shader from "./shader.js";

const vertexPositions = [ // 3d coordinates for each vertex
	-0.5,  0.5, 1.0,
	-0.5, -0.5, 1.0,
	 0.5, -0.5, 1.0,
	 0.5,  0.5, 1.0,
];

const indices = [
	0, 1, 2, // first triangle
	0, 2, 3, // second triangle
];

class Window {
    constructor() {
        this.gl = document.getElementById("game").getContext("webgl2", {
            depth: true,
            antialias: true
        });

        this.adapter = new Adapter(this);
    }

    async onInit () {
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

        this.shader = new Shader(this.gl, "./src/vert.glsl", "./src/frag.glsl");
        await this.shader.loadShaders();
        this.shader.use();
    }

    async onDraw () {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.drawElements(this.gl.TRIANGLES, indices.length, this.gl.UNSIGNED_INT, 0);
    }

    async onResize(width, height) {
        console.log(`Resize ${width} * ${height}`);
        this.gl.viewport(0, 0, width, height);
    }
}

class Game {
    constructor () {
        this.window = new Window();
    }

    run () {
        this.window.adapter.run();
    }
}

const game = new Game();
game.run();