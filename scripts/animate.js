class Animation {
	constructor(duration, delay = 0, start = 0, end = 1) {
		this.timelineStart = document.timeline.currentTime + delay;
		this.duration = duration;
		this.start = start;
		this.end = end;
		this.getFrame = function () {
			// prevent division by zero
			if (this.duration === 0) return end;

			// linear interpolation
			let r = end - start;
			let t = (document.timeline.currentTime - this.timelineStart) / this.duration;

			let frame = (r * t) + start;

			// limit between start and end
			let smaller = Math.min(start, end);
			let larger = Math.max(start, end);

			return Math.max(Math.min(frame, larger), smaller);
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