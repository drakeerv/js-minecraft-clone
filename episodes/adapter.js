if (!window.glInstance) {
    const glElement = document.getElementById("game");
    const glOptions = {
        depth: true,
        antialias: true,
        premultipliedAlpha: false,
        alpha: false
    };
    
    window.glInstance = glElement.getContext("webgl2", glOptions) || glElement.getContext("experimental-webgl2", glOptions);

    if (!window.glInstance) {
        alert("Could not load WebgGL2");
    }
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

    get hasExclusiveMouse() {
        return document.pointerLockElement === gl.canvas;
    }

    run() {
        this.init().then(() => {
            this.resize();

            window.addEventListener("beforeunload", this.beforeUnload.bind(this));
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

    beforeUnload(event) {
        if (this.hasExclusiveMouse) {
            this.setExclusiveMouse(false);
            event.preventDefault();
            event.returnValue = "Do you really want to quit?";
        }
    }

    keyPress(event) {
        event.preventDefault();
        event.stopPropagation();

        if (event.repeat) return;

        this.onKeyPress(event.code, {shift: event.shiftKey, alt: event.altKey, ctrl: event.ctrlKey});
    }

    async onKeyPress(key, modifiers) {}

    keyRelease(event) {
        this.onKeyRelease(event.code, {shift: event.shiftKey, alt: event.altKey, ctrl: event.ctrlKey});
    }

    async onKeyRelease(key, modifiers) {}

    pointerLockChange(event) {
        this.onPointerLockChange(this.hasExclusiveMouse);
    }

    async onPointerLockChange(captured) {}

    mousePress(event) {
        this.onMousePress(event.clientX, event.clientY, event.button);
    }

    async onMousePress(x, y, button) {}

    mouseMotion(event) {
        this.onMouseMotion(event.clientX, event.clientY, event.movementX, -event.movementY);
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
            console.log(deltaTime);
    
            intervalConfig.lastTime = currentTime - (elapsedTime % intervalConfig.interval);
            intervalConfig.callback(deltaTime);
        }
    }

    scheduleInterval(callback, interval) {
        const randomKey = Math.random().toString(36).substring(7);

        this.intervals[randomKey] = {
            lastTime: window.performance.now(),
            interval: interval,
            callback: callback,
            intervalFunc: window.setInterval(() => {
                this.#runInterval(randomKey);
            }, interval)
        }
    }
}

class PygletUpdater {
    constructor() {
        this.callbacks = [];
        this.lastTime = window.performance.now();
        this.update();
    }

    schedule(callback) {
        this.callbacks.push(callback);
    }

    update() {
        const currentTime = window.performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        for (const callback of this.callbacks) {
            callback(deltaTime);
        }

        window.requestAnimationFrame(this.update.bind(this));
    }
}

class pygletImage {
    constructor() {}

    async load(path) {
        const image = new Image();
        image.src = path;
        return new Promise((resolve, reject) => {
            image.onload = () => {
                resolve(image);
            };

            image.onerror = () => {
                reject();
            }
        });
    }
}

class pygletMath {
    constructor() {}

    mod(dividend, divisor) {
        const remainder = dividend % divisor;

        if (divisor < 0 && remainder > 0) {
            return remainder - divisor;
        } else if (divisor > 0 && remainder < 0) {
            return remainder + divisor;
        }

        return remainder;
    }

    choice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    cumsum(array) {
        const result = [];
        let sum = 0;

        for (let i = 0; i < array.length; i++) {
            sum += array[i];
            result.push(sum);
        }

        return result;
    }

    bisect(array, value) {
        let low = 0;
        let high = array.length;

        while (low < high) {
            const mid = Math.floor((low + high) / 2);

            if (array[mid] < value) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }

        return low;
    }

    choices(array, weights, cumWeights=null, k=1) {
        if (cumWeights === null) {
            cumWeights = this.cumsum(weights);
        }

        const total = cumWeights[cumWeights.length - 1];
        const result = [];

        for (let i = 0; i < k; i++) {
            const random = Math.random() * total;
            const index = this.bisect(cumWeights, random);
            result.push(array[index]);
        }

        return result;
    }

    randint(low, high) {
        return Math.floor(Math.random() * (high - low)) + low;
    }
}

class PygletAdapter {
    constructor() {
        this.window = {Window: PygletWindow}
        this.clock = new PygletClock();
        this.updater = new PygletUpdater();
        this.image = new pygletImage();
        this.math = new pygletMath();
        this.gl = window.glInstance;
    }
}

if (!window.pygletAdapt) {
    window.pygletAdapter = new PygletAdapter();
}

const pygletAdapter = window.pygletAdapter;
export default pygletAdapter;