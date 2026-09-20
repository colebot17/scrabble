const DEFAULT_OPTIONS = {
	delay: 0,
	from: 0,
	to: 1,
	boundsMode: "restrict", // "restrict", "loop", "bounce-loop"
	onComplete: () => {}
}

class Anim {
	constructor(duration, options = {}) {
		const opts = { ...DEFAULT_OPTIONS, ...options };

		this.timelineStart = document.timeline.currentTime + opts.delay;
		this.duration = duration;
		this.start = opts.from;
		this.end = opts.to;
		this.boundsMode = opts.boundsMode;
		this.onComplete = opts.onComplete;
	}

	getFrame() {
		// prevent division by zero
		if (this.duration === 0) return document.timeline.currentTime >= this.timelineStart ? this.end : this.start;

		// linear interpolation
		let t = (document.timeline.currentTime - this.timelineStart) / this.duration;

		if (this.boundsMode === "restrict" && t >= 1) this.onComplete();

		if (this.boundsMode === "loop") {
			t = t % 1;
		} else if (this.boundsMode === "loop-bounce") {
			t = Math.abs((t % 2) - 1);
		} else {
			t = Math.max(Math.min(t, 1), 0);
		}

		let frame = ((this.end - this.start) * t) + this.start;

		return frame;
	}

	isComplete() {
		return this.boundsMode === "restrict" && document.timeline.currentTime >= this.timelineStart + this.duration;
	}
}