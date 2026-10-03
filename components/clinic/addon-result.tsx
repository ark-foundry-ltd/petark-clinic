// components/clinic/addon-result.tsx

import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

export default function AddonResult({ status }: Readonly<{ status: "success" | "failed" }>) {
    const ok = status === "success";
    const Icon = ok ? CheckCircle2 : XCircle;

    return (
        <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center pry-ff">
            <span
                className={`flex h-14 w-14 items-center justify-center rounded-full ${
                    ok ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                }`}
            >
                <Icon className="h-7 w-7" />
            </span>
            <h1 className="mt-5 text-2xl font-semibold text-slate-900">
                {ok ? "Add-on purchased" : "Payment not completed"}
            </h1>
            <p className="sec-ff mt-2 text-sm leading-relaxed text-slate-500">
                {ok
                    ? "Your extra units are active for this month. If your usage doesn't update right away, refresh the page in a minute."
                    : "We couldn't confirm your payment, so nothing was added and you were not charged for an add-on. If money left your account, it will be matched automatically or you can contact support."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                    href="/dashboard/addons"
                    className="rounded-lg bg-acc-clr px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                >
                    {ok ? "View my usage" : "Try again"}
                </Link>
                <Link
                    href="/dashboard"
                    className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                    Back to dashboard
                </Link>
            </div>
        </div>
    );
}