import { PygletWindowAdapter } from "../../adapter.js";

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

class Window extends PygletWindowAdapter {
    async onInit () {
        // create vertex shader
        this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(this.vertexShader, vertexShaderSource);
        gl.compileShader(this.vertexShader);

        // create fragment shader
        this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(this.fragmentShader, fragmentShaderSource);
        gl.compileShader(this.fragmentShader);

        // create shader program
        this.shaderProgram = gl.createProgram();
        gl.attachShader(this.shaderProgram, this.vertexShader);
        gl.attachShader(this.shaderProgram, this.fragmentShader);
        gl.linkProgram(this.shaderProgram);

        gl.useProgram(this.shaderProgram);

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
    }

    async onDraw () {
        gl.clearColor(1.0, 0.5, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_INT, 0);
    }

    async onResize(width, height) {
        console.log(`Resize ${width} * ${height}`);
        gl.viewport(0, 0, width, height);
    }
}

class Game {
    constructor () {
        this.window = new Window();
    }

    run () {
        this.window.run();
    }
}

const game = new Game();
game.run();