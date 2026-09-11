class Anim {
	constructor(duration, delay = 0, start = 0, end = 1, boundsMode = "restrict", onComplete = () => {}) {
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

			if (boundsMode === "restrict" && t >= 1) onComplete();
			if (boundsMode === "loop") {
				t = t % 1;
			} else {
				t = Math.max(Math.min(t, 1), 0);
			}
			// allowed values for boundsMode:
			// ["restrict", "loop"]
			// default: "restrict"

			let frame = (r * t) + start;

			// values will be restricted anyways at the end
			// this should not matter when using loop because it is applied earlier

			return frame;
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