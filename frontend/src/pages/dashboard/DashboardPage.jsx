import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Pencil, Trash2, Eye } from "lucide-react";
import { useQuestionStore } from "@/store/questionStore";
import { useGroupStore } from "@/store/groupStore";
import { Button } from "@/components/ui/button";
import { Input, Badge, Card, CardContent } from "@/components/ui/index";
import { useToast } from "@/components/ui/toast";
import QuestionDialog from "@/components/shared/QuestionDialog";

const DIFFICULTY_VARIANT = { Easy: "easy", Medium: "medium", Hard: "hard" };

function QuestionRow({ question, onEdit, onDelete }) {
	const navigate = useNavigate();
	return (
		<div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 rounded-lg transition-colors group">
			<div className="flex-1 min-w-0">
				<button
					onClick={() => navigate(`/questions/${question._id}`)}
					className="font-medium hover:text-primary text-left truncate block">
					{question.title}
				</button>
				<div className="flex items-center gap-1.5 mt-1 flex-wrap">
					{question.tags.map((tag) => (
						<span
							key={tag}
							className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
							{tag}
						</span>
					))}
				</div>
			</div>

			<Badge variant={DIFFICULTY_VARIANT[question.difficulty]}>
				{question.difficulty}
			</Badge>

			<div
				className={`w-2 h-2 rounded-full shrink-0 ${
					question.revisionStatus === "understood"
						? "bg-green-500"
						: question.revisionStatus === "needs_practice"
							? "bg-yellow-500"
							: "bg-gray-300"
				}`}
				title={question.revisionStatus}
			/>

			<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					onClick={() => navigate(`/questions/${question._id}`)}>
					<Eye className="h-3.5 w-3.5" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					onClick={() => onEdit(question)}>
					<Pencil className="h-3.5 w-3.5" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 hover:text-destructive"
					onClick={() => onDelete(question._id)}>
					<Trash2 className="h-3.5 w-3.5" />
				</Button>
			</div>
		</div>
	);
}

export default function DashboardPage() {
	const [searchParams] = useSearchParams();
	const groupId = searchParams.get("group");
	const [search, setSearch] = useState("");
	const [diffFilter, setDiffFilter] = useState("");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editQuestion, setEditQuestion] = useState(null);

	const { questions, fetchQuestions, deleteQuestion, isLoading } =
		useQuestionStore();
	const { groups } = useGroupStore();
	const { toast } = useToast();

	useEffect(() => {
		const params = {};
		if (groupId) params.group = groupId;
		if (diffFilter) params.difficulty = diffFilter;
		if (search) params.search = search;
		fetchQuestions(params);
	}, [groupId, diffFilter, search, fetchQuestions]);

	const handleDelete = async (id) => {
		if (!confirm("Delete this question?")) return;
		const res = await deleteQuestion(id);
		if (res.success) toast({ title: "Question deleted" });
		else
			toast({
				title: "Error",
				description: res.message,
				variant: "destructive",
			});
	};

	const handleEdit = (q) => {
		setEditQuestion(q);
		setDialogOpen(true);
	};

	// Find active group name for heading
	const activeGroupName = findGroup(groups, groupId)?.name;

	return (
		<div className="p-6 max-w-5xl mx-auto">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-2xl font-bold">
						{activeGroupName || "All Questions"}
					</h1>
					<p className="text-muted-foreground text-sm mt-0.5">
						{questions.length} question{questions.length !== 1 ? "s" : ""}
					</p>
				</div>
				<Button
					onClick={() => {
						setEditQuestion(null);
						setDialogOpen(true);
					}}>
					<Plus className="h-4 w-4 mr-2" /> Add Question
				</Button>
			</div>

			{/* Filters */}
			<div className="flex items-center gap-3 mb-4">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search questions..."
						className="pl-9"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
				<div className="flex gap-1.5">
					{["", "Easy", "Medium", "Hard"].map((d) => (
						<Button
							key={d}
							variant={diffFilter === d ? "default" : "outline"}
							size="sm"
							onClick={() => setDiffFilter(d)}>
							{d || "All"}
						</Button>
					))}
				</div>
			</div>

			{/* Questions list */}
			<Card>
				<CardContent className="p-2">
					{isLoading ? (
						<div className="flex justify-center py-12">
							<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
						</div>
					) : questions.length === 0 ? (
						<div className="text-center py-12 text-muted-foreground">
							<p className="mb-2">No questions found.</p>
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									setEditQuestion(null);
									setDialogOpen(true);
								}}>
								<Plus className="h-4 w-4 mr-1" /> Add your first question
							</Button>
						</div>
					) : (
						questions.map((q) => (
							<QuestionRow
								key={q._id}
								question={q}
								onEdit={handleEdit}
								onDelete={handleDelete}
							/>
						))
					)}
				</CardContent>
			</Card>

			<QuestionDialog
				open={dialogOpen}
				onClose={() => {
					setDialogOpen(false);
					setEditQuestion(null);
				}}
				question={editQuestion}
				defaultGroupId={groupId}
			/>
		</div>
	);
}

function findGroup(groups, id) {
	if (!id) return null;
	for (const g of groups) {
		if (g._id === id) return g;
		if (g.children) {
			const found = findGroup(g.children, id);
			if (found) return found;
		}
	}
	return null;
}
