// components/clinic/profile-actions.tsx
// the notification toggle is now in the profile actions component, and the notification permission banner is in the layout component. This is because the notification permission banner should only show on first login, while the notification toggle should always be available in the profile actions.

"use client";

import Link from "next/link";
import { Bell, HeadphonesIcon, ChevronRight } from "lucide-react";
import { usePushSubscription } from "@/hooks/usePushSubscription";
import { toast } from "sonner";

export default function ProfileActions() {
    const { isSubscribed, loading, subscribe, unsubscribe } = usePushSubscription();

    const handlePushToggle = async () => {
        try {
            if (isSubscribed) {
                await unsubscribe();
                toast.success("Notifications turned off");
            } else {
                await subscribe();
                toast.success("Notifications turned on");
            }
        } catch (err) {
            console.error("Push toggle error:", err);
            toast.error("Could not update notification settings");
        }
    };

    return (
        <div className="w-full">
            <h1 className="text-xl font-bold mb-6 pry-ff text-sec-clr">Actions</h1>

            <div className="grid gap-4 sec-ff">
                {/* Push Notifications — toggle, no link */}
                <div className="flex items-center justify-between p-4 bg-pry-clr rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-50 rounded-lg text-acc-clr">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sec-clr">Push Notifications</h3>
                            <p className="text-sm text-gray-500">Receive appointment reminders</p>
                        </div>
                    </div>
                    <button
                        onClick={handlePushToggle}
                        disabled={loading}
                        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isSubscribed ? "bg-acc-clr" : "bg-gray-200"
                        }`}
                        role="switch"
                        aria-checked={isSubscribed}
                    >
                        <span
                            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-pry-clr shadow transform transition-transform duration-200 ease-in-out ${
                                isSubscribed ? "translate-x-5" : "translate-x-0"
                            }`}
                        />
                    </button>
                </div>

                {/* Contact Support — link */}
                <Link
                    href="/dashboard/profile/support"
                    className="group flex items-center justify-between p-4 bg-pry-clr rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-50 rounded-lg text-acc-clr group-hover:bg-acc-clr group-hover:text-white transition-colors duration-200">
                            <HeadphonesIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sec-clr">Contact Support</h3>
                            <p className="text-sm text-gray-500">Get help from our team</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-acc-clr group-hover:translate-x-1 transition-all duration-200" />
                </Link>
            </div>
        </div>
    );
}