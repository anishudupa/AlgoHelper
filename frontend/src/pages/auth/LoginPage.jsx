import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import {
	Input,
	Label,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/index";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
	const [form, setForm] = useState({ email: "", password: "" });
	const { login, isLoading } = useAuthStore();
	const { toast } = useToast();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		const res = await login(form);
		if (res.success) navigate("/dashboard");
		else
			toast({
				title: "Login failed",
				description: res.message,
				variant: "destructive",
			});
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
			<div className="w-full max-w-sm">
				<div className="flex items-center justify-center gap-2 mb-8">
					<Brain className="h-8 w-8 text-primary" />
					<span className="text-2xl font-bold">DSA Tracker</span>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Welcome back</CardTitle>
						<CardDescription>Sign in to continue your practice</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-1.5">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="you@example.com"
									value={form.email}
									onChange={(e) => setForm({ ...form, email: e.target.value })}
									required
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									type="password"
									placeholder="••••••••"
									value={form.password}
									onChange={(e) =>
										setForm({ ...form, password: e.target.value })
									}
									required
								/>
							</div>
							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? "Signing in..." : "Sign In"}
							</Button>
						</form>
						<p className="text-center text-sm text-muted-foreground mt-4">
							No account?{" "}
							<Link
								to="/register"
								className="text-primary hover:underline font-medium">
								Register
							</Link>
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
