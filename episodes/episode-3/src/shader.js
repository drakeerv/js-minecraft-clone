"use strict";

import { pygletAdapter } from "../../adapter.js";
const gl = pygletAdapter.gl;

class ShaderError extends Error {
    constructor(message) {
        super(message);
        this.name = "ShaderError";
    }
}

class Shader {
    constructor(vertPath, fragPath) {
        this.vertPath = vertPath;
        this.fragPath = fragPath;

        // create vertex shader

        this.vertShader = gl.createShader(gl.VERTEX_SHADER);

        // create fragment shader

        this.fragShader = gl.createShader(gl.FRAGMENT_SHADER);

        // create shader program

        this.program = gl.createProgram();
    }

    async createShader(target, sourcePath) {
        const response = await fetch(sourcePath);

        if (!response.ok) {
            throw new ShaderError(`Could not load ${sourcePath} shader: ${response.status}`);
        }

        const source = await response.text();
        gl.shaderSource(target, source);
        gl.compileShader(target);

        if (!gl.getShaderParameter(target, gl.COMPILE_STATUS)) {
            const info = gl.getShaderInfoLog(target);
            throw new ShaderError(`Could not compile ${sourcePath} shader: ${info}`);
        }
    }

    async loadShaders() {
        // load and compile shaders using promise.all

        await Promise.all([
            this.createShader(this.vertShader, this.vertPath),
            this.createShader(this.fragShader, this.fragPath)
        ]);

        // attach shaders to program

        gl.attachShader(this.program, this.vertShader);
        gl.attachShader(this.program, this.fragShader);

        // link shaders and cleanup

        gl.linkProgram(this.program);

        gl.deleteShader(this.vertShader);
        gl.deleteShader(this.fragShader);
    }

    delete() {
        gl.deleteProgram(this.program);
    }

    use() {
        gl.useProgram(this.program);
    }
}

export default Shader;