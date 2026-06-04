import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
	ArrowLeft,
	Save,
	ExternalLink,
	Bold,
	Italic,
	Code,
	List,
	ListOrdered,
} from "lucide-react";
import { useQuestionStore } from "@/store/questionStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/index";
import { useToast } from "@/components/ui/toast";

const DIFFICULTY_VARIANT = { Easy: "easy", Medium: "medium", Hard: "hard" };

const APPROACH_TEMPLATE = {
	type: "doc",
	content: [
		{
			type: "heading",
			attrs: { level: 2 },
			content: [{ type: "text", text: "🧠 Intuition" }],
		},
		{
			type: "paragraph",
			content: [{ type: "text", text: "Describe the key insight here..." }],
		},
		{
			type: "heading",
			attrs: { level: 2 },
			content: [{ type: "text", text: "🐢 Brute Force" }],
		},
		{
			type: "paragraph",
			content: [{ type: "text", text: "Explain the naive approach..." }],
		},
		{
			type: "heading",
			attrs: { level: 2 },
			content: [{ type: "text", text: "⚡ Optimized Approach" }],
		},
		{
			type: "paragraph",
			content: [{ type: "text", text: "Explain the optimized solution..." }],
		},
		{
			type: "heading",
			attrs: { level: 2 },
			content: [{ type: "text", text: "⏱ Time Complexity" }],
		},
		{ type: "paragraph", content: [{ type: "text", text: "O(?)" }] },
		{
			type: "heading",
			attrs: { level: 2 },
			content: [{ type: "text", text: "📦 Space Complexity" }],
		},
		{ type: "paragraph", content: [{ type: "text", text: "O(?)" }] },
		{
			type: "heading",
			attrs: { level: 2 },
			content: [{ type: "text", text: "❌ Mistakes / Edge Cases" }],
		},
		{
			type: "paragraph",
			content: [{ type: "text", text: "Common pitfalls..." }],
		},
	],
};

function ToolbarButton({ onClick, active, children, title }) {
	return (
		<button
			type="button"
			title={title}
			onClick={onClick}
			className={`p-1.5 rounded text-sm transition-colors ${
				active
					? "bg-primary text-primary-foreground"
					: "hover:bg-muted text-muted-foreground hover:text-foreground"
			}`}>
			{children}
		</button>
	);
}

export default function QuestionPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { currentQuestion, fetchQuestion, updateQuestion, isLoading } =
		useQuestionStore();
	const { toast } = useToast();
	const [saving, setSaving] = useState(false);

	const editor = useEditor({
		extensions: [
			StarterKit,
			Placeholder.configure({ placeholder: "Start writing your approach..." }),
		],
		content: null,
	});

	useEffect(() => {
		fetchQuestion(id);
	}, [id, fetchQuestion]);

	useEffect(() => {
		if (currentQuestion && editor) {
			editor.commands.setContent(currentQuestion.approach || APPROACH_TEMPLATE);
		}
	}, [currentQuestion, editor]);

	const handleSave = async () => {
		if (!editor) return;
		setSaving(true);
		const res = await updateQuestion(id, { approach: editor.getJSON() });
		setSaving(false);
		if (res.success) toast({ title: "Approach saved ✓" });
		else
			toast({
				title: "Save failed",
				description: res.message,
				variant: "destructive",
			});
	};

	if (isLoading || !currentQuestion) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
			</div>
		);
	}

	const q = currentQuestion;

	return (
		<div className="max-w-4xl mx-auto p-6">
			{/* Back + header */}
			<div className="flex items-start gap-4 mb-6">
				<Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div className="flex-1">
					<div className="flex items-center gap-3 flex-wrap">
						<h1 className="text-2xl font-bold">{q.title}</h1>
						<Badge variant={DIFFICULTY_VARIANT[q.difficulty]}>
							{q.difficulty}
						</Badge>
						{q.isPublic && <Badge variant="secondary">Public</Badge>}
					</div>
					<div className="flex items-center gap-2 mt-2 flex-wrap">
						{q.tags.map((tag) => (
							<span
								key={tag}
								className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
								{tag}
							</span>
						))}
						{q.sourceUrl && (
							<a
								href={q.sourceUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-xs text-primary flex items-center gap-1 hover:underline">
								<ExternalLink className="h-3 w-3" /> View Problem
							</a>
						)}
					</div>
				</div>
				<Button onClick={handleSave} disabled={saving} size="sm">
					<Save className="h-4 w-4 mr-1.5" />
					{saving ? "Saving..." : "Save"}
				</Button>
			</div>

			{/* Editor card */}
			<div className="border rounded-lg bg-card shadow-sm">
				{/* Toolbar */}
				{editor && (
					<div className="flex items-center gap-0.5 p-2 border-b flex-wrap">
						<ToolbarButton
							onClick={() => editor.chain().focus().toggleBold().run()}
							active={editor.isActive("bold")}
							title="Bold">
							<Bold className="h-4 w-4" />
						</ToolbarButton>
						<ToolbarButton
							onClick={() => editor.chain().focus().toggleItalic().run()}
							active={editor.isActive("italic")}
							title="Italic">
							<Italic className="h-4 w-4" />
						</ToolbarButton>
						<ToolbarButton
							onClick={() => editor.chain().focus().toggleCode().run()}
							active={editor.isActive("code")}
							title="Inline code">
							<Code className="h-4 w-4" />
						</ToolbarButton>
						<div className="w-px h-5 bg-border mx-1" />
						<ToolbarButton
							onClick={() => editor.chain().focus().toggleBulletList().run()}
							active={editor.isActive("bulletList")}
							title="Bullet list">
							<List className="h-4 w-4" />
						</ToolbarButton>
						<ToolbarButton
							onClick={() => editor.chain().focus().toggleOrderedList().run()}
							active={editor.isActive("orderedList")}
							title="Ordered list">
							<ListOrdered className="h-4 w-4" />
						</ToolbarButton>
						<div className="w-px h-5 bg-border mx-1" />
						{[1, 2, 3].map((level) => (
							<ToolbarButton
								key={level}
								onClick={() =>
									editor.chain().focus().toggleHeading({ level }).run()
								}
								active={editor.isActive("heading", { level })}
								title={`Heading ${level}`}>
								<span className="text-xs font-bold">H{level}</span>
							</ToolbarButton>
						))}
						<ToolbarButton
							onClick={() => editor.chain().focus().toggleCodeBlock().run()}
							active={editor.isActive("codeBlock")}
							title="Code block">
							<span className="text-xs font-mono">{"{}"}</span>
						</ToolbarButton>
					</div>
				)}
				<div className="tiptap-editor">
					<EditorContent editor={editor} />
				</div>
			</div>
		</div>
	);
}
