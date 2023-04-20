if (!window.glInstance) {
    window.glInstance = document.getElementById("game").getContext("webgl2", {
        depth: true,
        antialias: true,
        desynchronized: true,
        premultipliedAlpha: false
    });
}

const gl = window.glInstance;

class PygletWindow {
    setExclusiveMouse(exclusive) {
        if (exclusive) {
            gl.canvas.requestPointerLock();
        } else {
            document.exitPointerLock();
        }
    }

    run() {
        this.init().then(() => {
            this.resize();
            window.addEventListener("resize", this.resize.bind(this));
            window.addEventListener("keydown", this.keyPress.bind(this));
            window.addEventListener("keyup", this.keyRelease.bind(this));
            document.addEventListener("pointerlockchange", this.pointerLockChange.bind(this));
            gl.canvas.addEventListener("mousedown", this.mousePress.bind(this));
            gl.canvas.addEventListener("mousemove", this.mouseMotion.bind(this));
            window.requestAnimationFrame(this.draw.bind(this));
        });
    }

    resize() {
        const { innerWidth: width, innerHeight: height } = window;
        glInstance.canvas.width = width;
        glInstance.canvas.height = height;
        this.onResize(width, height);
    }

    async onResize(width, height) {}

    keyPress(event) {
        if (event.repeat) return;

        this.onKeyPress(event.code, {shift: event.shiftKey, alt: event.altKey, ctrl: event.ctrlKey});
    }

    async onKeyPress(key, modifiers) {}

    keyRelease(event) {
        this.onKeyRelease(event.code, {shift: event.shiftKey, alt: event.altKey, ctrl: event.ctrlKey});
    }

    async onKeyRelease(key, modifiers) {}

    pointerLockChange(event) {
        this.onPointerLockChange(document.pointerLockElement === gl.canvas);
    }

    async onPointerLockChange(captured) {}

    mousePress(event) {
        this.onMousePress(event.clientX, event.clientY, event.button);
    }

    async onMousePress(x, y, button) {}

    mouseMotion(event) {
        this.onMouseMotion(event.clientX, event.clientY, event.movementX, event.movementY);
    }

    async onMouseMotion(x, y, deltaX, deltaY) {}

    async init() {}

    draw() {
        this.onDraw();
        window.requestAnimationFrame(this.draw.bind(this));
    }

    async onDraw() {}
}

class PygletClock {
    constructor() {
        this.intervals = {};
    }

    #runInterval(key) {
        const intervalConfig = this.intervals[key];
        const currentTime = window.performance.now();
        const elapsedTime = currentTime - intervalConfig.lastTime;

        if (elapsedTime >= intervalConfig.interval) {
            const deltaTime = elapsedTime / 1000;
            intervalConfig.lastTime = currentTime - (elapsedTime % intervalConfig.interval);

            // Calculate the moving average of the delta times
            intervalConfig.deltaTimeHistory.push(deltaTime);
            if (intervalConfig.deltaTimeHistory.length > intervalConfig.movingAverageWindow) {
                intervalConfig.deltaTimeHistory.shift();
            }
            const averageDeltaTime = intervalConfig.deltaTimeHistory.reduce((sum, value) => sum + value, 0) / intervalConfig.deltaTimeHistory.length;

            intervalConfig.callback(averageDeltaTime);
        }
    }

    scheduleInterval(callback, interval, movingAverageWindow = 10) {
        const randomKey = Math.random().toString(36).substring(7);

        this.intervals[randomKey] = {
            lastTime: window.performance.now(),
            interval: interval,
            callback: callback,
            movingAverageWindow: movingAverageWindow,
            deltaTimeHistory: [],
            intervalFunc: window.setInterval(() => {
                this.#runInterval(randomKey);
            }, interval)
        }
    }
}


class pygletImage {
    constructor() {}

    async load(path) {
        const image = new Image();
        image.src = path;
        await new Promise((resolve, reject) => {
            image.onload = () => {
                resolve();
            };
        });
        return image;
    }
}

class PygletAdapter {
    constructor() {
        this.window = {Window: PygletWindow}
        this.clock = new PygletClock();
        this.image = new pygletImage();
        this.gl = window.glInstance;
    }
}

if (!window.pygletAdapt) {
    window.pygletAdapter = new PygletAdapter();
}

const pygletAdapter = window.pygletAdapter;

export default pygletAdapter;