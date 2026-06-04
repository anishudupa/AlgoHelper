import { create } from "zustand";

// Simple toast store — not using Radix Toast to keep it lightweight
export const useToastStore = create((set) => ({
	toasts: [],
	add: (toast) => {
		const id = Date.now();
		set((s) => ({ toasts: [...s.toasts, { id, ...toast }] }));
		setTimeout(
			() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
			3500,
		);
	},
	remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// Hook shorthand
export const useToast = () => {
	const add = useToastStore((s) => s.add);
	return {
		toast: ({ title, description, variant = "default" }) =>
			add({ title, description, variant }),
	};
};

// Toaster component — render at app root
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toaster() {
	const { toasts, remove } = useToastStore();
	return (
		<div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
			{toasts.map((t) => (
				<div
					key={t.id}
					className={cn(
						"flex items-start gap-3 rounded-lg border p-4 shadow-lg bg-background text-foreground animate-in slide-in-from-right-full",
						t.variant === "destructive" &&
							"border-destructive bg-destructive text-destructive-foreground",
					)}>
					<div className="flex-1 min-w-0">
						{t.title && <p className="font-semibold text-sm">{t.title}</p>}
						{t.description && (
							<p className="text-xs text-muted-foreground mt-0.5">
								{t.description}
							</p>
						)}
					</div>
					<button
						onClick={() => remove(t.id)}
						className="text-muted-foreground hover:text-foreground shrink-0">
						<X className="h-4 w-4" />
					</button>
				</div>
			))}
		</div>
	);
}
