import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
	Brain,
	ChevronRight,
	Eye,
	CheckCircle2,
	XCircle,
	RotateCcw,
} from "lucide-react";
import { revisionApi } from "@/api/index";
import { useGroupStore } from "@/store/groupStore";
import { Button } from "@/components/ui/button";
import { Badge, Card, CardContent } from "@/components/ui/index";
import { useToast } from "@/components/ui/toast";

const DIFFICULTY_VARIANT = { Easy: "easy", Medium: "medium", Hard: "hard" };
const MODES = [
	{ value: "all", label: "All Questions" },
	{ value: "needs_practice", label: "Needs Practice" },
	{ value: "unseen", label: "Unseen Only" },
];

function ApproachViewer({ content }) {
	const editor = useEditor({
		extensions: [StarterKit],
		content,
		editable: false,
	});
	return (
		<div className="tiptap-editor border rounded-lg bg-muted/30">
			<EditorContent editor={editor} />
		</div>
	);
}

export default function RevisionPage() {
	const [selectedGroup, setSelectedGroup] = useState("");
	const [mode, setMode] = useState("all");
	const [phase, setPhase] = useState("select"); // select | question | revealed | done
	const [question, setQuestion] = useState(null);
	const [approach, setApproach] = useState(null);
	const [stats, setStats] = useState({ understood: 0, needs_practice: 0 });
	const [loading, setLoading] = useState(false);

	const { groups } = useGroupStore();
	const { toast } = useToast();
	const flatGroups = flattenGroups(groups);

	const startRevision = () => {
		if (!selectedGroup) {
			toast({ title: "Select a group first", variant: "destructive" });
			return;
		}
		setStats({ understood: 0, needs_practice: 0 });
		setPhase("question");
		loadNext();
	};

	const loadNext = async () => {
		setLoading(true);
		setApproach(null);
		try {
			const { data } = await revisionApi.getNext({
				group: selectedGroup,
				mode,
			});
			if (!data.data) {
				setPhase("done");
				return;
			}
			setQuestion(data.data);
			setPhase("question");
		} catch {
			toast({ title: "Failed to load question", variant: "destructive" });
		} finally {
			setLoading(false);
		}
	};

	const reveal = async () => {
		setLoading(true);
		try {
			const { data } = await revisionApi.reveal(question._id);
			setApproach(data.data.approach);
			setPhase("revealed");
		} catch {
			toast({ title: "Failed to reveal approach", variant: "destructive" });
		} finally {
			setLoading(false);
		}
	};

	const mark = async (result) => {
		try {
			await revisionApi.mark(question._id, { result, groupId: selectedGroup });
			setStats((s) => ({ ...s, [result]: s[result] + 1 }));
			loadNext();
		} catch {
			toast({ title: "Failed to mark question", variant: "destructive" });
		}
	};

	// --- SELECT PHASE ---
	if (phase === "select") {
		return (
			<div className="max-w-xl mx-auto p-6">
				<div className="flex items-center gap-2 mb-8">
					<Brain className="h-6 w-6 text-primary" />
					<h1 className="text-2xl font-bold">Revision Mode</h1>
				</div>

				<Card>
					<CardContent className="p-6 space-y-5">
						<div className="space-y-2">
							<label className="text-sm font-medium">Select Group</label>
							<select
								className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
								value={selectedGroup}
								onChange={(e) => setSelectedGroup(e.target.value)}>
								<option value="">Choose a group...</option>
								{flatGroups.map((g) => (
									<option key={g._id} value={g._id}>
										{"  ".repeat(g.depth)}
										{g.name}
									</option>
								))}
							</select>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Mode</label>
							<div className="flex flex-col gap-2">
								{MODES.map((m) => (
									<label
										key={m.value}
										className="flex items-center gap-2 cursor-pointer">
										<input
											type="radio"
											name="mode"
											value={m.value}
											checked={mode === m.value}
											onChange={() => setMode(m.value)}
										/>
										<span className="text-sm">{m.label}</span>
									</label>
								))}
							</div>
						</div>

						<Button onClick={startRevision} className="w-full">
							Start Revision <ChevronRight className="h-4 w-4 ml-1" />
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// --- DONE PHASE ---
	if (phase === "done") {
		const total = stats.understood + stats.needs_practice;
		return (
			<div className="max-w-md mx-auto p-6 text-center">
				<div className="text-5xl mb-4">🎉</div>
				<h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
				<p className="text-muted-foreground mb-6">
					No more questions in this group/mode.
				</p>
				<div className="grid grid-cols-2 gap-4 mb-8">
					<div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
						<p className="text-2xl font-bold text-green-600">
							{stats.understood}
						</p>
						<p className="text-sm text-green-700 dark:text-green-400">
							Understood
						</p>
					</div>
					<div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
						<p className="text-2xl font-bold text-yellow-600">
							{stats.needs_practice}
						</p>
						<p className="text-sm text-yellow-700 dark:text-yellow-400">
							Needs Practice
						</p>
					</div>
				</div>
				<div className="flex gap-3 justify-center">
					<Button variant="outline" onClick={() => setPhase("select")}>
						<RotateCcw className="h-4 w-4 mr-2" /> New Session
					</Button>
					<Button
						onClick={() => {
							setMode("needs_practice");
							startRevision();
						}}>
						Practice Weak Ones
					</Button>
				</div>
			</div>
		);
	}

	// --- QUESTION / REVEALED PHASE ---
	return (
		<div className="max-w-2xl mx-auto p-6">
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-2">
					<Brain className="h-5 w-5 text-primary" />
					<span className="font-semibold">Revision</span>
				</div>
				<div className="flex items-center gap-3 text-sm text-muted-foreground">
					<span className="flex items-center gap-1 text-green-600">
						<CheckCircle2 className="h-4 w-4" /> {stats.understood}
					</span>
					<span className="flex items-center gap-1 text-yellow-600">
						<XCircle className="h-4 w-4" /> {stats.needs_practice}
					</span>
					<Button variant="ghost" size="sm" onClick={() => setPhase("select")}>
						<RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
					</Button>
				</div>
			</div>

			{loading ? (
				<div className="flex justify-center py-20">
					<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
				</div>
			) : (
				question && (
					<Card>
						<CardContent className="p-6">
							<div className="flex items-start justify-between gap-3 mb-6">
								<h2 className="text-xl font-bold">{question.title}</h2>
								<Badge variant={DIFFICULTY_VARIANT[question.difficulty]}>
									{question.difficulty}
								</Badge>
							</div>

							<div className="flex gap-1.5 flex-wrap mb-6">
								{question.tags.map((tag) => (
									<span
										key={tag}
										className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
										{tag}
									</span>
								))}
							</div>

							{phase === "question" && (
								<div className="text-center py-8 border-t">
									<p className="text-muted-foreground mb-4 text-sm">
										Think through your approach, then reveal when ready.
									</p>
									<Button onClick={reveal} className="gap-2">
										<Eye className="h-4 w-4" /> Reveal Approach
									</Button>
								</div>
							)}

							{phase === "revealed" && approach && (
								<div className="border-t pt-4">
									<ApproachViewer content={approach} />
									<div className="flex gap-3 justify-center mt-6">
										<Button
											variant="outline"
											onClick={() => mark("needs_practice")}
											className="gap-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20">
											<XCircle className="h-4 w-4" /> Needs Practice
										</Button>
										<Button
											onClick={() => mark("understood")}
											className="gap-2 bg-green-600 hover:bg-green-700 text-white">
											<CheckCircle2 className="h-4 w-4" /> Understood
										</Button>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				)
			)}
		</div>
	);
}

function flattenGroups(groups, depth = 0) {
	return groups.reduce((acc, g) => {
		acc.push({ ...g, depth });
		if (g.children?.length) acc.push(...flattenGroups(g.children, depth + 1));
		return acc;
	}, []);
}
