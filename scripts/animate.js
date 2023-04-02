class Animation {
	constructor(duration, delay = 0, start = 0, end = 1, debug = false) {
		this.timelineStart = document.timeline.currentTime + delay;
		this.duration = duration;
		this.getFrame = function () {
			// prevent division by zero
			if (this.duration === 0) return end;

			// linear interpolation
			let r = end - start;
			if (debug) console.log(r);
			let t = (document.timeline.currentTime - this.timelineStart) / this.duration;
			if (debug) console.log(t);

			let frame = (r * t) + start;
			if (debug) console.log(r * t, frame);

			// limit between start and end
			return Math.max(Math.min(frame, end), start);
		};
		this.isActive = function () {
			const frame = this.getFrame();
			return frame === end || frame === start;
		};
		this.isComplete = function () {
			const frame = this.getFrame();
			return frame === end;
		};
	}
}