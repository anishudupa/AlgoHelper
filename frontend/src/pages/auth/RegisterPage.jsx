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

export default function RegisterPage() {
	const [form, setForm] = useState({ username: "", email: "", password: "" });
	const { register, isLoading } = useAuthStore();
	const { toast } = useToast();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (form.password.length < 6) {
			toast({
				title: "Password too short",
				description: "Must be at least 6 characters",
				variant: "destructive",
			});
			return;
		}
		const res = await register(form);
		if (res.success) navigate("/dashboard");
		else
			toast({
				title: "Registration failed",
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
						<CardTitle>Create account</CardTitle>
						<CardDescription>Start tracking your DSA practice</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-1.5">
								<Label htmlFor="username">Username</Label>
								<Input
									id="username"
									placeholder="johndoe"
									value={form.username}
									onChange={(e) =>
										setForm({ ...form, username: e.target.value })
									}
									required
									minLength={3}
								/>
							</div>
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
									placeholder="Min. 6 characters"
									value={form.password}
									onChange={(e) =>
										setForm({ ...form, password: e.target.value })
									}
									required
									minLength={6}
								/>
							</div>
							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? "Creating account..." : "Create Account"}
							</Button>
						</form>
						<p className="text-center text-sm text-muted-foreground mt-4">
							Already have an account?{" "}
							<Link
								to="/login"
								className="text-primary hover:underline font-medium">
								Sign in
							</Link>
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
