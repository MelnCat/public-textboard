import "./background.css";

const backgroundRoot = document.getElementById("background")! as HTMLCanvasElement;
const BACKGROUND_COUNT = 3;
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[];:'\"<>?,./`~\\|{}-=";
const backgrounds = [...Array(BACKGROUND_COUNT)].map((_, i) => [...Array(80)].map(() => [...Array(25 + 20 * (BACKGROUND_COUNT - i))].map(() => chars[Math.floor(Math.random() * chars.length)]).join("")));

const ctx = backgroundRoot.getContext("2d")!;


const render = () => {
	ctx.canvas.width  = window.innerWidth;
	ctx.canvas.height = window.innerHeight;
	ctx.globalCompositeOperation = "destination-over";
	ctx.clearRect(0, 0, backgroundRoot.width, backgroundRoot.height);
	for (const [i, background] of [...backgrounds.entries()].reverse()) {
		const fontSize = i * 40 + 40;
		ctx.save();
		ctx.textBaseline = "hanging";
		ctx.font = `${fontSize}px monospace`;
		const brightness =window.matchMedia('(prefers-color-scheme: light)').matches ? [0.8, 0.5, 0.2][i] : [0.2, 0.5, 0.8][i];
		ctx.fillStyle = `rgb(${brightness * 256}, ${brightness * 256}, ${brightness * 256})`;
		for (const [j, line] of background.entries()) {
			ctx.fillText(line, 0, fontSize * j - 0.2 * (i + 1) * window.scrollY);
		}
		ctx.restore();

	}
}
requestAnimationFrame(render);

window.addEventListener("resize", render);
window.addEventListener("scroll", render);