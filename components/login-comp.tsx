"use client";

import { loginClinic } from "@/lib/auth";
import { getMe, isClinicResponse } from "@/lib/user";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useStore";

interface LoginError {
    status: number;
    message: string;
    errors?: Record<string, string[]>;
}

function isLoginError(error: unknown): error is LoginError {
    return (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        "message" in error
    );
}

export default function LoginComp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { setClinicToken, setProfile } = useAuthStore();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const loginResponse = await loginClinic({ email, password });

            if (loginResponse.token) {
                setClinicToken(loginResponse.token);
            }

            const me = await getMe();
            setProfile(
                isClinicResponse(me) ? me.clinic : me.profile,
                me.role,
                me.permissions
            );

            toast.success("Login successful!");
            router.push("/role-gate");
        } catch (error) {
            console.error("Login error:", error);

            if (isLoginError(error)) {
                if (error.status === 401) {
                    setError("Invalid email or password");
                    toast.error("Invalid email or password");
                } else if (error.status === 0) {
                    setError("Unable to connect to server. Please check your connection.");
                    toast.error("Unable to connect to server. Please check your connection.");
                } else {
                    setError(error.message || "Login failed. Please try again.");
                    toast.error(error.message || "Login failed. Please try again.");
                }
            } else {
                setError("An unexpected error occurred");
                toast.error("An unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm md:max-w-md p-8 space-y-6 bg-pry-clr rounded-lg shadow-md">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-sec-clr pry-ff">PetArk Login</h1>
                <p className="mt-2 text-sec-clr pry-ff">Sign in to your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 sec-ff">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-sec-ff">
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-acc-clr focus:border-acc-clr"
                        placeholder="clinic@example.com"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-sec-ff">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-acc-clr focus:border-acc-clr"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-pry-clr bg-acc-clr hover:bg-acc-clr/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-acc-clr disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    {loading ? <Loader2 className="animate-spin text-pry-clr" /> : "Sign In"}
                </button>
            </form>

            {error && (
                <div className="p-3 text-sm text-red-600 bg-red-100 rounded-md sec-ff">
                    {error}
                </div>
            )}

            <div className="text-center text-sm cursor-pointer sec-ff">
                <a href="/signup" className="text-sec-clr hover:text-acc-clr transition-colors duration-200">
                    Don&apos;t have an account? <b>Sign up here</b>
                </a>
            </div>
        </div>
    );
}