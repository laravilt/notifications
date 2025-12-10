import { reactive, ref, type Ref } from 'vue';

interface NotificationAction {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
}

interface Notification {
    id: string;
    title?: string;
    body?: string;
    message?: string; // Backward compatibility
    type?: 'success' | 'error' | 'warning' | 'info';
    icon?: string;
    color?: string;
    actions?: NotificationAction[];
    duration?: number;
}

// Use a global key to ensure singleton across module instances
const NOTIFICATIONS_KEY = '__laravilt_notifications__';
const NOTIFICATION_ID_KEY = '__laravilt_notification_id__';

// Declare global types
declare global {
    interface Window {
        [NOTIFICATIONS_KEY]?: Notification[];
        [NOTIFICATION_ID_KEY]?: number;
    }
}

// Initialize global state if not exists
if (typeof window !== 'undefined') {
    if (!window[NOTIFICATIONS_KEY]) {
        window[NOTIFICATIONS_KEY] = reactive<Notification[]>([]);
    }
    if (window[NOTIFICATION_ID_KEY] === undefined) {
        window[NOTIFICATION_ID_KEY] = 0;
    }
}

// Use a ref key for proper Vue reactivity
const NOTIFICATIONS_REF_KEY = '__laravilt_notifications_ref__';

declare global {
    interface Window {
        [NOTIFICATIONS_REF_KEY]?: Ref<Notification[]>;
    }
}

// Get the shared reactive notifications ref
const getNotificationsRef = (): Ref<Notification[]> => {
    if (typeof window !== 'undefined') {
        if (!window[NOTIFICATIONS_REF_KEY]) {
            window[NOTIFICATIONS_REF_KEY] = ref<Notification[]>([]);
        }
        return window[NOTIFICATIONS_REF_KEY];
    }
    // Fallback for SSR
    return ref<Notification[]>([]);
};

const getNextId = (): number => {
    if (typeof window !== 'undefined') {
        window[NOTIFICATION_ID_KEY] = (window[NOTIFICATION_ID_KEY] || 0) + 1;
        return window[NOTIFICATION_ID_KEY];
    }
    return Date.now();
};

export function useNotification() {
    // Get the shared notifications ref
    const notificationsRef = getNotificationsRef();

    const notify = (
        titleOrMessage: string | Notification,
        body?: string,
        type: 'success' | 'error' | 'warning' | 'info' | 'danger' | 'primary' | 'secondary' | 'gray' | 'purple' | 'indigo' = 'success',
        options: Partial<Notification> = {}
    ) => {
        const id = `notification-${getNextId()}`;

        let notification: Notification;

        // Map color aliases to types or use custom colors
        const typeColorMap: Record<string, { type?: string; color?: string }> = {
            'danger': { type: 'error', color: 'danger' },
            'primary': { color: 'primary' },
            'secondary': { color: 'secondary' },
            'gray': { color: 'secondary' },
            'purple': { color: 'purple' },
            'indigo': { color: 'indigo' },
        };

        const mappedTypeOrColor = typeColorMap[type] || { type };

        if (typeof titleOrMessage === 'object') {
            // Full notification object passed
            notification = { id, ...titleOrMessage };
        } else if (body) {
            // Title and body provided
            notification = {
                id,
                title: titleOrMessage,
                body,
                type: mappedTypeOrColor.type as any,
                color: mappedTypeOrColor.color,
                ...options,
            };
        } else {
            // Only message provided (backward compatibility)
            notification = {
                id,
                message: titleOrMessage,
                type: mappedTypeOrColor.type as any,
                color: mappedTypeOrColor.color,
                ...options,
            };
        }

        // Set default duration if not provided
        if (notification.duration === undefined) {
            notification.duration = 3000;
        }

        notificationsRef.value.push(notification);

        // Use notification.id (which may be overridden by backend id) for the timeout
        const notificationId = notification.id;
        if (notification.duration && notification.duration > 0) {
            setTimeout(() => remove(notificationId), notification.duration);
        }

        return notificationId;
    };

    const remove = (id: string) => {
        const index = notificationsRef.value.findIndex((n) => n.id === id);
        if (index > -1) notificationsRef.value.splice(index, 1);
    };

    const clear = () => {
        notificationsRef.value.splice(0, notificationsRef.value.length);
    };

    return { notifications: notificationsRef, notify, remove, clear };
}

// Backward compatible notify function
export function notify(
    titleOrMessage: string | Notification,
    body?: string,
    type: 'success' | 'error' | 'warning' | 'info' | 'danger' | 'primary' | 'secondary' | 'gray' | 'purple' | 'indigo' = 'success',
    options: Partial<Notification> = {}
) {
    return useNotification().notify(titleOrMessage, body, type, options);
}
