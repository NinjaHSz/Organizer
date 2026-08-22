import { dbService } from './supabase';

const VAPID_PUBLIC_KEY =
  'BCzt6hcNxLDdrJAsahoERLY4N99GL74Bs5qlNk8CgMAZVRABe7V08v2IjpM8peRzseEPFHeDG5ETe7yBzVo2ec8';

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
    if (permission === 'granted') {
      await this.subscribeToPush();
    }
    return permission;
  },

  async subscribeToPush(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      const settings = {
        dailyEnabled: localStorage.getItem('daily-reminders-enabled') !== 'false',
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

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          icon: '/assets/div.ico',
          badge: '/assets/div.ico',
          ...options,
        });
      });
    } else {
      new Notification(title, {
        icon: '/assets/div.ico',
        ...options,
      });
    }
  },
};
