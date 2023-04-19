"use strict";

import Matrix from "./matrix.js";

class Camera {
    constructor(shader, width, height) {
        this.width = width;
        this.height = height;

        // create matrices

        this.mvMatrix = new Matrix();
        this.pMatrix = new Matrix();

        // shaders

        this.shader = shader;
        this.shaderMatrixLocation = this.shader.findUniform("matrix");

        // camera variables

        this.input = [0, 0, 0];

        this.position = [0, 0, -3];
        this.rotation = [Math.PI / 2, 0];
    }

    updateCamera(deltaTime) {
        const speed = 7;
        const multiplier = speed * deltaTime;

        this.position[1] += this.input[1] * multiplier;

        if (this.input[0] || this.input[2]) { // important to check this because atan2(0, 0) is undefined
			const angle = this.rotation[0] + Math.atan2(this.input[2], this.input[0]) - (Math.PI / 2); // we need to subtract tau / 4 to move in the positive z direction instead of the positive x direction
			
			this.position[0] += Math.cos(angle) * multiplier;
			this.position[2] += Math.sin(angle) * multiplier;
        }
    }

    updateMatrices() {
        // create projection matrix

        this.pMatrix.loadIdentity();
        this.pMatrix.perspective(90, gl.canvas.width / gl.canvas.height, 0.1, 500);

        // create model view matrix

        this.mvMatrix.loadIdentity();
        this.mvMatrix.translate(0, 0, -3);
        this.mvMatrix.rotate2d(this.x, Math.sin(this.x / 3 * 2) / 2);

        // modelviewprojection matrix

        const mvpMatrix = this.pMatrix.multiply(this.mvMatrix);
        this.shader.uniformMatrix(this.shaderMatrixLocation, mvpMatrix.data);
    }
}