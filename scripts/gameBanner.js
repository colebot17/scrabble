import { autoContrast } from "//www.colebot.com/colors.js";

export async function gameBanner(content, color, temp = false) {
	const wrapper = document.getElementById('gameBannerWrapper');
	const banner = document.getElementById('gameBanner');
	if (content) {
		banner.innerHTML = content;
		banner.style.backgroundColor = color;
		banner.style.color = autoContrast(color) ? "#000000" : "#FFFFFFDD";

		wrapper.classList.remove('hidden');

		if (temp) {
			const bottom = wrapper.getBoundingClientRect().bottom;
			wrapper.style.position = "absolute";
			wrapper.style.top = "-" + bottom + "px";
			wrapper.style.transition = "top 0.2s cubic-bezier(0.33333, 0, 0.66667, 0.33333)";

			banner.classList.add('tempBanner');

			setCanvasSize();

			await sleep(10);

			wrapper.style.top = "10px";

			await sleep(1500);

			wrapper.style.transition = "top 0.2s cubic-bezier(0.33333, 0.66667, 0.66667, 1)";
			wrapper.style.top = "-" + bottom + "px";

			await sleep(200);

			wrapper.style.position = "";
			wrapper.style.transition = "";
			wrapper.style.top = "";

			banner.classList.remove('tempBanner');

			await gameBanner();

			setCanvasSize();
		} else {
			setCanvasSize();
		}
	} else {
		banner.innerHTML = '';
		banner.style.backgroundColor = '';
		banner.style.color = '';
		wrapper.classList.add('hidden');

		setCanvasSize();
	}
}