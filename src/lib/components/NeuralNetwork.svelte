<script lang="ts">
	import { onMount } from 'svelte';

	let container: HTMLElement;

	class Particle {
		p: any;
		pos: any;
		vel: any;
		acc: any;
		maxSpeed = 1;
		isAccent: boolean;

		constructor(p: any) {
			this.p = p;
			this.pos = p.createVector(p.random(p.width), p.random(p.height));
			this.vel = p.constructor.Vector.random2D();
			this.vel.setMag(p.random(0.5, 1.5));
			this.acc = p.createVector(0, 0);
			this.isAccent = p.random(1) < 0.1;
		}

		update() {
			this.vel.add(this.acc);
			this.vel.limit(this.maxSpeed);
			this.pos.add(this.vel);
			this.acc.mult(0);
			this.edges();
		}

		edges() {
			if (this.pos.x > this.p.width) this.pos.x = 0;
			if (this.pos.x < 0) this.pos.x = this.p.width;
			if (this.pos.y > this.p.height) this.pos.y = 0;
			if (this.pos.y < 0) this.pos.y = this.p.height;
		}

		show() {
			this.p.noStroke();
			if (this.isAccent) {
				this.p.fill('rgba(251, 191, 38, 0.7)');
			} else {
				this.p.fill('rgba(34, 211, 238, 0.5)');
			}
			this.p.circle(this.pos.x, this.pos.y, 4);
		}
	}

	onMount(() => {
		let p5Instance: any;
		let observer: IntersectionObserver;

		async function initializeSketch() {
			const p5 = (await import('p5')).default;
			const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

			const sketch = (p: any) => {
				let particles: Particle[] = [];
				const numParticles = isMobile ? 25 : 50;
				const connectDistance = isMobile ? 90 : 120;

				p.setup = () => {
					// --- MODIFICA CHIAVE ---
					// [EN] Create the canvas to fill the entire browser window.
					// [IT] Crea il canvas in modo che riempia l'intera finestra del browser.
					p.createCanvas(p.windowWidth, p.windowHeight).parent(container);
					
					for (let i = 0; i < numParticles; i++) {
						particles.push(new Particle(p));
					}
					if (isMobile) {
						p.frameRate(30);
					}
				};

				p.draw = () => {
					p.background('#030b17');
					particles.forEach((particle) => {
						particle.update();
						particle.show();
					});
					for (let i = 0; i < particles.length; i++) {
						for (let j = i + 1; j < particles.length; j++) {
							const d = p.dist(
								particles[i].pos.x, particles[i].pos.y,
								particles[j].pos.x, particles[j].pos.y
							);
							if (d < connectDistance) {
								const alpha = p.map(d, 0, connectDistance, 0.3, 0);
								p.stroke(`rgba(55, 65, 81, ${alpha})`);
								p.line(
									particles[i].pos.x, particles[i].pos.y,
									particles[j].pos.x, particles[j].pos.y
								);
							}
						}
					}
				};

				p.windowResized = () => {
					// --- MODIFICA CHIAVE ---
					// [EN] On resize, adjust the canvas to the new window size.
					// [IT] Al ridimensionamento, adatta il canvas alla nuova dimensione della finestra.
					p.resizeCanvas(p.windowWidth, p.windowHeight);
				};
			};

			p5Instance = new p5(sketch, container);

			observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							p5Instance.loop();
						} else {
							p5Instance.noLoop();
						}
					});
				},
				{ threshold: 0.01 }
			);
			observer.observe(container);
		}

		initializeSketch();

		return () => {
			if (observer) observer.disconnect();
			if (p5Instance) p5Instance.remove();
		};
	});
</script>

<div bind:this={container} class="w-full h-full"></div>