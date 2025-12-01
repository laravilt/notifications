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
        type: 'success' | 'error' | 'warning' | 'info' | 'danger' | 'primary' | 'secondary' | 'gray' | 'purple' | 'indigo' = 'success',
        options: Partial<Notification> = {}
    ) => {
        const id = `notification-${++notificationId}`;

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
    type: 'success' | 'error' | 'warning' | 'info' | 'danger' | 'primary' | 'secondary' | 'gray' | 'purple' | 'indigo' = 'success',
    options: Partial<Notification> = {}
) {
    return useNotification().notify(titleOrMessage, body, type, options);
}
