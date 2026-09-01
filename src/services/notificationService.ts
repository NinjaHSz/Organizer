import { dbService } from './supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const notificationService = {
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) return 'denied';
    const permission = await Notification.requestPermission();
    if (permission === 'granted' && VAPID_PUBLIC_KEY) {
      await this.subscribeToPush();
    }
    return permission;
  },

  async subscribeToPush(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !VAPID_PUBLIC_KEY) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      const settings = {
        dailyEnabled: localStorage.getItem('daily-reminders-enabled') === 'true',
        notifTime: localStorage.getItem('notif-time') || '09:00',
      };

      if (!subscription) {
        const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey,
        });
        await dbService.savePushSubscription(subscription, settings);
      } else {
        await dbService.updatePushSettings(settings);
      }
      return true;
    } catch (err) {
      console.warn('[Notifications] Error subscribing to push:', err);
      return false;
    }
  },

  showLocalNotification(title: string, options?: NotificationOptions) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const notifOptions: NotificationOptions = {
      icon: '/assets/div.ico',
      badge: '/assets/div.ico',
      ...options,
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((reg) => {
          reg.showNotification(title, notifOptions);
        })
        .catch(() => {
          try {
            new Notification(title, notifOptions);
          } catch (e) {
            console.warn('[Notifications] Error showing local notification:', e);
          }
        });
    } else {
      try {
        new Notification(title, notifOptions);
      } catch (e) {
        console.warn('[Notifications] Error showing fallback notification:', e);
      }
    }
  },
};
