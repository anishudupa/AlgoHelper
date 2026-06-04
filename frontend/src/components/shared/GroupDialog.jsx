import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useGroupStore } from "@/store/groupStore";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/index";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export default function GroupDialog({
	open,
	onClose,
	group = null,
	mode = "create",
	parentGroup = null,
}) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [isPublic, setIsPublic] = useState(false);
	const [loading, setLoading] = useState(false);
	const { createGroup, updateGroup, groups } = useGroupStore();
	const { toast } = useToast();

	useEffect(() => {
		if (mode === "edit" && group) {
			setName(group.name);
			setDescription(group.description || "");
			setIsPublic(group.isPublic || false);
		} else {
			setName("");
			setDescription("");
			setIsPublic(false);
		}
	}, [group, mode, open]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!name.trim()) return;
		setLoading(true);

		let res;
		if (mode === "edit") {
			res = await updateGroup(group._id, { name, description, isPublic });
		} else {
			res = await createGroup({
				name,
				description,
				isPublic,
				parentGroup: parentGroup || null,
			});
		}

		setLoading(false);
		if (res.success) {
			toast({ title: mode === "edit" ? "Group updated" : "Group created" });
			onClose();
		} else {
			toast({
				title: "Error",
				description: res.message,
				variant: "destructive",
			});
		}
	};

	// Flat list of groups for parent selection
	const flatGroups = flattenGroups(groups);

	return (
		<Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
				<Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-background rounded-lg shadow-xl p-6 w-full max-w-md">
					<div className="flex items-center justify-between mb-4">
						<Dialog.Title className="text-lg font-semibold">
							{mode === "edit" ? "Edit Group" : "Create Group"}
						</Dialog.Title>
						<button
							onClick={onClose}
							className="text-muted-foreground hover:text-foreground">
							<X className="h-4 w-4" />
						</button>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="e.g. Dynamic Programming"
								required
							/>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="description">Description (optional)</Label>
							<Input
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Brief description..."
							/>
						</div>

						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								id="isPublic"
								checked={isPublic}
								onChange={(e) => setIsPublic(e.target.checked)}
								className="rounded"
							/>
							<Label htmlFor="isPublic" className="cursor-pointer">
								Make this group public
							</Label>
						</div>

						<div className="flex gap-2 justify-end pt-2">
							<Button type="button" variant="outline" onClick={onClose}>
								Cancel
							</Button>
							<Button type="submit" disabled={loading}>
								{loading
									? "Saving..."
									: mode === "edit"
										? "Save Changes"
										: "Create Group"}
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
