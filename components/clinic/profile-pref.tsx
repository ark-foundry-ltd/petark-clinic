// components/clinic/profile-pref.tsx
import Link from "next/link";
import { UserCircle2, CreditCard, Users, ChevronRight } from "lucide-react";

export default function ProfilePreferences() {
    const preferences = [
        {
            label: "Profile Settings",
            icon: <UserCircle2 className="w-6 h-6" />,
            description: "Manage your personal information",
            href: "/dashboard/profile/settings"
        },
        {
            label: "Account Settings",
            icon: <CreditCard className="w-6 h-6" />,
            description: "Payment methods and billing",
            href: "/dashboard/profile/account"
        },
        {
            label: "Staffs",
            icon: <Users className="w-6 h-6" />,
            description: "Manage your clinic staff",
            href: "/dashboard/profile/staffs"
        },
        {
            label: "Upgrade Plans",
            icon: <CreditCard className="w-6 h-6" />,
            description: "Manage your subscription plan",
            href: "/dashboard/profile/upgrade"
        }
    ];

    return (
        <div className="w-full">
            <h1 className="text-xl font-bold mb-6 pry-ff text-sec-clr">Preferences</h1>
            
            <div className="grid gap-4 sec-ff">
                {preferences.map((pref, index) => (
                    <Link
                        key={index}
                        href={pref.href}
                        className="group flex items-center justify-between p-4 bg-pry-clr rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-gray-50 rounded-lg text-acc-clr group-hover:bg-acc-clr group-hover:text-white transition-colors duration-200">
                                {pref.icon}
                            </div>
                            <div>
                                <h3 className="font-semibold text-sec-clr">{pref.label}</h3>
                                <p className="text-sm text-gray-500">{pref.description}</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-acc-clr group-hover:translate-x-1 transition-all duration-200" />
                    </Link>
                ))}
            </div>
        </div>
    );
}