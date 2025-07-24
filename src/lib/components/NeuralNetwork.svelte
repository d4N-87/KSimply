<script lang="ts">
	import { onMount } from 'svelte';
	// Rimuoviamo l'import statico da qui
	// import p5 from 'p5'; // RIMOSSO

	let container: HTMLElement;

	// Spostiamo la classe Particle al top level dello script
	class Particle {
		p: any;
		pos: any;
		vel: any;
		acc: any;
		maxSpeed = 1;
		// --- MODIFICA 1: Aggiungiamo una proprietà per il colore ---
		isAccent: boolean;

		constructor(p: any) {
			this.p = p;
			this.pos = p.createVector(p.random(p.width), p.random(p.height));
			this.vel = p.constructor.Vector.random2D();
			this.vel.setMag(p.random(0.5, 1.5));
			this.acc = p.createVector(0, 0);
			// --- MODIFICA 2: Decidiamo se la particella è speciale (10% di probabilità) ---
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
			// --- MODIFICA 3: Usiamo un colore diverso se la particella è speciale ---
			if (this.isAccent) {
				this.p.fill('rgba(251, 191, 38, 0.7)'); // secondary-accent (giallo)
			} else {
				this.p.fill('rgba(34, 211, 238, 0.5)'); // primary-accent (ciano)
			}
			this.p.circle(this.pos.x, this.pos.y, 4);
		}
	}


	onMount(async () => {
		// Usiamo un'importazione dinamica
		const p5 = (await import('p5')).default;

		const sketch = (p: any) => {
			let particles: Particle[] = [];
			const numParticles = 50;
			const connectDistance = 120;

			p.setup = () => {
				p.createCanvas(container.clientWidth, container.clientHeight);
				for (let i = 0; i < numParticles; i++) {
					particles.push(new Particle(p));
				}
			};

			p.draw = () => {
				p.background('#030b17'); // background color
				particles.forEach((particle) => {
					particle.update();
					particle.show();
				});

				for (let i = 0; i < particles.length; i++) {
					for (let j = i + 1; j < particles.length; j++) {
						const d = p.dist(
							particles[i].pos.x,
							particles[i].pos.y,
							particles[j].pos.x,
							particles[j].pos.y
						);
						if (d < connectDistance) {
							const alpha = p.map(d, 0, connectDistance, 0.3, 0);
							p.stroke(`rgba(55, 65, 81, ${alpha})`); // border color
							p.line(
								particles[i].pos.x,
								particles[i].pos.y,
								particles[j].pos.x,
								particles[j].pos.y
							);
						}
					}
				}
			};

			p.windowResized = () => {
				p.resizeCanvas(container.clientWidth, container.clientHeight);
			};
		};

		new p5(sketch, container);
	});
</script>

<!-- Usiamo il tag di chiusura esplicito -->
<div bind:this={container} class="absolute top-0 left-0 w-full h-full -z-10"></div>