<script lang="ts">
	import { onMount } from 'svelte';

	let container: HTMLElement;

	/**
	 * [EN] Represents a single particle in the animation.
	 * It manages its own position, velocity, and appearance.
	 * ---
	 * [IT] Rappresenta una singola particella nell'animazione.
	 * Gestisce la propria posizione, velocità e aspetto.
	 */
	class Particle {
		p: any; // p5 instance
		pos: any; // p5.Vector for position
		vel: any; // p5.Vector for velocity
		acc: any; // p5.Vector for acceleration
		maxSpeed = 1;
		isAccent: boolean; // Determines if the particle has a special color

		constructor(p: any) {
			this.p = p;
			this.pos = p.createVector(p.random(p.width), p.random(p.height));
			this.vel = p.constructor.Vector.random2D();
			this.vel.setMag(p.random(0.5, 1.5));
			this.acc = p.createVector(0, 0);
			// [EN] 10% chance for a particle to be an "accent" particle.
			// [IT] 10% di probabilità che una particella sia una particella "accento".
			this.isAccent = p.random(1) < 0.1;
		}

		update() {
			this.vel.add(this.acc);
			this.vel.limit(this.maxSpeed);
			this.pos.add(this.vel);
			this.acc.mult(0);
			this.edges();
		}

		// [EN] Wraps particles around the screen edges.
		// [IT] Fa riapparire le particelle sul lato opposto dello schermo.
		edges() {
			if (this.pos.x > this.p.width) this.pos.x = 0;
			if (this.pos.x < 0) this.pos.x = this.p.width;
			if (this.pos.y > this.p.height) this.pos.y = 0;
			if (this.pos.y < 0) this.pos.y = this.p.height;
		}

		show() {
			this.p.noStroke();
			// [EN] Use a different color for accent particles.
			// [IT] Usa un colore diverso per le particelle "accento".
			if (this.isAccent) {
				this.p.fill('rgba(251, 191, 38, 0.7)'); // secondary-accent
			} else {
				this.p.fill('rgba(34, 211, 238, 0.5)'); // primary-accent
			}
			this.p.circle(this.pos.x, this.pos.y, 4);
		}
	}


	onMount(async () => {
		// [EN] Dynamically import p5.js only on the client-side to avoid SSR issues.
		// [IT] Importa dinamicamente p5.js solo lato client per evitare problemi di SSR.
		const p5 = (await import('p5')).default;

		const sketch = (p: any) => {
			let particles: Particle[] = [];
			const numParticles = 50;
			const connectDistance = 120; // Max distance to draw a line between particles

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

				// [EN] Connect nearby particles with lines.
				// [IT] Collega le particelle vicine con delle linee.
				for (let i = 0; i < particles.length; i++) {
					for (let j = i + 1; j < particles.length; j++) {
						const d = p.dist(
							particles[i].pos.x,
							particles[i].pos.y,
							particles[j].pos.x,
							particles[j].pos.y
						);
						if (d < connectDistance) {
							// [EN] The closer the particles, the more opaque the line.
							// [IT] Più le particelle sono vicine, più la linea è opaca.
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

			// [EN] Ensure the canvas resizes with the window.
			// [IT] Assicura che il canvas si ridimensioni con la finestra.
			p.windowResized = () => {
				p.resizeCanvas(container.clientWidth, container.clientHeight);
			};
		};

		new p5(sketch, container);
	});
</script>

<!-- 
  [EN] The container element for the p5.js canvas.
  It's bound to the `container` variable and positioned to fill the background.
  ---
  [IT] L'elemento contenitore per il canvas di p5.js.
  È collegato alla variabile `container` e posizionato per riempire lo sfondo.
-->
<div bind:this={container} class="absolute top-0 left-0 w-full h-full -z-10"></div>