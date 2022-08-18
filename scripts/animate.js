class Animation {
	constructor(duration, delay = 0) {
		this.timelineStart = document.timeline.currentTime + delay;
		this.duration = duration;
		this.getFrame = function (x = document.timeline.currentTime) {
			// y = mx + b (so only linear for now)
			let frame = (x - this.timelineStart) / this.duration;

			// limit between 0 and 1
			return Math.max(Math.min(frame, 1), 0);
		};
		this.isActive = function () {
			const frame = this.getFrame();
			return frame === 1 || frame === 0;
		};
	}
}