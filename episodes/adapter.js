if (!window.glInstance) {
    window.glInstance = document.getElementById("game").getContext("webgl2", {
        depth: true,
        antialias: true
    });
}

class PygletWindow {
    constructor() {
        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
    }

    draw() {
        this.onDraw();
        window.requestAnimationFrame(this.draw.bind(this));
    }

    async onDraw() {}

    resize() {
        const { innerWidth: width, innerHeight: height } = window;
        glInstance.canvas.width = width;
        glInstance.canvas.height = height;
        this.onResize(width, height);
    }

    async onResize(width, height) {}

    run() {
        this.init().then(() => {
            window.requestAnimationFrame(this.draw.bind(this));
        });
    }

    async init() {}
}

class PygletClock {
    constructor() {
        this.intervals = {};
    }

    #runInterval(key) {
        const intervalConfig = this.intervals[key];
        const deltaTime = (Date.now() - intervalConfig.lastTime) / 1000;
        intervalConfig.lastTime = Date.now();
        intervalConfig.callback(deltaTime);
    }

    scheduleInterval(callback, interval) {
        const randomKey = Math.random().toString(36).substring(7);

        this.intervals[randomKey] = {
            lastTime: Date.now(),
            interval: interval,
            callback: callback,
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