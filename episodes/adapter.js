class Adapter {
    constructor(parentWindow) {
        this.parentWindow = parentWindow;

        window.addEventListener("resize", this.resize.bind(this));
        this.resize();

        this.intervals = {};
    }

    init() {
        this.parentWindow.onInit();
    }

    draw() {
        this.parentWindow.onDraw();
        window.requestAnimationFrame(this.draw.bind(this));
    }

    resize() {
        const { innerWidth: width, innerHeight: height } = window;
        this.parentWindow.gl.canvas.width = width;
        this.parentWindow.gl.canvas.height = height;
        this.parentWindow.onResize(width, height);
    }

    run() {
        this.parentWindow.onInit().then(() => {
            window.requestAnimationFrame(this.draw.bind(this));
        });
    }

    _runInterval(key) {
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
                this._runInterval(randomKey);
            }, interval)
        }
    }
}

export default Adapter;