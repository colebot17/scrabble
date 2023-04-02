class Animation {
	constructor(duration, delay = 0, start = 0, end = 1) {
		this.timelineStart = document.timeline.currentTime + delay;
		this.duration = duration;
		this.getFrame = function () {
			// prevent division by zero
			if (this.duration === 0) return end;

			// linear interpolation
			let t = (document.timeline.currentTime - this.timelineStart) / duration;
			let r = end - start;

			let frame = (r * t) + start;

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