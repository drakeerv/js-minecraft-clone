const gl = document.getElementById("game").getContext("webgl2", {
    depth: true,
    antialias: true
});

class Adapter {
    constructor (parentWindow) {
        this.parentWindow = parentWindow;
        
        window.addEventListener("resize", this.resize.bind(this));
        this.resize();

        this.intervals = {};
    }

    init () {
        this.parentWindow.onInit();
    }

    draw () {
        this.parentWindow.onDraw();
        window.requestAnimationFrame(this.draw.bind(this));
    }

    resize () {
        const { innerWidth: width, innerHeight: height } = window;
        this.parentWindow.onResize(width, height);
        gl.canvas.width = width;
        gl.canvas.height = height;
    }

    run () {
        this.parentWindow.onInit().then(() => {
            window.requestAnimationFrame(this.draw.bind(this));
        });
    }

    _runInterval (key) {
        const intervalConfig = this.intervals[key];
        const deltaTime = (Date.now() - intervalConfig.lastTime) / 1000;
        intervalConfig.lastTime = Date.now();
        intervalConfig.callback(deltaTime);
    }
        

    scheduleInterval (callback, interval) {
        const randomKey = Math.random().toString(36).substring(7);

        this.intervals[randomKey] = {
            lastTime: Date.now(),
            interval: interval,
            callback: callback,
            intervalFunc: window.setInterval(() => {
                this._runInterval(randomKey);
            }, interval)
        }
    }
}

class Window {
    constructor () {
        this.adapter = new Adapter(this);
    }

    async onInit () {}

    async onDraw () {
        gl.clearColor(1.0, 0.5, 1.0, 1.0);
        gl.clear(gl.DEPTH_BUFFER_BIT);
    }

    async onResize (width, height) {
        console.log(`Resize ${width} * ${height}`);
    }
}

class Game {
    constructor () {
        this.window = new Window();
    }

    run () {
        this.window.adapter.run();
    }
}

const game = new Game();
game.run();