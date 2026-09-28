// components/forgot-password.tsx

"use client";

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, KeyRound, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import {
    forgotPasswordClinic,
    verifyResetOtpClinic,
    resetPasswordClinic,
} from "@/lib/auth";

type Step = "email" | "otp" | "password" | "done";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

export default function ForgotPasswordFlow() {
    const router = useRouter();

    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [resetToken, setResetToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => setResendCooldown((s) => s - 1), 1000);
        return () => clearInterval(timer);
    }, [resendCooldown]);

    useEffect(() => {
        if (step === "otp") {
            otpInputRefs.current[0]?.focus();
        }
    }, [step]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error("Enter your email address");
            return;
        }

        setLoading(true);
        try {
            await forgotPasswordClinic({ email: email.trim() });
            toast.success("If that email exists, a reset code has been sent");
            setStep("otp");
            setResendCooldown(RESEND_COOLDOWN_SECONDS);
        } catch (error: any) {
            toast.error(error?.message || "Could not send reset code");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        setLoading(true);
        try {
            await forgotPasswordClinic({ email: email.trim() });
            toast.success("A new code has been sent to your email");
            setOtp(Array(OTP_LENGTH).fill(""));
            otpInputRefs.current[0]?.focus();
            setResendCooldown(RESEND_COOLDOWN_SECONDS);
        } catch (error: any) {
            toast.error(error?.message || "Could not resend code");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, "").slice(-1);
        const next = [...otp];
        next[index] = digit;
        setOtp(next);

        if (digit && index < OTP_LENGTH - 1) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
        if (!pasted) return;
        const next = Array(OTP_LENGTH).fill("");
        pasted.split("").forEach((digit, i) => { next[i] = digit; });
        setOtp(next);
        otpInputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join("");
        if (code.length !== OTP_LENGTH) {
            toast.error(`Enter the ${OTP_LENGTH}-digit code`);
            return;
        }

        setLoading(true);
        try {
            const res = await verifyResetOtpClinic({ email: email.trim(), otp: code });
            setResetToken(res.resetToken);
            setStep("password");
        } catch (error: any) {
            toast.error(error?.message || "Invalid or expired code");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await resetPasswordClinic({ resetToken, newPassword });
            toast.success("Password reset successfully");
            setStep("done");
        } catch (error: any) {
            toast.error(error?.message || "Could not reset password");
            // A likely cause here is the 15-minute resetToken expiring —
            // send them back to request a fresh code rather than dead-end.
            if (error?.status === 400) {
                setStep("email");
                setOtp(Array(OTP_LENGTH).fill(""));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-clr px-4">
            <div className="w-full max-w-md">
                <button
                    type="button"
                    onClick={() => (step === "email" ? router.push("/login") : setStep("email"))}
                    className="flex items-center gap-2 text-sm text-sec-clr hover:text-acc-clr transition-colors mb-6 sec-ff"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {step === "email" ? "Back to login" : "Start over"}
                </button>

                <div className="bg-pry-clr rounded-2xl shadow-sm border border-gray-100 p-8">
                    {step === "email" && (
                        <>
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-acc-clr/10 mb-5">
                                <Mail className="w-5 h-5 text-acc-clr" />
                            </div>
                            <h1 className="pry-ff text-xl font-semibold text-sec-clr mb-2">
                                Reset your password
                            </h1>
                            <p className="sec-ff text-sm text-sec-clr mb-6">
                                Enter the email on your clinic account and we'll send a code to reset your password.
                            </p>

                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-sec-clr mb-1.5 sec-ff">
                                        Email address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@clinic.com"
                                        autoComplete="email"
                                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-acc-clr/40 focus:border-acc-clr sec-ff"
                                        disabled={loading}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 bg-acc-clr text-pry-clr text-sm font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 sec-ff"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Send reset code
                                </button>
                            </form>
                        </>
                    )}

                    {step === "otp" && (
                        <>
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-acc-clr/10 mb-5">
                                <KeyRound className="w-5 h-5 text-acc-clr" />
                            </div>
                            <h1 className="pry-ff text-xl font-semibold text-sec-clr mb-2">
                                Enter the code
                            </h1>
                            <p className="sec-ff text-sm text-sec-clr mb-6">
                                We sent a {OTP_LENGTH}-digit code to <span className="font-medium text-sec-clr">{email}</span>.
                                It expires in 10 minutes.
                            </p>

                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div className="flex justify-between gap-2">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => { otpInputRefs.current[index] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            onPaste={handleOtpPaste}
                                            disabled={loading}
                                            className="w-11 h-12 text-center text-lg font-semibold rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-acc-clr/40 focus:border-acc-clr sec-ff"
                                        />
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 bg-acc-clr text-pry-clr text-sm font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 sec-ff"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Verify code
                                </button>

                                <p className="text-center text-sm text-sec-clr">
                                    Didn't get it?{" "}
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={resendCooldown > 0 || loading}
                                        className="font-medium text-acc-clr disabled:text-sec-clr disabled:cursor-not-allowed sec-ff"
                                    >
                                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                                    </button>
                                </p>
                            </form>
                        </>
                    )}

                    {step === "password" && (
                        <>
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-acc-clr/10 mb-5">
                                <Lock className="w-5 h-5 text-acc-clr" />
                            </div>
                            <h1 className="pry-ff text-xl font-semibold text-sec-clr mb-2">
                                Set a new password
                            </h1>
                            <p className="sec-ff text-sm text-sec-clr mb-6">
                                Choose a new password for your account.
                            </p>

                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-sec-clr mb-1.5 sec-ff">
                                        New password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="newPassword"
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="At least 6 characters"
                                            autoComplete="new-password"
                                            className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-acc-clr/40 focus:border-acc-clr sec-ff"
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((s) => !s)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sec-clr"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-sec-clr mb-1.5 sec-ff">
                                        Confirm password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Re-enter your new password"
                                            autoComplete="new-password"
                                            className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-acc-clr/40 focus:border-acc-clr sec-ff"
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword((s) => !s)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sec-clr"
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 bg-acc-clr text-pry-clr text-sm font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 sec-ff"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Reset password
                                </button>
                            </form>
                        </>
                    )}

                    {step === "done" && (
                        <div className="text-center py-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-5 mx-auto">
                                <Lock className="w-5 h-5 text-green-600" />
                            </div>
                            <h1 className="pry-ff text-xl font-semibold text-sec-clr mb-2">
                                Password reset
                            </h1>
                            <p className="sec-ff text-sm text-sec-clr mb-6 pry-ff">
                                Your password has been changed. You can now log in with your new password.
                            </p>
                            <button
                                type="button"
                                onClick={() => router.push("/login")}
                                className="w-full bg-acc-clr text-pry-clr text-sm font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity sec-ff"
                            >
                                Go to login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}