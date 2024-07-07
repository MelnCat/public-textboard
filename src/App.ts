import "./App.css";
import { socket } from "./socket";

const grid = document.getElementById("grid")!;
let data: string[][] = [];
let selections: { x: number; y: number; color: string }[] = [];
let selected: { x: number; y: number } | null = null;

const gridElements: Record<`${number},${number}`, HTMLElement> = {};

const updateSelections = (previous: { x: number; y: number; color: string }[], next: { x: number; y: number; color: string }[]) => {
	for (const { x, y } of previous) {
		gridElements[`${x},${y}`].removeAttribute("data-selected");
	}
	for (const { x, y, color } of next) {
		if (selected?.x === x && selected?.y === y) continue;
		gridElements[`${x},${y}`].setAttribute("data-selected", "true");
		gridElements[`${x},${y}`].style["--selection-color"] = color;
	}
};
const updateSelected = (previous: { x: number; y: number } | null, next: { x: number; y: number } | null) => {
	if (previous !== null) {
		gridElements[`${previous.x},${previous.y}`].removeAttribute("data-selected");
	}
	if (next !== null) {
		gridElements[`${next.x},${next.y}`].setAttribute("data-selected", "self");
	}
};
const updateData = (next: string[][]) => {
	for (let i = 0; i < next.length; i++) {
		for (let j = 0; j < next[i].length; j++) {
			gridElements[`${i},${j}`].innerText = next[i][j];
		}
	}
};
const set = (x: number, y: number, value: string) => {
	if (data === null) return;
	socket.emit("set", x, y, value);
	data[x][y] = value;
	gridElements[`${x},${y}`].innerText = value;
};
const select = (x: number, y: number) => {
	updateSelected(selected, { x, y });
	selected = { x, y };
	socket.emit("select", x, y);
};
const deselect = () => {
	updateSelected(selected, null);
	selected = null;
	socket.emit("deselect");
};
const setSelections = (next: { x: number; y: number; color: string }[]) => {
	updateSelections(selections, next);
	selections = next;
};

for (let i = 0; i < 100; i++) {
	const row = document.createElement("div");
	row.className = "text-grid-row";
	grid.appendChild(row);
	for (let j = 0; j < 100; j++) {
		const item = document.createElement("div");
		item.className = "text-grid-item";
		item.addEventListener("click", () => {
			select(i, j);
		});
		row.appendChild(item);
		gridElements[`${i},${j}`] = item;
	}
}

socket.on("text", (next: string[][]) => {
	data = next;
	updateData(next);
});

socket.on("selections", setSelections);
socket.on("set", (x: number, y: number, value: string) => {
	data[x][y] = value;
	gridElements[`${x},${y}`].innerText = value;
});

document.addEventListener("keydown", e => {
	if (selected === null) return;
	if (e.getModifierState("Control") || e.getModifierState("Meta") || e.getModifierState("Alt")) return;
	e.preventDefault();
	const key = e.key;
	if (key === "Backspace") {
		select(selected.x, selected.y - 1);
		set(selected.x, selected.y, " ");
	} else if (key === "Enter") {
		select(selected.x + 1, 0);
	} else if (key === "ArrowUp") {
		select(selected.x - 1, selected.y);
	} else if (key === "ArrowDown") {
		select(selected.x + 1, selected.y);
	} else if (key === "ArrowLeft") {
		select(selected.x, selected.y - 1);
	} else if (key === "ArrowRight") {
		select(selected.x, selected.y + 1);
	} else if (key.length === 1) {
		set(selected.x, selected.y, key);
		select(selected.x, selected.y + 1);
	}
});
