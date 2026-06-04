import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
	ChevronRight,
	ChevronDown,
	Plus,
	Folder,
	FolderOpen,
	LayoutDashboard,
	BookMarked,
	Compass,
	BarChart2,
	Brain,
	LogOut,
	Trash2,
	Pencil,
} from "lucide-react";
import { useGroupStore } from "@/store/groupStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import GroupDialog from "@/components/shared/GroupDialog";

// Recursive group tree node
function GroupNode({ group, depth = 0 }) {
	const [open, setOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const { deleteGroup } = useGroupStore();
	const { toast } = useToast();
	const navigate = useNavigate();
	const hasChildren = group.children?.length > 0;

	const handleDelete = async (e) => {
		e.stopPropagation();
		if (!confirm(`Delete "${group.name}" and all its questions?`)) return;
		const res = await deleteGroup(group._id);
		if (res.success) toast({ title: "Group deleted" });
		else
			toast({
				title: "Error",
				description: res.message,
				variant: "destructive",
			});
	};

	return (
		<div>
			<div
				className={cn(
					"group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent",
					"transition-colors",
				)}
				style={{ paddingLeft: `${(depth + 1) * 12}px` }}
				onClick={() => {
					if (hasChildren) setOpen(!open);
					navigate(`/dashboard?group=${group._id}`);
				}}>
				{hasChildren ? (
					open ? (
						<ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
					) : (
						<ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
					)
				) : (
					<span className="w-3" />
				)}
				{open ? (
					<FolderOpen className="h-4 w-4 shrink-0 text-primary" />
				) : (
					<Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
				)}
				<span className="flex-1 truncate">{group.name}</span>
				<span className="text-xs text-muted-foreground">
					{group.questionCount || ""}
				</span>

				{/* Actions — show on hover */}
				<span className="hidden group-hover:flex items-center gap-0.5 ml-1">
					<button
						onClick={(e) => {
							e.stopPropagation();
							setEditOpen(true);
						}}
						className="p-0.5 rounded hover:bg-muted">
						<Pencil className="h-3 w-3" />
					</button>
					<button
						onClick={handleDelete}
						className="p-0.5 rounded hover:bg-destructive/20 text-destructive">
						<Trash2 className="h-3 w-3" />
					</button>
				</span>
			</div>

			{open && hasChildren && (
				<div>
					{group.children.map((child) => (
						<GroupNode key={child._id} group={child} depth={depth + 1} />
					))}
				</div>
			)}

			<GroupDialog
				open={editOpen}
				onClose={() => setEditOpen(false)}
				group={group}
				mode="edit"
			/>
		</div>
	);
}

export default function Sidebar() {
	const { groups } = useGroupStore();
	const { logout, user } = useAuthStore();
	const [createOpen, setCreateOpen] = useState(false);
	const navigate = useNavigate();

	const navItems = [
		{ to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
		{ to: "/revision", icon: Brain, label: "Revision" },
		{ to: "/explore", icon: Compass, label: "Explore" },
		{ to: "/bookmarks", icon: BookMarked, label: "Bookmarks" },
		{ to: "/progress", icon: BarChart2, label: "Progress" },
	];

	return (
		<aside className="flex flex-col w-60 border-r bg-card h-screen sticky top-0 shrink-0">
			{/* Logo */}
			<div className="flex items-center gap-2 px-4 py-4 border-b">
				<Brain className="h-6 w-6 text-primary" />
				<span className="font-bold text-lg">DSA Tracker</span>
			</div>

			{/* Nav links */}
			<nav className="px-2 py-3 space-y-0.5">
				{navItems.map(({ to, icon: Icon, label }) => (
					<NavLink
						key={to}
						to={to}
						className={({ isActive }) =>
							cn(
								"flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
								isActive
									? "bg-primary/10 text-primary font-medium"
									: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
							)
						}>
						<Icon className="h-4 w-4" />
						{label}
					</NavLink>
				))}
			</nav>

			<div className="px-2 py-2 border-t border-b">
				<div className="flex items-center justify-between px-2 mb-1">
					<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
						Groups
					</span>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={() => setCreateOpen(true)}>
						<Plus className="h-3.5 w-3.5" />
					</Button>
				</div>
			</div>

			{/* Group tree */}
			<div className="flex-1 overflow-y-auto px-1 py-2">
				{groups.length === 0 ? (
					<p className="text-xs text-muted-foreground text-center py-4">
						No groups yet.{" "}
						<button
							onClick={() => setCreateOpen(true)}
							className="text-primary hover:underline">
							Create one
						</button>
					</p>
				) : (
					groups.map((g) => <GroupNode key={g._id} group={g} />)
				)}
			</div>

			{/* User footer */}
			<div className="border-t p-3 flex items-center gap-2">
				<div className="flex-1 min-w-0">
					<p className="text-sm font-medium truncate">{user?.username}</p>
					<p className="text-xs text-muted-foreground truncate">
						{user?.email}
					</p>
				</div>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => {
						logout();
						navigate("/login");
					}}>
					<LogOut className="h-4 w-4" />
				</Button>
			</div>

			<GroupDialog
				open={createOpen}
				onClose={() => setCreateOpen(false)}
				mode="create"
			/>
		</aside>
	);
}
