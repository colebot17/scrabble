const DEFAULT_CURVE_OPTIONS = {
	"linear": {
		boundsMode: "restrict" // or loop
	},
	"spring": {
		mass: 1,
		stiffness: 1,
		damping: 1
	}
}
const DEFAULT_OPTIONS = {
	curve: "linear", // or spring
	curveOptions: {}
}

class Animation {
	constructor(duration, delay = 0, start = 0, end = 1, options = {}) {
		this.timelineStart = document.timeline.currentTime + delay;
		this.duration = duration;
		this.start = start;
		this.end = end;
		this.options = {...DEFAULT_OPTIONS, ...options};

		{ // sort out default options specific to the selected curve
			const specified = this.options.curveOptions;
			this.options.curveOptions = {...DEFAULT_CURVE_OPTIONS[this.options.curve], ...specified};
		}
	}
	
	getFrame() {
		// prevent division by zero
		if (this.duration === 0) return this.end;

		let frame;
		if (this.options.curve === "spring") {
			const t = (document.timeline.currentTime - this.timelineStart) / this.duration;

			if (t <= 0) {
				frame = this.start;
			} else {
				const m = this.options.curveOptions.mass;
				const s = this.options.curveOptions.stiffness;
				const d = this.options.curveOptions.damping;

				const phaseShift = Math.acos(1 / (1.2 * m));

				const cosCurve = 1.2 * m * Math.cos((2*Math.PI * t * d) + phaseShift);
				const expCurve = Math.E ** (-s * t);

				frame = 1 - cosCurve * expCurve;

				// restrict the beginning (to prevent ginormous values before delay kicks in)
				const smaller = Math.min(this.start, this.end);
				frame = Math.max(frame, smaller);
			}
		} else { // linear
			let r = this.end - this.start;
			let t = (document.timeline.currentTime - this.timelineStart) / this.duration;
	
			frame = (r * t) + this.start;
	
			if (this.options.curveOptions.boundsMode === "loop") {
				frame = ((r * t) % r) + this.start;
			} else {
				const smaller = Math.min(this.start, this.end);
				const larger = Math.max(this.start, this.end);
		
				frame = Math.max(Math.min(frame, larger), smaller);
			}
		}
		
		return frame;
	}
	
	isActive() {
		const frame = this.getFrame();
		return frame === this.end || frame === this.start;
	}
	isComplete() {
		const frame = this.getFrame();
		return frame === this.end;
	}
}