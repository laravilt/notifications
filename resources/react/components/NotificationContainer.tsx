import { usePage } from '@inertiajs/react';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useEffect, useRef, useState, type ComponentType } from 'react';
import { createPortal } from 'react-dom';
import { resolveIcon } from '@laravilt/support/lib/icons';
import { useNotification } from '../composables/useNotification';
import NotificationItem from './NotificationItem';

const EMPTY: any[] = [];

// Map backend status to frontend type
const mapStatusToType = (notification: any) => {
    // If type is already set, use it
    if (notification.type) {
        return notification;
    }

    // Map status to type
    const statusMap: Record<string, string> = {
        success: 'success',
        danger: 'error',
        warning: 'warning',
        info: 'info',
    };

    return {
        ...notification,
        type: statusMap[notification.status] || notification.status || 'success',
    };
};

const notificationClasses: Record<string, string> = {
    success: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-400 dark:border-green-800',
    error: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-400 dark:border-red-800',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-400 dark:border-yellow-800',
    info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-400 dark:border-blue-800',
};

const defaultIcons: Record<string, ComponentType<{ className?: string }>> = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

const getIcon = (notification: any): ComponentType<{ className?: string }> | undefined => {
    if (notification.icon) {
        // Get custom icon from Lucide
        return resolveIcon(notification.icon) || defaultIcons[notification.type || 'success'];
    }

    return defaultIcons[notification.type || 'success'];
};

const getColorClasses = (notification: any): string => {
    const colorMap: Record<string, string> = {
        // Standard notification colors
        success: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-400 dark:border-green-800',
        error: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-400 dark:border-red-800',
        danger: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-400 dark:border-red-800',
        warning: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-400 dark:border-yellow-800',
        info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-400 dark:border-blue-800',
        // Custom colors
        primary: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-400 dark:border-blue-800',
        secondary: 'bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800',
        purple: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-400 dark:border-purple-800',
        indigo: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-900 dark:text-indigo-400 dark:border-indigo-800',
    };

    // If custom color is set, use it
    if (notification.color && colorMap[notification.color]) {
        return colorMap[notification.color];
    }

    // Otherwise use type-based color
    return notificationClasses[notification.type || 'success'] || notificationClasses.success;
};

export default function NotificationContainer() {
    const { notifications, notify, remove } = useNotification();
    const page = usePage();
    const [mounted, setMounted] = useState(false);

    // Track processed notification hashes to prevent duplicates
    const processedNotifications = useRef(new Set<string>());

    const pageNotifications = ((page.props as any)?.notifications ?? EMPTY) as any[];

    // Watch for notifications from Inertia (from session)
    useEffect(() => {
        if (pageNotifications && Array.isArray(pageNotifications) && pageNotifications.length > 0) {
            pageNotifications.forEach((notification) => {
                // Use the backend-generated ID as primary dedup key
                // Fall back to content hash if no ID exists
                const notificationKey =
                    notification.id ||
                    JSON.stringify({
                        title: notification.title,
                        body: notification.body,
                        status: notification.status,
                    });

                if (!processedNotifications.current.has(notificationKey)) {
                    processedNotifications.current.add(notificationKey);
                    // Map status to type for backend compatibility
                    notify(mapStatusToType(notification));
                }
            });
        }
    }, [pageNotifications, notify]);

    // <Teleport to="body"> — only portal once the DOM exists (SSR-safe)
    useEffect(() => setMounted(true), []);

    if (!mounted || typeof document === 'undefined') {
        return null;
    }

    // Filter notifications by position
    const topRightNotifications = notifications.filter((n) => !n.position || n.position === 'top-right');
    const topLeftNotifications = notifications.filter((n) => n.position === 'top-left');
    const bottomRightNotifications = notifications.filter((n) => n.position === 'bottom-right');
    const bottomLeftNotifications = notifications.filter((n) => n.position === 'bottom-left');
    const topCenterNotifications = notifications.filter((n) => n.position === 'top-center');
    const bottomCenterNotifications = notifications.filter((n) => n.position === 'bottom-center');

    const renderItems = (items: any[]) =>
        items.map((notification) => (
            <NotificationItem
                key={notification.id}
                notification={notification}
                getIcon={getIcon}
                getColorClasses={getColorClasses}
                onRemove={remove}
            />
        ));

    return createPortal(
        <>
            {/* Top Right (default) - uses end-4 for RTL support */}
            <div className="fixed top-4 end-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-md">
                {renderItems(topRightNotifications)}
            </div>

            {/* Top Left - uses start-4 for RTL support */}
            <div className="fixed top-4 start-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-md">
                {renderItems(topLeftNotifications)}
            </div>

            {/* Bottom Right - uses end-4 for RTL support */}
            <div className="fixed bottom-4 end-4 z-[9999] flex flex-col-reverse gap-2 pointer-events-none max-w-md">
                {renderItems(bottomRightNotifications)}
            </div>

            {/* Bottom Left - uses start-4 for RTL support */}
            <div className="fixed bottom-4 start-4 z-[9999] flex flex-col-reverse gap-2 pointer-events-none max-w-md">
                {renderItems(bottomLeftNotifications)}
            </div>

            {/* Top Center */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none max-w-md">
                {renderItems(topCenterNotifications)}
            </div>

            {/* Bottom Center */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col-reverse gap-2 pointer-events-none max-w-md">
                {renderItems(bottomCenterNotifications)}
            </div>
        </>,
        document.body,
    );
}

export { NotificationContainer };
