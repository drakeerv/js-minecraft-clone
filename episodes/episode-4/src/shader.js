class ShaderError extends Error {
    constructor (message) {
        super(message);
        this.name = "ShaderError";
    }
}

function flattenMatrix(array) {
    let result = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            result.push(array[i][j]);
        }
    }
    return result;
}

class Shader {
    constructor (gl, vertPath, fragPath) {
        this.gl = gl;
        this.vertPath = vertPath;
        this.fragPath = fragPath;

        // create vertex shader

        this.vertShader = this.gl.createShader(this.gl.VERTEX_SHADER);

        // create fragment shader

        this.fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);

        // create shader program
        
        this.program = this.gl.createProgram();
    }

    async createShader (target, sourcePath) {
        const response = await fetch(sourcePath);
        
        if (!response.ok) {
            throw new ShaderError(`Could not load ${sourcePath} shader: ${response.status}`);
        }

        const source = await response.text();
        this.gl.shaderSource(target, source);
        this.gl.compileShader(target);

        if (!this.gl.getShaderParameter(target, this.gl.COMPILE_STATUS)) {
            const info = this.gl.getShaderInfoLog(target);
            throw new ShaderError(`Could not compile ${sourcePath} shader: ${info}`);
        }
    }

    async loadShaders () {
        // load and compile shaders using promise.all

        await Promise.all([
            this.createShader(this.vertShader, this.vertPath),
            this.createShader(this.fragShader, this.fragPath)
        ]);

        // attach shaders to program

        this.gl.attachShader(this.program, this.vertShader);
        this.gl.attachShader(this.program, this.fragShader);

        // link shaders and cleanup
        
        this.gl.linkProgram(this.program);

        this.gl.deleteShader(this.vertShader);
        this.gl.deleteShader(this.fragShader);
    }

    delete () {
        this.gl.deleteProgram(this.program);
    }

    findUniform (name) {
        return this.gl.getUniformLocation(this.program, name);
    }

    uniformMatrix (location, matrix) {
        // print size of matrix and size of uniform
        this.gl.uniformMatrix4fv(location, false, flattenMatrix(matrix));
    }

    use () {
        this.gl.useProgram(this.program);
    }
}

export default Shader;