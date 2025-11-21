"use strict";

import Collider from "./collider.js";

// Acceleration / drag constants (must be arrays, not comma operator expressions)
const FLYING_ACCEL = [0, 0, 0];
const GRAVITY_ACCEL = [0, -32, 0];

// These values all come (loosely) from Minecraft, multiplied by 20 (since Minecraft runs at 20 TPS)
const FRICTION = [20, 20, 20];

const DRAG_FLY = [5, 5, 5];
const DRAG_JUMP = [1.8, 0, 1.8];
const DRAG_FALL = [1.8, 0.4, 1.8];


class Entity {
    constructor(world) {
        this.world = world

        // physical variables

        this.jump_height = 1.25;
        this.flying = false;

        this.position = [0, 80, 0];
        this.rotation = [-Math.PI / 2, 0, 0];

        this.velocity = [0, 0, 0];
        this.accel = [0, 0, 0];

        // collision variables

        this.width = 0.6;
        this.height = 1.8;

        this.collider = new Collider();
        this.grounded = false;
    }

    update_collider() {
        const [x, y, z] = this.position;

        this.collider.x1 = x - this.width / 2;
        this.collider.x2 = x + this.width / 2;

        this.collider.y1 = y;
        this.collider.y2 = y + this.height;

        this.collider.z1 = z - this.width / 2;
        this.collider.z2 = z + this.width / 2;
    }

    teleport(pos) {
        this.position = pos;
        this.velocity = [0, 0, 0]; // to prevent collisions
    }

    jump(height=null) {
        // obviously, we can't initiate a jump while in mid-air

        if (!this.grounded) {
            return;
        }

        if (height === null) {
            height = this.jump_height;
        }

        this.velocity[1] = Math.sqrt(-2 * GRAVITY_ACCEL[1] * height);
    }

    get friction() {
        if (this.flying) {
            return DRAG_FLY;
        } else if (this.grounded) {
            return FRICTION;
        } else if (this.velocity[1] > 0) {
            return DRAG_JUMP;
        }

        return DRAG_FALL;
    }

    update(deltaTime) {
        // apply input acceleration, and adjust for friction/drag

        this.velocity = this.velocity.map((v, i) => v + this.accel[i] * this.friction[i] * deltaTime);
        this.accel = [0, 0, 0];

        // compute collisions

        this.update_collider();
        this.grounded = false;

        for (let i = 0; i < 3; i++) {
            const adjusted_velocity = this.velocity.map(v => v * deltaTime);
            const [vx, vy, vz] = adjusted_velocity;

            // find all the blocks we could potentially be colliding with
            // this step is known as "broad-phasing"

            const step_x = vx > 0 ? 1 : -1;
            const step_y = vy > 0 ? 1 : -1;
            const step_z = vz > 0 ? 1 : -1;

            const steps_xz = Math.floor(this.width / 2);
            const steps_y = Math.floor(this.height);

            const [x, y, z] = this.position.map(Math.floor);
            const [cx, cy, cz] = this.position.map((v, i) => Math.floor(v + adjusted_velocity[i]));

            const potential_collisions = [];

            for (let i = x - step_x * (steps_xz + 1); step_x > 0 ? i < cx + step_x * (steps_xz + 2) : i > cx + step_x * (steps_xz + 2); i += step_x) {
                for (let j = y - step_y * (steps_y + 2); step_y > 0 ? j < cy + step_y * (steps_y + 3) : j > cy + step_y * (steps_y + 3); j += step_y) {
                    for (let k = z - step_z * (steps_xz + 1); step_z > 0 ? k < cz + step_z * (steps_xz + 2) : k > cz + step_z * (steps_xz + 2); k += step_z) {
                        const pos = [i, j, k];
                        const num = this.world.getBlockNumber(pos);

                        if (!num) {
                            continue;
                        }

                        for (const _collider of this.world.blockTypes[num].colliders) {
                            const [entry_time, normal] = this.collider.collide(_collider.add(pos), adjusted_velocity);

                            if (normal === null) {
                                continue;
                            }

                            console.log(`Collision at ${pos} with block ${num} at time ${entry_time} with normal ${normal}`);

                            potential_collisions.push([entry_time, normal]);
                        }
                    }
                }
            }

            // get first collision

            if (!potential_collisions.length) {
                break;
            }

            const [entry_time_val, normal] = potential_collisions.reduce((a, b) => a[0] < b[0] ? a : b);
            const entry_time = entry_time_val - 0.001;

            if (normal[0]) {
                this.velocity[0] = 0;
                this.position[0] += vx * entry_time;
            }

            if (normal[1]) {
                this.velocity[1] = 0;
                this.position[1] += vy * entry_time;
            }

            if (normal[2]) {
                this.velocity[2] = 0;
                this.position[2] += vz * entry_time;
            }

            if (normal[1] == 1) {
                this.grounded = true;
            }
        }

        this.position = this.position.map((x, i) => x + this.velocity[i] * deltaTime);

        // apply gravity acceleration

        const gravity = this.flying ? FLYING_ACCEL : GRAVITY_ACCEL;
        this.velocity = this.velocity.map((v, i) => v + gravity[i] * deltaTime);

        // apply friction/drag

        this.velocity = this.velocity.map((v, i) => {
            const decel = Math.min(Math.abs(v) * this.friction[i] * deltaTime, Math.abs(v));
            return v - Math.sign(v) * decel;
        });

        // make sure we can rely on the entity's collider outside of this function

        this.update_collider();
    }
}

export default Entity;