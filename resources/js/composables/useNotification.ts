import { reactive } from 'vue';

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

const notifications = reactive<Notification[]>([]);
let notificationId = 0;

export function useNotification() {
    const notify = (
        titleOrMessage: string | Notification,
        body?: string,
        type: 'success' | 'error' | 'warning' | 'info' = 'success',
        options: Partial<Notification> = {}
    ) => {
        const id = `notification-${++notificationId}`;

        let notification: Notification;

        if (typeof titleOrMessage === 'object') {
            // Full notification object passed
            notification = { id, ...titleOrMessage };
        } else if (body) {
            // Title and body provided
            notification = {
                id,
                title: titleOrMessage,
                body,
                type,
                ...options,
            };
        } else {
            // Only message provided (backward compatibility)
            notification = {
                id,
                message: titleOrMessage,
                type,
                ...options,
            };
        }

        // Set default duration if not provided
        if (notification.duration === undefined) {
            notification.duration = 3000;
        }

        notifications.push(notification);

        if (notification.duration && notification.duration > 0) {
            setTimeout(() => remove(id), notification.duration);
        }

        return id;
    };

    const remove = (id: string) => {
        const index = notifications.findIndex((n) => n.id === id);
        if (index > -1) notifications.splice(index, 1);
    };

    const clear = () => {
        notifications.splice(0, notifications.length);
    };

    return { notifications, notify, remove, clear };
}

// Backward compatible notify function
export function notify(
    titleOrMessage: string | Notification,
    body?: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'success',
    options: Partial<Notification> = {}
) {
    return useNotification().notify(titleOrMessage, body, type, options);
}
