"use strict";

const hitRange = 3;

class Hit {
    constructor(world, rotation, startingPosition) {
        this.world = world;

        // get the ray unit vector based on rotation angles
        // sqrt(ux ^ 2 + uy ^ 2 + uz ^ 2) must always equal 1

        this.vector = [
            Math.cos(rotation[0]) * Math.cos(rotation[1]),
            Math.sin(rotation[1]),
            Math.sin(rotation[0]) * Math.cos(rotation[1])
        ];

        // point position
        this.position = startingPosition;

        // block position in which the point currently is
        this.block = this.position.map(Math.round);

        // current distance the point has travelled
        this.distance = 0;
    }

    // 'check' and 'step' both return 'True' if something is hit, and 'False' if not

    check(hitCallback, distance, currentBlock, nextBlock) {
        if (this.world.getBlockNumber(nextBlock)) {
            hitCallback(currentBlock, nextBlock);
            return true;
        } else {
            this.position = this.position.map((x, i) => x + this.vector[i] * distance);

            this.block = nextBlock;
            this.distance += distance;

            return false;
        }
    }

    step(hitCallback) {
        let bx, by, bz;
        [bx, by, bz] = this.block;

        // point position relative to block centre
        let localPosition = this.position.map((x, i) => x - this.block[i]);

        // we don't want to deal with negatives, so remove the sign
        // this is also cool because it means we don't need to take into account the sign of our ray vector
        // we do need to remember which components were negative for later on, however

        let sign = [1, 1, 1]; // '1' if positive, '-1' if negative
        let absoluteVector = this.vector.slice();

        for (let component = 0; component < 3; component++) {
            if (this.vector[component] < 0) {
                sign[component] = -1;

                absoluteVector[component] = -absoluteVector[component];
                localPosition[component] = -localPosition[component];
            }
        }


        let lx, ly, lz;
        [lx, ly, lz] = localPosition;
        let vx, vy, vz;
        [vx, vy, vz] = absoluteVector;

        // calculate intersections
        // I only detail the math for the first component (X) because the rest is pretty self-explanatory

        // ray line (passing through the point) r ≡ (x - lx) / vx = (y - ly) / lz = (z - lz) / vz (parametric equation)

        // +x face fx ≡ x = 0.5 (y & z can be any real number)
        // r ∩ fx ≡ (0.5 - lx) / vx = (y - ly) / vy = (z - lz) / vz

        // x: x = 0.5
        // y: (y - ly) / vy = (0.5 - lx) / vx IFF y = (0.5 - lx) / vx * vy + ly
        // z: (z - lz) / vz = (0.5 - lx) / vx IFF z = (0.5 - lx) / vx * vz + lz

        if (vx) {
            const x = 0.5;
            const y = (0.5 - lx) / vx * vy + ly;
            const z = (0.5 - lx) / vx * vz + lz;

            if (y >= -0.5 && y <= 0.5 && z >= -0.5 && z <= 0.5) {
                const distance = Math.sqrt((x - lx) ** 2 + (y - ly) ** 2 + (z - lz) ** 2);

                // we can return straight away here
                // if we intersect with one face, we know for a fact we're not intersecting with any of the others

                return this.check(hitCallback, distance, [bx, by, bz], [bx + sign[0], by, bz]);
            }
        }

        if (vy) {
            const x = (0.5 - ly) / vy * vx + lx;
            const y = 0.5;
            const z = (0.5 - ly) / vy * vz + lz;

            if (x >= -0.5 && x <= 0.5 && z >= -0.5 && z <= 0.5) {
                const distance = Math.sqrt((x - lx) ** 2 + (y - ly) ** 2 + (z - lz) ** 2);
                return this.check(hitCallback, distance, [bx, by, bz], [bx, by + sign[1], bz]);
            }
        }

        if (vz) {
            const x = (0.5 - lz) / vz * vx + lx;
            const y = (0.5 - lz) / vz * vy + ly;
            const z = 0.5;

            if (x >= -0.5 && x <= 0.5 && y >= -0.5 && y <= 0.5) {
                const distance = Math.sqrt((x - lx) ** 2 + (y - ly) ** 2 + (z - lz) ** 2);
                return this.check(hitCallback, distance, [bx, by, bz], [bx, by, bz + sign[2]]);
            }
        }
    }
}

export default Hit;
export { hitRange };