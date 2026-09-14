import { useRef, useSyncExternalStore } from 'react';

export interface NotificationAction {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
}

export interface Notification {
    id: string;
    title?: string;
    body?: string;
    message?: string; // Backward compatibility
    type?: 'success' | 'error' | 'warning' | 'info';
    icon?: string;
    color?: string;
    actions?: NotificationAction[];
    duration?: number;
    // Read by NotificationContainer / NotificationItem (also passed through by the Vue code, just untyped there)
    position?: string;
    dismissible?: boolean;
    persistent?: boolean;
}

/** Object form accepted by `notify()` — the id is generated unless one is supplied (e.g. a backend id). */
export type NotificationInput = Omit<Notification, 'id'> & { id?: string };

export type NotificationTypeOrColor =
    | 'success'
    | 'error'
    | 'warning'
    | 'info'
    | 'danger'
    | 'primary'
    | 'secondary'
    | 'gray'
    | 'purple'
    | 'indigo';

// Use a global key to ensure singleton across module instances (same keys as the Vue package)
const NOTIFICATIONS_KEY = '__laravilt_notifications__';
const NOTIFICATION_ID_KEY = '__laravilt_notification_id__';
const NOTIFICATIONS_REF_KEY = '__laravilt_notifications_ref__';

/**
 * Tiny external store. Shaped like a Vue `Ref` (`.value`) so code reading
 * `window.__laravilt_notifications_ref__.value` keeps working.
 */
export interface NotificationStore {
    readonly value: Notification[];
    get(): Notification[];
    set(next: Notification[]): void;
    subscribe(listener: () => void): () => void;
}

function createStore(): NotificationStore {
    let notifications: Notification[] = [];
    const listeners = new Set<() => void>();

    return {
        get value() {
            return notifications;
        },
        get: () => notifications,
        set(next: Notification[]) {
            notifications = next;
            listeners.forEach((listener) => listener());
        },
        subscribe(listener: () => void) {
            listeners.add(listener);

            return () => {
                listeners.delete(listener);
            };
        },
    };
}

// Initialize global state if not exists
if (typeof window !== 'undefined') {
    const w = window as any;

    if (!w[NOTIFICATIONS_KEY]) {
        w[NOTIFICATIONS_KEY] = [];
    }

    if (w[NOTIFICATION_ID_KEY] === undefined) {
        w[NOTIFICATION_ID_KEY] = 0;
    }
}

// Get the shared notifications store
const getNotificationsStore = (): NotificationStore => {
    if (typeof window !== 'undefined') {
        const w = window as any;

        if (!w[NOTIFICATIONS_REF_KEY] || typeof w[NOTIFICATIONS_REF_KEY].subscribe !== 'function') {
            w[NOTIFICATIONS_REF_KEY] = createStore();
        }

        return w[NOTIFICATIONS_REF_KEY] as NotificationStore;
    }

    // Fallback for SSR
    return createStore();
};

const getNextId = (): number => {
    if (typeof window !== 'undefined') {
        const w = window as any;
        w[NOTIFICATION_ID_KEY] = (w[NOTIFICATION_ID_KEY] || 0) + 1;

        return w[NOTIFICATION_ID_KEY];
    }

    return Date.now();
};

const remove = (id: string): void => {
    const store = getNotificationsStore();
    const current = store.get();
    const index = current.findIndex((n) => n.id === id);

    if (index > -1) {
        const next = current.slice();
        next.splice(index, 1);
        store.set(next);
    }
};

const clear = (): void => {
    getNotificationsStore().set([]);
};

/**
 * Push a notification. Callable anywhere (inside or outside React), like the Vue `notify`.
 */
export function notify(
    titleOrMessage: string | NotificationInput,
    body?: string,
    type: NotificationTypeOrColor = 'success',
    options: Partial<Notification> = {},
): string {
    const id = `notification-${getNextId()}`;

    let notification: Notification;

    // Map color aliases to types or use custom colors
    const typeColorMap: Record<string, { type?: string; color?: string }> = {
        danger: { type: 'error', color: 'danger' },
        primary: { color: 'primary' },
        secondary: { color: 'secondary' },
        gray: { color: 'secondary' },
        purple: { color: 'purple' },
        indigo: { color: 'indigo' },
    };

    const mappedTypeOrColor = typeColorMap[type] || { type };

    if (typeof titleOrMessage === 'object') {
        // Full notification object passed
        notification = { id, ...titleOrMessage } as Notification;
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

    const store = getNotificationsStore();
    store.set([...store.get(), notification]);

    // Use notification.id (which may be overridden by backend id) for the timeout
    const notificationId = notification.id;

    if (notification.duration && notification.duration > 0) {
        setTimeout(() => remove(notificationId), notification.duration);
    }

    return notificationId;
}

export interface UseNotificationReturn {
    /** Current notifications (plain array — the React equivalent of the Vue ref's `.value`). */
    readonly notifications: Notification[];
    notify: typeof notify;
    remove: (id: string) => void;
    clear: () => void;
}

const serverSnapshot = (): null => null;

/**
 * Same API as the Vue composable. `notify`/`remove`/`clear` are stable module functions.
 *
 * The component only re-renders on store changes if it actually reads `notifications`
 * (tracked through the getter), so the many field/column components that only call
 * `notify` do not re-render every time a toast appears or disappears.
 */
export function useNotification(): UseNotificationReturn {
    const store = getNotificationsStore();
    const tracked = useRef(false);

    useSyncExternalStore(store.subscribe, () => (tracked.current ? store.get() : null), serverSnapshot);

    return {
        get notifications() {
            tracked.current = true;

            return store.get();
        },
        notify,
        remove,
        clear,
    };
}
