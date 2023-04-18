import Adapter from "../../adapter.js";

class Window {
    constructor() {
        this.gl = document.getElementById("game").getContext("webgl2", {
            depth: true,
            antialias: true
        });

        this.adapter = new Adapter(this);
    }

    async onInit() { }

    async onDraw() {
        this.gl.clearColor(1.0, 0.5, 1.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    async onResize(width, height) {
        console.log(`Resize ${width} * ${height}`);
    }
}

class Game {
    constructor() {
        this.window = new Window();
    }

    run() {
        this.window.adapter.run();
    }
}

const game = new Game();
game.run();