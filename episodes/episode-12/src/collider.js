"use strict";

class Collider {
    constructor(pos1=(null, null, null), pos2=(null, null, null)) {
        this.x1, this.y1, this.z1 = pos1;
        this.x2, this.y2, this.z2 = pos2;
    }

    // implement add for this class
    add(pos) {
        let [x, y, z] = pos;

        return new Collider((this.x1 + x, this.y1 + y, this.z1 + z), (this.x2 + x, this.y2 + y, this.z2 + z));
    }

    and(collider) {
        const x = Math.min(this.x2, collider.x2) - Math.max(this.x1, collider.x1);
        const y = Math.min(this.y2, collider.y2) - Math.max(this.y1, collider.y1);
        const z = Math.min(this.z2, collider.z2) - Math.max(this.z1, collider.z1);

        return x > 0 && y > 0 && z > 0;
    }

    collide(collider, velocity) {
        // this: the dynamic collider, which moves
        // collider: the static collider, which stays put

        const no_collision = (1, null);

        // find entry & exit times for each axis
        
        const [vx, vy, vz] = velocity;

        function time(x, y) {
            return y === 0 ? (x > 0 ? Infinity : -Infinity) : x / y;
        }

        const x_entry = time(vx > 0 ? collider.x1 - this.x2 : collider.x2 - this.x1, vx);
        const x_exit = time(vx > 0 ? collider.x2 - this.x1 : collider.x1 - this.x2, vx);

        const y_entry = time(vy > 0 ? collider.y1 - this.y2 : collider.y2 - this.y1, vy);
        const y_exit = time(vy > 0 ? collider.y2 - this.y1 : collider.y1 - this.y2, vy);

        const z_entry = time(vz > 0 ? collider.z1 - this.z2 : collider.z2 - this.z1, vz);
        const z_exit = time(vz > 0 ? collider.z2 - this.z1 : collider.z1 - this.z2, vz);

        // make sure we actually got a collision

        if (x_entry < 0 && y_entry < 0 && z_entry < 0) {
            return no_collision;
        }

        if (x_entry > 1 || y_entry > 1 || z_entry > 1) {
            return no_collision;
        }

        // on which axis did we collide first?

        const entry = Math.max(x_entry, y_entry, z_entry);
        const exit = Math.min(x_exit, y_exit, z_exit);

        if (entry > exit) {
            return no_collision;
        }

        // find normal of surface we collided with

        const nx = entry == x_entry ? (vx > 0 ? -1 : 1) : 0;
        const ny = entry == y_entry ? (vy > 0 ? -1 : 1) : 0;
        const nz = entry == z_entry ? (vz > 0 ? -1 : 1) : 0;
        
        return (entry, (nx, ny, nz));
    }
}
    
export default Collider;