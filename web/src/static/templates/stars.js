// stars.js

class Stars {
    constructor(options = {}) {
        this.canvas = null;
        this.ctx = null;

        this.stars = [];

        this.running = false;
        this.paused = false;
        this.animationFrame = null;

        this.lastTime = 0;

        this.center = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        };

        // Public controls
        this.enabled = true;

        this.speed = options.speed ?? 1;
        this.starCount = options.stars ?? 300;
        this.radius = options.radius ?? 1;

        this.trailAlpha = options.trailAlpha ?? 0.8;
        this.acceleration = options.acceleration ?? 1.015;

        this.background = options.background ?? "rgba(1, 4, 35, 0.8)";

        this.resizeHandler = this.resize.bind(this);
        this.animate = this.animate.bind(this);
    }


    init() {
        if (this.canvas)
            return;

        this.canvas = document.createElement("canvas");

        this.canvas.style.position = "fixed";
        this.canvas.style.top = "0";
        this.canvas.style.left = "0";
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.canvas.style.zIndex = "-1";

        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext("2d");

        this.ctx.lineCap = "round";

        this.resize();

        window.addEventListener(
            "resize",
            this.resizeHandler
        );

        this.createStars();
    }


    createStars() {
        this.stars = [];

        for (let i = 0; i < this.starCount; i++) {
            this.stars.push(new Star(this));
        }
    }


    rebuild() {
        this.createStars();
    }


    resize() {

        const oldWidth = this.canvas.width;
        const oldHeight = this.canvas.height;


        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;


        const offsetX =
            (this.canvas.width - oldWidth) / 2;

        const offsetY =
            (this.canvas.height - oldHeight) / 2;


        this.center.x =
            this.canvas.width / 2;

        this.center.y =
            this.canvas.height / 2;


        for (const star of this.stars) {

            star.x += offsetX;
            star.y += offsetY;

            star.previousX += offsetX;
            star.previousY += offsetY;
        }
    }


    start() {
        if (this.running)
            return;

        this.init();

        this.running = true;
        this.paused = false;

        this.lastTime = performance.now();

        this.animationFrame =
            requestAnimationFrame(this.animate);
    }


    stop() {
        this.running = false;

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }


    pause() {
        this.paused = true;
    }


    resume() {
        this.paused = false;
    }
    animate(time) {
        if (!this.running)
            return;

        this.animationFrame =
            requestAnimationFrame(this.animate);

        if (this.paused || !this.enabled)
            return;

        const delta =
            Math.min((time - this.lastTime) / 16.67, 3);

        this.lastTime = time;

        this.render(delta);
    }


    render(delta) {
        const ctx = this.ctx;

        // Motion blur trail
        ctx.fillStyle = this.background;
        ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        ctx.strokeStyle = "white";


        for (const star of this.stars) {
            star.update(delta);
            star.draw(ctx);
        }
    }


    destroy() {
        this.stop();

        window.removeEventListener(
            "resize",
            this.resizeHandler
        );

        if (this.canvas) {
            this.canvas.remove();
            this.canvas = null;
        }

        this.ctx = null;
        this.stars = [];
    }
}



class Star {

    constructor(system) {
        this.system = system;

        this.reset();
    }


    reset() {
        const system = this.system;

        this.x = system.center.x;
        this.y = system.center.y;

        this.previousX = this.x;
        this.previousY = this.y;


        this.radius =
            Math.random() * system.radius;


        const angle =
            Math.random() * Math.PI * 2;


        const speed =
            (Math.random() * 3 + 1) * 0.45;


        this.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };


        this.lineWidth = 0;
    }


    update(delta) {

        const system = this.system;


        // Accelerate outward
        this.velocity.x *=
            Math.pow(system.acceleration, delta);

        this.velocity.y *=
            Math.pow(system.acceleration, delta);



        this.previousX = this.x;
        this.previousY = this.y;


        this.x +=
            this.velocity.x *
            system.speed *
            delta;


        this.y +=
            this.velocity.y *
            system.speed *
            delta;



        this.lineWidth +=
            0.025 * delta;



        if (
            this.x < 0 ||
            this.x > system.canvas.width ||
            this.y < 0 ||
            this.y > system.canvas.height
        ) {
            this.reset();
        }
    }



    draw(ctx) {

        ctx.beginPath();

        ctx.moveTo(
            this.previousX,
            this.previousY
        );

        ctx.lineTo(
            this.x,
            this.y
        );


        ctx.lineWidth =
            this.lineWidth;


        ctx.stroke();
    }
}

// Global controller instance
export const starControl = new Stars({
    stars: 300,
    speed: 1,
    radius: 1,
    trailAlpha: 0.8,
    acceleration: 1.015
});

