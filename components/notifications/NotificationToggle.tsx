'use client';
import { usePushSubscription } from '@/hooks/usePushSubscription';
import { toast } from 'sonner';

export function NotificationToggle() {
  const { isSubscribed, loading, subscribe, unsubscribe } = usePushSubscription();

  const handleChange = async () => {
    try {
      if (isSubscribed) {
        await unsubscribe();
        toast.success('Notifications turned off');
      } else {
        await subscribe();
        toast.success('Notifications turned on');
      }
    } catch {
      toast.error('Could not update notification settings');
    }
  };

  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-medium text-pry-clr">Push Notifications</p>
        <p className="text-sm text-sec-clr">Appointment reminders and updates</p>
      </div>
      <button
        onClick={handleChange}
        disabled={loading}
        className={`w-11 h-6 rounded-full transition-colors ${isSubscribed ? 'bg-acc-clr' : 'bg-gray-300'}`}
      >
        <span className={`block w-5 h-5 bg-white rounded-full transition-transform ${isSubscribed ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}