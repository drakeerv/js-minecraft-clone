import Adapter from "../../adapter.js";

const gl = document.getElementById("game").getContext("webgl2", {
    depth: true,
    antialias: true
});

const vertexShaderSource = `#version 300 es
precision mediump float;
layout(location = 0) in vec3 vertex_position;
out vec3 local_position;
void main(void) {
	local_position = vertex_position;
	gl_Position = vec4(vertex_position, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;
out vec4 fragment_colour;
in vec3 local_position;
void main(void) {
	fragment_colour = vec4(1.0, 1.0, 1.0, 1.0);
}
`;

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
        // create vertex shader
        this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(this.vertexShader, vertexShaderSource);
        this.gl.compileShader(this.vertexShader);

        // create fragment shader
        this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(this.fragmentShader, fragmentShaderSource);
        this.gl.compileShader(this.fragmentShader);

        // create shader program
        this.shaderProgram = this.gl.createProgram();
        this.gl.attachShader(this.shaderProgram, this.vertexShader);
        this.gl.attachShader(this.shaderProgram, this.fragmentShader);
        this.gl.linkProgram(this.shaderProgram);

        this.gl.useProgram(this.shaderProgram);

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
    }

    async onDraw () {
        this.gl.clearColor(1.0, 0.5, 1.0, 1.0);
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