class Animation {
	constructor(duration, delay = 0, start = 0, end = 1, debug = false) {
		this.timelineStart = document.timeline.currentTime + delay;
		this.duration = duration;
		this.getFrame = function () {
			// prevent division by zero
			if (this.duration === 0) return end;

			// linear interpolation
			let r = end - start;
			let t = (document.timeline.currentTime - this.timelineStart) / this.duration;

			let frame = (r * t) + start;
			if (debug) console.log(frame);

			// limit between start and end
			let answer = Math.max(Math.min(frame, end), start);
			if (debug) console.log(answer);

			return answer;
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