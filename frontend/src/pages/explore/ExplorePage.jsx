import { useEffect, useState } from "react";
import { Search, Bookmark, BookmarkCheck, Eye } from "lucide-react";
import { exploreApi, bookmarksApi } from "@/api/index";
import { Button } from "@/components/ui/button";
import { Input, Badge, Card, CardContent } from "@/components/ui/index";
import { useToast } from "@/components/ui/toast";
import { useNavigate } from "react-router-dom";

const DIFFICULTY_VARIANT = { Easy: "easy", Medium: "medium", Hard: "hard" };

export default function ExplorePage() {
	const [questions, setQuestions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState("");
	const [difficulty, setDifficulty] = useState("");
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const { toast } = useToast();
	const navigate = useNavigate();

	const fetchQuestions = async () => {
		setLoading(true);
		try {
			const { data } = await exploreApi.getQuestions({
				search,
				difficulty,
				page,
				limit: 20,
			});
			setQuestions(data.data);
			setTotalPages(data.pages);
		} catch {
			toast({ title: "Failed to load questions", variant: "destructive" });
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchQuestions();
	}, [search, difficulty, page]);

	const toggleBookmark = async (q) => {
		try {
			if (q.isBookmarked) {
				await bookmarksApi.remove(q._id);
				toast({ title: "Bookmark removed" });
			} else {
				await bookmarksApi.add(q._id);
				toast({ title: "Bookmarked!" });
			}
			setQuestions((prev) =>
				prev.map((item) =>
					item._id === q._id
						? { ...item, isBookmarked: !item.isBookmarked }
						: item,
				),
			);
		} catch (err) {
			toast({
				title: "Error",
				description: err.response?.data?.message,
				variant: "destructive",
			});
		}
	};

	return (
		<div className="max-w-4xl mx-auto p-6">
			<h1 className="text-2xl font-bold mb-1">Explore</h1>
			<p className="text-muted-foreground text-sm mb-6">
				Discover and bookmark approaches from the community.
			</p>

			{/* Filters */}
			<div className="flex items-center gap-3 mb-4">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search questions..."
						className="pl-9"
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(1);
						}}
					/>
				</div>
				<div className="flex gap-1.5">
					{["", "Easy", "Medium", "Hard"].map((d) => (
						<Button
							key={d}
							variant={difficulty === d ? "default" : "outline"}
							size="sm"
							onClick={() => {
								setDifficulty(d);
								setPage(1);
							}}>
							{d || "All"}
						</Button>
					))}
				</div>
			</div>

			<Card>
				<CardContent className="p-2">
					{loading ? (
						<div className="flex justify-center py-12">
							<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
						</div>
					) : questions.length === 0 ? (
						<p className="text-center py-12 text-muted-foreground">
							No public questions found.
						</p>
					) : (
						questions.map((q) => (
							<div
								key={q._id}
								className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 rounded-lg group">
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<span className="font-medium truncate">{q.title}</span>
									</div>
									<div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
										<span>by {q.owner?.username}</span>
										{q.group && (
											<>
												<span>·</span>
												<span>{q.group.name}</span>
											</>
										)}
									</div>
									<div className="flex gap-1 mt-1 flex-wrap">
										{q.tags.map((tag) => (
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
										className="h-8 w-8"
										onClick={() => toggleBookmark(q)}>
										{q.isBookmarked ? (
											<BookmarkCheck className="h-3.5 w-3.5 text-primary" />
										) : (
											<Bookmark className="h-3.5 w-3.5" />
										)}
									</Button>
								</div>
							</div>
						))
					)}
				</CardContent>
			</Card>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex justify-center gap-2 mt-4">
					<Button
						variant="outline"
						size="sm"
						disabled={page === 1}
						onClick={() => setPage((p) => p - 1)}>
						Previous
					</Button>
					<span className="flex items-center text-sm text-muted-foreground">
						Page {page} of {totalPages}
					</span>
					<Button
						variant="outline"
						size="sm"
						disabled={page === totalPages}
						onClick={() => setPage((p) => p + 1)}>
						Next
					</Button>
				</div>
			)}
		</div>
	);
}
