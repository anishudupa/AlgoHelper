import { useEffect, useState } from "react";
import { BarChart2, TrendingUp } from "lucide-react";
import {
	PieChart,
	Pie,
	Cell,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from "recharts";
import { progressApi } from "@/api/index";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/index";
import { useToast } from "@/components/ui/toast";

const DIFF_COLORS = { Easy: "#22c55e", Medium: "#f59e0b", Hard: "#ef4444" };
const STATUS_COLORS = {
	understood: "#22c55e",
	needs_practice: "#f59e0b",
	unseen: "#94a3b8",
};

export default function ProgressPage() {
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const { toast } = useToast();

	useEffect(() => {
		progressApi
			.getStats()
			.then(({ data }) => setStats(data.data))
			.catch(() =>
				toast({ title: "Failed to load stats", variant: "destructive" }),
			)
			.finally(() => setLoading(false));
	}, []);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
			</div>
		);
	}

	if (!stats) return null;

	const difficultyData = stats.byDifficulty.map((d) => ({
		name: d._id,
		value: d.count,
	}));
	const statusData = stats.byStatus.map((s) => ({
		name: s._id.replace("_", " "),
		value: s.count,
		key: s._id,
	}));
	const tagData = stats.topTags.map((t) => ({ name: t._id, count: t.count }));

	const revisionMap = {};
	stats.revisionLast30Days.forEach((r) => (revisionMap[r._id] = r.count));
	const understood = revisionMap["understood"] || 0;
	const needsPractice = revisionMap["needs_practice"] || 0;
	const totalRevisions = understood + needsPractice;
	const successRate =
		totalRevisions > 0 ? Math.round((understood / totalRevisions) * 100) : 0;

	return (
		<div className="max-w-5xl mx-auto p-6">
			<div className="flex items-center gap-2 mb-6">
				<BarChart2 className="h-6 w-6 text-primary" />
				<h1 className="text-2xl font-bold">Progress</h1>
			</div>

			{/* Summary cards */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
				{[
					{
						label: "Total Problems",
						value: stats.totalQuestions,
						color: "text-primary",
					},
					{
						label: "Understood",
						value:
							stats.byStatus.find((s) => s._id === "understood")?.count || 0,
						color: "text-green-600",
					},
					{
						label: "Needs Practice",
						value:
							stats.byStatus.find((s) => s._id === "needs_practice")?.count ||
							0,
						color: "text-yellow-600",
					},
					{
						label: "Success Rate (30d)",
						value: `${successRate}%`,
						color: "text-blue-600",
					},
				].map(({ label, value, color }) => (
					<Card key={label}>
						<CardContent className="p-4">
							<p className="text-sm text-muted-foreground">{label}</p>
							<p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid md:grid-cols-2 gap-4 mb-4">
				{/* Difficulty breakdown */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">By Difficulty</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={200}>
							<PieChart>
								<Pie
									data={difficultyData}
									cx="50%"
									cy="50%"
									innerRadius={50}
									outerRadius={80}
									paddingAngle={3}
									dataKey="value">
									{difficultyData.map((entry) => (
										<Cell
											key={entry.name}
											fill={DIFF_COLORS[entry.name] || "#94a3b8"}
										/>
									))}
								</Pie>
								<Tooltip />
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				{/* Revision status */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Revision Status</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={200}>
							<PieChart>
								<Pie
									data={statusData}
									cx="50%"
									cy="50%"
									innerRadius={50}
									outerRadius={80}
									paddingAngle={3}
									dataKey="value">
									{statusData.map((entry) => (
										<Cell
											key={entry.key}
											fill={STATUS_COLORS[entry.key] || "#94a3b8"}
										/>
									))}
								</Pie>
								<Tooltip />
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>

			{/* Top tags */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Top Tags</CardTitle>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer width="100%" height={220}>
						<BarChart
							data={tagData}
							layout="vertical"
							margin={{ left: 20, right: 20 }}>
							<XAxis type="number" hide />
							<YAxis
								type="category"
								dataKey="name"
								width={100}
								tick={{ fontSize: 12 }}
							/>
							<Tooltip />
							<Bar
								dataKey="count"
								fill="hsl(var(--primary))"
								radius={[0, 4, 4, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>
		</div>
	);
}
