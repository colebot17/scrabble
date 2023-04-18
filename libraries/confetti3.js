// https://confettijs.org/
// de-obfuscated by hand
// modified to fit the needs of this project
var Confetti = function() {
    var DefaultConfig = function() {
            return function() {
                this.gravity = 10;
                this.particle_count = 75;
                this.particle_size = 1;
                this.explosion_power = 25;
                this.destroy_target = true;
                this.fade = false;
            }
        }(),
        data = function() {
            function d(id) {
                var animation = this;
                this.bursts = [];
                this.setCount = function(count) {
                    if ("number" != typeof count) throw new Error("Input must be of type 'number'");
                    d.CONFIG.particle_count = count;
                };
                this.setPower = function(power) {
                    if ("number" != typeof power) throw new Error("Input must be of type 'number'");
                    d.CONFIG.explosion_power = power;
                };
                this.setSize = function(size) {
                    if ("number" != typeof size) throw new Error("Input must be of type 'number'");
                    d.CONFIG.particle_size = size;
                };
                this.setFade = function(fade) {
                    if ("boolean" != typeof fade) throw new Error("Input must be of type 'boolean'");
                    d.CONFIG.fade = fade;
                };
                this.destroyTarget = function(destTar) {
                    if ("boolean" != typeof destTar) throw new Error("Input must be of type 'boolean'");
                    d.CONFIG.destroy_target = destTar;
                };
                this.setupCanvasContext = function() {
                    if (d.CTX) return;
                    // create and size the canvas, and set up resize listener
                    var canvas = document.createElement("canvas");
                    d.CTX = canvas.getContext("2d");
                    canvas.width = 2 * window.innerWidth;
                    canvas.height = 2 * window.innerHeight;
                    canvas.style.position = "fixed";
                    canvas.style.top = "0";
                    canvas.style.left = "0";
                    canvas.style.width = "calc(100%)";
                    canvas.style.height = "calc(100%)";
                    canvas.style.margin = "0";
                    canvas.style.padding = "0";
                    canvas.style.zIndex = "999999999";
                    canvas.style.pointerEvents = "none";
                    document.body.appendChild(canvas);
                    window.addEventListener("resize", function() {
                        canvas.width = 2 * window.innerWidth;
                        canvas.height = 2 * window.innerHeight;
                    });
                };
                this.startBurst = function(x, y) {
                    // add a burst at the specified position (*2 because of canvas 0.5x scale)
                    var pt = new OrderedPair(2 * x, 2 * y);
                    animation.bursts.push(new Burst(pt));
                    // hide the clicked element if destroyTarget set (and element exists)
                    if (d.CONFIG.destroyTarget && animation.element) animation.element.style.visibility = "hidden";
                };
                this.setupElement = function(elId) {
                    // store the element
                    var el;
                    animation.element = document.getElementById(elId);

                    // return if element is not found
                    if ((el = animation.element) === null || el === undefined) return;

                    // listen for click on the element
                    el.addEventListener("click", function(event) {
                        // startBurst accounts for 2x canvas dpi
                        animation.startBurst(event.clientX, event.clientY);
                    });
                };
                this.update = function(timeSinceLast) {
                    animation.delta_time = (timeSinceLast - animation.time) / 1e3, animation.time = timeSinceLast;
                    for (var i = animation.bursts.length - 1; i >= 0; i--) animation.bursts[i].update(animation.delta_time), 0 == animation.bursts[i].particles.length && animation.bursts.splice(i, 1);
                    animation.draw(), window.requestAnimationFrame(animation.update)
                };
                if (!d.CONFIG) d.CONFIG = new DefaultConfig;
                this.time = (new Date).getTime();
                this.delta_time = 0;
                this.setupCanvasContext();
                if (id) this.setupElement(id);
                window.requestAnimationFrame(this.update);
            }
            d.prototype.draw = function() {
                drawer.clearScreen();
                for (var i = 0, bursts = this.bursts; i < bursts.length; i++) {
                    bursts[i].draw();
                }
            };
            return d;
        }(),
        Burst = function() {
            function burst(basePt) {
                // add all particles to center point
                this.particles = [];
                for (var i = 0; i < data.CONFIG.particle_count; i++ ) this.particles.push(new Particle(basePt))
            }
            // functions to update/draw each particle in the burst object
            return burst.prototype.update = function(t) {
                for (var i = this.particles.length - 1; i >= 0; i--) this.particles[i].update(t), this.particles[i].checkBounds() && this.particles.splice(i, 1)
            }, burst.prototype.draw = function() {
                for (var i = this.particles.length - 1; i >= 0; i--) this.particles[i].draw()
            }, burst
        }(),
        Particle = function() {
            // a particle is one piece of confetti
            function particle(startingPt) {
                this.size = new OrderedPair((16 * Math.random() + 4) * data.CONFIG.particle_size, (4 * Math.random() + 4) * data.CONFIG.particle_size);
                this.position = new OrderedPair(startingPt.x - this.size.x / 2, startingPt.y - this.size.y / 2);
                this.velocity = velocityGenerator.generateVelocity();
                this.rotation = 360 * Math.random();
                this.rotation_speed = 10 * (Math.random() - .5);
                this.hue = 360 * Math.random();
                this.opacity = 100;                  // only used when fade is enabled
                this.lifetime = Math.random() + .25; //
            }

            // update all necessary properties of the particle
            particle.prototype.update = function(t) {
                this.velocity.y += data.CONFIG.gravity * (this.size.y / (10 * data.CONFIG.particle_size)) * t;
                this.velocity.x += 25 * (Math.random() - .5) * t;
                this.velocity.y *= .98, this.velocity.x *= .98;
                this.position.x += this.velocity.x;
                this.position.y += this.velocity.y;
                this.rotation += this.rotation_speed;
                if (data.CONFIG.fade) this.opacity -= this.lifetime;
            };

            // check if particle has gone off screen (y axis only because gravity)
            particle.prototype.checkBounds = function() {
                return this.position.y - 2 * this.size.x > 2 * window.innerHeight;
            };

            // draw a rectangle for the particle (drawRectangle has randomness built in)
            particle.prototype.draw = function() {
                drawer.drawRectangle(this.position, this.size, this.rotation, this.hue, this.opacity);
            };

            return particle;
        }(),
        OrderedPair = function() {
            return function(x, y) {
                this.x = x || 0;
                this.y = y || 0;
            }
        }(),
        velocityGenerator = function() {
            function generator() {}
            return generator.generateVelocity = function() {
                var powerRandX = Math.random() - .5,
                    powerRandY = Math.random() - .7,
                    hypotenuse = Math.sqrt(powerRandX * powerRandX + powerRandY * powerRandY);
                return powerRandY /= hypotenuse, new OrderedPair((powerRandX /= hypotenuse) * (Math.random() * data.CONFIG.explosion_power), powerRandY * (Math.random() * data.CONFIG.explosion_power))
            }, generator
        }(),
        drawer = function() {
            function drawing() {}
            drawing.clearScreen = function() {
                data.CTX && data.CTX.clearRect(0, 0, 2 * window.innerWidth, 2 * window.innerHeight)
            };
            drawing.drawRectangle = function(pt1, pt2, rotDeg, hue, val) {
                if (!data.ctx) return;
                data.CTX.save(); // save state of all ctx properties (fillStyle)
                data.CTX.beginPath();
                data.CTX.translate(pt1.x + pt2.x / 2, pt1.y + pt2.y / 2);
                data.CTX.rotate(rotDeg * Math.PI / 180);
                data.CTX.rect(-pt2.x / 2, -pt2.y / 2, pt2.x, pt2.y);
                data.CTX.fillStyle = "hsla(" + hue + "deg, 90%, 65%, " + val + "%)";
                data.CTX.fill();
                data.CTX.restore(); // restore state of all ctx properties (fillStyle)
            };
            return drawing;
        }();
    return data
}();