"use strict";

import Entity from "./entity.js";
import Matrix from "./matrix.js";

const WALKING_SPEED = 4.317;
const SPRINTING_SPEED = 7; // faster than in Minecraft, feels better

class Player extends Entity {
    constructor(world, shader, width, height) {
        super(world);

        this.view_width = width;
        this.view_height = height;

        // create matrices

        this.mvMatrix = new Matrix();
        this.pMatrix = new Matrix();

        // shaders

        this.shader = shader;
        this.shaderMatrixLocation = this.shader.findUniform("matrix");

        // camera variables

        this.eyelevel = this.height - 0.2;
        this.input = [0, 0, 0];

        this.target_speed = WALKING_SPEED;
        this.speed = this.target_speed;
    }

    update(deltaTime) {
        // process input

        if (deltaTime * 20 > 1) {
            this.speed = this.target_speed;
        } else {
            this.speed += (this.target_speed - this.speed) * deltaTime * 20;
        }

        const multiplier = this.speed * (this.flying ? 2 : 1);

        if (this.flying && this.input[1]) {
            this.accel[1] = this.input[1] * multiplier;
        }

        if (this.input[0] || this.input[2]) {
            const angle = this.rotation[0] - Math.atan2(this.input[2], this.input[0]) + Math.PI / 2;

            this.accel[0] = Math.cos(angle) * multiplier;
            this.accel[2] = Math.sin(angle) * multiplier;
        }

        if (!this.flying && this.input[1] > 0) {
            this.jump();
        }
        
        // process physics & collisions &c

        super.update(deltaTime);
    }

    updateMatrices() {
        // create projection matrix

        this.pMatrix.loadIdentity();
        this.pMatrix.perspective(
            90 + 10 * (this.speed - WALKING_SPEED) / (SPRINTING_SPEED - WALKING_SPEED),
			this.view_width / this.view_height,
			0.1,
			500
        );

        // create model view matrix

        this.mvMatrix.loadIdentity();
        this.mvMatrix.rotate2d(this.rotation[0] + Math.PI / 2, this.rotation[1]);
        this.mvMatrix.translate(-this.position[0], -this.position[1], -this.position[2]);

        // modelviewprojection matrix

        const mvpMatrix = this.pMatrix.multiply(this.mvMatrix);
        this.shader.uniformMatrix(this.shaderMatrixLocation, mvpMatrix.data);
    }
}

export default Player;
export { WALKING_SPEED, SPRINTING_SPEED };