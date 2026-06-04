import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useGroupStore } from "@/store/groupStore";

export default function AppLayout() {
	const { fetchGroups } = useGroupStore();

	useEffect(() => {
		fetchGroups();
	}, [fetchGroups]);

	return (
		<div className="flex h-screen overflow-hidden bg-background">
			<Sidebar />
			<main className="flex-1 overflow-y-auto">
				<Outlet />
			</main>
		</div>
	);
}
