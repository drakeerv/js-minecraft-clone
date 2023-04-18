import Shader from "./shader.js";

const gl = document.getElementById("game").getContext("webgl2", {
    depth: true,
    antialias: true
});

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

class Adapter {
    constructor (parentWindow) {
        this.parentWindow = parentWindow;
        
        window.addEventListener("resize", this.resize.bind(this));
        this.resize();

        this.intervals = {};
    }

    init () {
        this.parentWindow.onInit();
    }

    draw () {
        this.parentWindow.onDraw();
        window.requestAnimationFrame(this.draw.bind(this));
    }

    resize () {
        const { innerWidth: width, innerHeight: height } = window;
        this.parentWindow.onResize(width, height);
        gl.canvas.width = width;
        gl.canvas.height = height;
    }

    run () {
        this.parentWindow.onInit().then(() => {
            window.requestAnimationFrame(this.draw.bind(this));
        });
    }

    _runInterval (key) {
        const intervalConfig = this.intervals[key];
        const deltaTime = (Date.now() - intervalConfig.lastTime) / 1000;
        intervalConfig.lastTime = Date.now();
        intervalConfig.callback(deltaTime);
    }
        

    scheduleInterval (callback, interval) {
        const randomKey = Math.random().toString(36).substring(7);

        this.intervals[randomKey] = {
            lastTime: Date.now(),
            interval: interval,
            callback: callback,
            intervalFunc: window.setInterval(() => {
                this._runInterval(randomKey);
            }, interval)
        }
    }
}

class Window {
    constructor () {
        this.adapter = new Adapter(this);
    }

    async onInit () {
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

        this.shader = new Shader(gl, "./src/vert.glsl", "./src/frag.glsl");
        await this.shader.loadShaders();
        this.shader.use();
    }

    async onDraw () {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_INT, 0);
    }

    async onResize (width, height) {
        console.log(`Resize ${width} * ${height}`);
        gl.viewport(0, 0, width, height);
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