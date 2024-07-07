import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { socket } from "./socket";
import { useEventListener } from "usehooks-ts";

const App = () => {
	const [data, setData] = useState<string[][] | null>(null);
	const [selections, setSelections] = useState<{ x: number; y: number }[]>([]);
	const [selected, setSelected] = useState<{ x: number; y: number } | null>(null);
	const select = useCallback(
		(x: number, y: number) => {
			setSelected({ x, y });
			socket.emit("select", x, y);
		},
		[setSelected]
	);
	const deselect = useCallback(() => {
		setSelected(null);
		socket.emit("deselect");
	}, [setSelected]);
	const set = useCallback(
		(x: number, y: number, value: string) => {
			if (data === null) return;
			socket.emit("set", x, y, value);
		},
		[data]
	);
	const onInput = useCallback(
		(e: KeyboardEvent) => {
			if (selected === null) return;
			if (e.getModifierState("Control") || e.getModifierState("Meta") || e.getModifierState("Alt")) return;
			e.preventDefault();
			const key = e.key;
			if (key === "Backspace") {
				set(selected.x, selected.y, " ");
				select(selected.x, selected.y - 1);
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
				console.log("GOT EHER");
				set(selected.x, selected.y, key);
				select(selected.x, selected.y + 1);
			}
		},
		[select, set, selected]
	);
	useEventListener("keydown", onInput);
	useEffect(() => {
		socket.on("text", setData);
		socket.on("selections", setSelections);
		socket.on("set", (x: number, y: number, value: string) => {
			setData(old => {
				if (old === null) return null;
				const copy = old.map(x => [...x]);
				copy[x][y] = value;
				return copy;
			})
		});
	}, []);

	return (
		<>
			<h1>todo</h1>
			<article className="text-grid">
				{data?.map((x, i) => (
					<div className="text-grid-row" key={i}>
						{x.map((y, j) => (
							<div key={`${i},${j}`} className="text-grid-item" data-selected={selections.some(s => s.x === i && s.y === j)} onClick={() => select(i, j)}>
								{y}
							</div>
						))}
					</div>
				))}
			</article>
		</>
	);
};

export default App;
