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
        this.rotation = [Math.PI / 2, 0]; // our starting x rotation needs to be pi / 2 since our 0 angle is on the positive x axis while what we consider "forwards" is the negative z axis
    }

    updateCamera(deltaTime) {
        const speed = 7;
        const multiplier = speed * deltaTime;

        this.position[1] += this.input[1] * multiplier;

        if (this.input[0] || this.input[2]) { // important to check this because atan2(0, 0) is undefined
			const angle = this.rotation[0] + Math.atan2(this.input[2], this.input[0]) - (Math.PI / 2); // we need to subtract pi / 2 to move in the positive z direction instead of the positive x direction
			
			this.position[0] += Math.cos(angle) * multiplier;
			this.position[2] += Math.sin(angle) * multiplier;
        }
    }

    updateMatrices() {
        // create projection matrix

        this.pMatrix.loadIdentity();
        this.pMatrix.perspective(90, this.width / this.height, 0.1, 500);

        // create model view matrix

        this.mvMatrix.loadIdentity();
        this.mvMatrix.rotate2d(-(this.rotation[0] - (Math.PI / 2)), this.rotation[1]); // this needs to come first for a first person view and we need to play around with the x rotation angle a bit since our 0 angle is on the positive x axis while the matrix library's 0 angle is on the negative z axis (because of normalized device coordinates)
        this.mvMatrix.translate(-this.position[0], -this.position[1], this.position[2]); // this needs to be negative because if you remember from episode 4, we're technically moving the scene around the camera and not the camera around the scene (except for the z axis because of normalized device coordinates)

        // modelviewprojection matrix

        const mvpMatrix = this.pMatrix.multiply(this.mvMatrix);
        this.shader.uniformMatrix(this.shaderMatrixLocation, mvpMatrix.data);
    }
}

export default Camera;