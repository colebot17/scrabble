class Animation {
	constructor(duration, delay = 0, from = 0, to = 1) {
		this.timelineStart = document.timeline.currentTime + delay;
		this.duration = duration;
		this.getFrame = function (x = document.timeline.currentTime) {
			// y = mx + b (so only linear for now)
			let frame = (to - from) * (x - this.timelineStart) / this.duration;

			// limit between from and to
			return Math.max(Math.min(frame, to), from);
		};
		this.isActive = function () {
			const frame = this.getFrame();
			return frame === to || frame === from;
		};
	}
}