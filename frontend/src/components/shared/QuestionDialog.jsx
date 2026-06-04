import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useQuestionStore } from "@/store/questionStore";
import { useGroupStore } from "@/store/groupStore";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/index";
import { useToast } from "@/components/ui/toast";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export default function QuestionDialog({
	open,
	onClose,
	question = null,
	defaultGroupId = null,
}) {
	const [form, setForm] = useState({
		title: "",
		difficulty: "Medium",
		tags: "",
		sourceUrl: "",
		group: "",
		isPublic: false,
	});
	const [loading, setLoading] = useState(false);
	const { createQuestion, updateQuestion, fetchQuestions } = useQuestionStore();
	const { groups } = useGroupStore();
	const { toast } = useToast();

	const flatGroups = flattenGroups(groups);

	useEffect(() => {
		if (question) {
			setForm({
				title: question.title,
				difficulty: question.difficulty,
				tags: question.tags.join(", "),
				sourceUrl: question.sourceUrl || "",
				group: question.group?._id || question.group || "",
				isPublic: question.isPublic || false,
			});
		} else {
			setForm({
				title: "",
				difficulty: "Medium",
				tags: "",
				sourceUrl: "",
				group: defaultGroupId || "",
				isPublic: false,
			});
		}
	}, [question, defaultGroupId, open]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!form.group) {
			toast({ title: "Select a group", variant: "destructive" });
			return;
		}
		setLoading(true);
		const payload = {
			...form,
			tags: form.tags
				.split(",")
				.map((t) => t.trim())
				.filter(Boolean),
		};
		const res = question
			? await updateQuestion(question._id, payload)
			: await createQuestion(payload);
		setLoading(false);
		if (res.success) {
			toast({ title: question ? "Question updated" : "Question created" });
			fetchQuestions(defaultGroupId ? { group: defaultGroupId } : {});
			onClose();
		} else {
			toast({
				title: "Error",
				description: res.message,
				variant: "destructive",
			});
		}
	};

	return (
		<Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
				<Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-background rounded-lg shadow-xl p-6 w-full max-w-lg">
					<div className="flex items-center justify-between mb-4">
						<Dialog.Title className="text-lg font-semibold">
							{question ? "Edit Question" : "Add Question"}
						</Dialog.Title>
						<button onClick={onClose}>
							<X className="h-4 w-4" />
						</button>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-1.5">
							<Label>Title</Label>
							<Input
								placeholder="e.g. Target Sum"
								value={form.title}
								onChange={(e) => setForm({ ...form, title: e.target.value })}
								required
							/>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label>Difficulty</Label>
								<select
									className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
									value={form.difficulty}
									onChange={(e) =>
										setForm({ ...form, difficulty: e.target.value })
									}>
									{DIFFICULTIES.map((d) => (
										<option key={d}>{d}</option>
									))}
								</select>
							</div>
							<div className="space-y-1.5">
								<Label>Group</Label>
								<select
									className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
									value={form.group}
									onChange={(e) => setForm({ ...form, group: e.target.value })}
									required>
									<option value="">Select group...</option>
									{flatGroups.map((g) => (
										<option key={g._id} value={g._id}>
											{"  ".repeat(g.depth)}
											{g.name}
										</option>
									))}
								</select>
							</div>
						</div>

						<div className="space-y-1.5">
							<Label>Tags (comma separated)</Label>
							<Input
								placeholder="dp, knapsack, recursion"
								value={form.tags}
								onChange={(e) => setForm({ ...form, tags: e.target.value })}
							/>
						</div>

						<div className="space-y-1.5">
							<Label>Source URL (optional)</Label>
							<Input
								placeholder="https://leetcode.com/problems/..."
								value={form.sourceUrl}
								onChange={(e) =>
									setForm({ ...form, sourceUrl: e.target.value })
								}
							/>
						</div>

						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								id="public"
								checked={form.isPublic}
								onChange={(e) =>
									setForm({ ...form, isPublic: e.target.checked })
								}
							/>
							<Label htmlFor="public" className="cursor-pointer">
								Make public (visible in Explore)
							</Label>
						</div>

						<div className="flex gap-2 justify-end pt-2">
							<Button type="button" variant="outline" onClick={onClose}>
								Cancel
							</Button>
							<Button type="submit" disabled={loading}>
								{loading
									? "Saving..."
									: question
										? "Save Changes"
										: "Add Question"}
							</Button>
						</div>
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

function flattenGroups(groups, depth = 0) {
	return groups.reduce((acc, g) => {
		acc.push({ ...g, depth });
		if (g.children?.length) acc.push(...flattenGroups(g.children, depth + 1));
		return acc;
	}, []);
}
