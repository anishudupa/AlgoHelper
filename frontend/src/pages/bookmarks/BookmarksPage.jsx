import { useEffect, useState } from "react";
import { BookMarked, Trash2, Eye } from "lucide-react";
import { bookmarksApi } from "@/api/index";
import { Button } from "@/components/ui/button";
import { Badge, Card, CardContent } from "@/components/ui/index";
import { useToast } from "@/components/ui/toast";
import { useNavigate } from "react-router-dom";

const DIFFICULTY_VARIANT = { Easy: "easy", Medium: "medium", Hard: "hard" };

export default function BookmarksPage() {
	const [bookmarks, setBookmarks] = useState([]);
	const [loading, setLoading] = useState(true);
	const { toast } = useToast();
	const navigate = useNavigate();

	const fetchBookmarks = async () => {
		setLoading(true);
		try {
			const { data } = await bookmarksApi.getAll();
			setBookmarks(data.data);
		} catch {
			toast({ title: "Failed to load bookmarks", variant: "destructive" });
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchBookmarks();
	}, []);

	const removeBookmark = async (questionId) => {
		try {
			await bookmarksApi.remove(questionId);
			setBookmarks((prev) => prev.filter((b) => b.question._id !== questionId));
			toast({ title: "Bookmark removed" });
		} catch {
			toast({ title: "Error removing bookmark", variant: "destructive" });
		}
	};

	return (
		<div className="max-w-4xl mx-auto p-6">
			<div className="flex items-center gap-2 mb-1">
				<BookMarked className="h-6 w-6 text-primary" />
				<h1 className="text-2xl font-bold">Bookmarks</h1>
			</div>
			<p className="text-muted-foreground text-sm mb-6">
				Your saved questions reading list.
			</p>

			<Card>
				<CardContent className="p-2">
					{loading ? (
						<div className="flex justify-center py-12">
							<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
						</div>
					) : bookmarks.length === 0 ? (
						<div className="text-center py-12 text-muted-foreground">
							<BookMarked className="h-12 w-12 mx-auto mb-3 opacity-20" />
							<p>No bookmarks yet.</p>
							<p className="text-sm mt-1">
								Explore public questions and bookmark the ones you want to
								revisit.
							</p>
							<Button
								variant="outline"
								size="sm"
								className="mt-4"
								onClick={() => navigate("/explore")}>
								Go to Explore
							</Button>
						</div>
					) : (
						bookmarks.map((b) => {
							const q = b.question;
							return (
								<div
									key={b._id}
									className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 rounded-lg group">
									<div className="flex-1 min-w-0">
										<div className="font-medium truncate">{q.title}</div>
										<div className="text-xs text-muted-foreground mt-0.5">
											by {q.owner?.username}
										</div>
										<div className="flex gap-1 mt-1 flex-wrap">
											{q.tags?.map((tag) => (
												<span
													key={tag}
													className="text-xs bg-muted px-1.5 py-0.5 rounded">
													{tag}
												</span>
											))}
										</div>
									</div>
									<Badge variant={DIFFICULTY_VARIANT[q.difficulty]}>
										{q.difficulty}
									</Badge>
									<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8"
											onClick={() => navigate(`/explore/questions/${q._id}`)}>
											<Eye className="h-3.5 w-3.5" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 hover:text-destructive"
											onClick={() => removeBookmark(q._id)}>
											<Trash2 className="h-3.5 w-3.5" />
										</Button>
									</div>
								</div>
							);
						})
					)}
				</CardContent>
			</Card>
		</div>
	);
}
