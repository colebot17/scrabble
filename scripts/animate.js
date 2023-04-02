class Animation {
	constructor(duration, delay = 0, start = 0, end = 1) {
		this.timelineStart = document.timeline.currentTime + delay;
		this.duration = duration;
		this.getFrame = function (x = document.timeline.currentTime) {
			// prevent division by zero
			if (this.duration === 0) return end;

			// y = mx + b (so only linear for now)
			let frame = ((end - start) * (x - this.timelineStart) / this.duration) + this.start;

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