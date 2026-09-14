import { usePage } from '@inertiajs/react';
import { AlertCircle, AlertTriangle, Bell, BellOff, Check, CheckCheck, CheckCircle2, Info, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useLatest } from '@laravilt/support/composables/hooks';
import { useLocalization } from '@laravilt/support/composables/useLocalization';

export interface DatabaseNotification {
    id: string;
    type: string;
    title: string | null;
    body: string | null;
    icon: string | null;
    iconColor: string | null;
    status: 'info' | 'success' | 'warning' | 'danger';
    color: string | null;
    actions: any[];
    data: any;
    readAt: string | null;
    createdAt: string;
    humanTime: string;
}

export interface NotificationCenterProps {
    pollingInterval?: string | null;
}

const getStatusIcon = (status: string): ComponentType<{ className?: string }> => {
    switch (status) {
        case 'success':
            return CheckCircle2;
        case 'warning':
            return AlertTriangle;
        case 'danger':
            return AlertCircle;
        default:
            return Info;
    }
};

const getStatusColor = (status: string): string => {
    switch (status) {
        case 'success':
            return 'text-green-500';
        case 'warning':
            return 'text-yellow-500';
        case 'danger':
            return 'text-red-500';
        default:
            return 'text-blue-500';
    }
};

const csrfToken = (): string => (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

const actionClasses = (action: any): string =>
    cn(
        'inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
        action.color === 'danger' || action.variant === 'destructive'
            ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            : action.variant === 'outline'
              ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
              : action.variant === 'ghost'
                ? 'hover:bg-accent hover:text-accent-foreground'
                : 'bg-primary text-primary-foreground hover:bg-primary/90',
    );

export default function NotificationCenter({ pollingInterval = '30s' }: NotificationCenterProps) {
    const { trans } = useLocalization();
    const page = usePage();
    const pageProps = page.props as any;

    const panelPath: string = pageProps?.panel?.path || '';
    const hasDatabaseNotifications: boolean = pageProps?.panel?.hasDatabaseNotifications || false;
    const panelPolling: string | null | undefined = pageProps?.panel?.databaseNotificationsPolling;

    const pollingMs = useMemo(() => {
        const interval = pollingInterval || panelPolling || '30s';

        if (!interval) {
            return 30000;
        }

        const match = interval.match(/^(\d+)(s|m)?$/);

        if (!match) {
            return 30000;
        }

        const value = parseInt(match[1], 10);
        const unit = match[2] || 's';

        return unit === 'm' ? value * 60 * 1000 : value * 1000;
    }, [pollingInterval, panelPolling]);

    const latest = useLatest({ panelPath, hasDatabaseNotifications, pollingMs });

    const databaseNotifications = pageProps?.databaseNotifications as
        | { notifications: DatabaseNotification[]; unreadCount: number }
        | undefined;

    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotificationsState] = useState<DatabaseNotification[]>(
        () => databaseNotifications?.notifications || [],
    );
    const [unreadCount, setUnreadCountState] = useState<number>(() => databaseNotifications?.unreadCount || 0);

    // Mirrors of the state that async handlers read and write synchronously (Vue mutates refs in place).
    const notificationsRef = useRef(notifications);
    const unreadCountRef = useRef(unreadCount);

    const setNotifications = useCallback((next: DatabaseNotification[]) => {
        notificationsRef.current = next;
        setNotificationsState(next);
    }, []);

    const setUnreadCount = useCallback((next: number) => {
        unreadCountRef.current = next;
        setUnreadCountState(next);
    }, []);

    const fetchNotifications = async () => {
        if (!latest.current.hasDatabaseNotifications) {
            return;
        }

        try {
            const response = await fetch(`/${latest.current.panelPath}/notifications`);
            const data = await response.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await fetch(`/${latest.current.panelPath}/notifications/${id}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                },
            });

            const notification = notificationsRef.current.find((n) => n.id === id);

            if (notification) {
                const readAt = new Date().toISOString();
                setNotifications(notificationsRef.current.map((n) => (n.id === id ? { ...n, readAt } : n)));
                setUnreadCount(Math.max(0, unreadCountRef.current - 1));
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch(`/${latest.current.panelPath}/notifications/read-all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                },
            });

            const readAt = new Date().toISOString();
            setNotifications(notificationsRef.current.map((n) => ({ ...n, readAt })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await fetch(`/${latest.current.panelPath}/notifications/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                },
            });

            const index = notificationsRef.current.findIndex((n) => n.id === id);

            if (index !== -1) {
                const notification = notificationsRef.current[index];

                if (!notification.readAt) {
                    setUnreadCount(Math.max(0, unreadCountRef.current - 1));
                }

                const next = notificationsRef.current.slice();
                next.splice(index, 1);
                setNotifications(next);
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const deleteAllNotifications = async () => {
        try {
            await fetch(`/${latest.current.panelPath}/notifications`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                },
            });

            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to delete all notifications:', error);
        }
    };

    const handleAction = async (notification: DatabaseNotification, action: any) => {
        // Mark as read first
        if (!notification.readAt) {
            await markAsRead(notification.id);
        }

        // If action has a method (POST, etc.), make the request
        if (action.method && action.route) {
            try {
                const response = await fetch(action.route, {
                    method: action.method,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken(),
                    },
                    body: action.data ? JSON.stringify(action.data) : undefined,
                });

                if (response.ok) {
                    // Remove notification after successful action
                    if (action.closeOnClick !== false) {
                        await deleteNotification(notification.id);
                    }

                    // Optionally reload the page or update state
                    if (action.redirect) {
                        window.location.href = action.redirect;
                    } else if (action.reload) {
                        window.location.reload();
                    }
                }
            } catch (error) {
                console.error('Failed to execute action:', error);
            }
        } else if (action.onClick && typeof action.onClick === 'function') {
            action.onClick();
        }
    };

    const latestFetch = useLatest(fetchNotifications);

    // Watch for initial data from page props
    useEffect(() => {
        if (databaseNotifications) {
            setNotifications(databaseNotifications.notifications || []);
            setUnreadCount(databaseNotifications.unreadCount || 0);
        }
    }, [databaseNotifications, setNotifications, setUnreadCount]);

    // onMounted: startPolling() / onUnmounted: stopPolling()
    useEffect(() => {
        let pollingTimer: ReturnType<typeof setInterval> | null = null;

        if (latest.current.hasDatabaseNotifications) {
            pollingTimer = setInterval(() => latestFetch.current(), latest.current.pollingMs);
        }

        return () => {
            if (pollingTimer) {
                clearInterval(pollingTimer);
                pollingTimer = null;
            }
        };
    }, [latest, latestFetch]);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" disabled={!hasDatabaseNotifications}>
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center text-xs"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                    <span className="sr-only">{trans('notifications::notifications.title')}</span>
                </Button>
            </SheetTrigger>
            {/* `hide-close-button` is not a prop of the sheet in either stack; Vue renders it as a plain attribute. */}
            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col" hide-close-button="">
                {/* Mobile close button */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="sm:hidden absolute top-4 end-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">{trans('notifications::notifications.close')}</span>
                </button>

                <SheetHeader className="border-b pb-4">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            {trans('notifications::notifications.title')}
                            {unreadCount > 0 && (
                                <Badge variant="secondary">
                                    {trans('notifications::notifications.unread_count', { count: unreadCount })}
                                </Badge>
                            )}
                        </SheetTitle>
                        <div className="flex items-center gap-1">
                            {notifications.length > 0 && unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={markAllAsRead}
                                    title={trans('notifications::notifications.mark_all_read')}
                                >
                                    <CheckCheck className="h-4 w-4" />
                                </Button>
                            )}
                            {notifications.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={deleteAllNotifications}
                                    title={trans('notifications::notifications.delete_all')}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            )}
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <BellOff className="h-12 w-12 mb-4 opacity-50" />
                            <p className="text-sm">{trans('notifications::notifications.no_notifications')}</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => {
                                const StatusIcon = getStatusIcon(notification.status);

                                return (
                                    <div
                                        key={notification.id}
                                        className={cn('group relative flex gap-3 p-4 transition-colors hover:bg-muted/50', {
                                            'bg-muted/30': !notification.readAt,
                                        })}
                                    >
                                        {/* Unread indicator */}
                                        {!notification.readAt && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}

                                        <div className="flex-shrink-0 mt-0.5">
                                            <StatusIcon className={cn('h-5 w-5', getStatusColor(notification.status))} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p
                                                    className={cn('font-medium text-sm leading-5', {
                                                        'font-semibold': !notification.readAt,
                                                    })}
                                                >
                                                    {notification.title || 'Notification'}
                                                </p>
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                        {notification.humanTime}
                                                    </span>
                                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!notification.readAt && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    void markAsRead(notification.id);
                                                                }}
                                                                title={trans('notifications::notifications.mark_as_read')}
                                                            >
                                                                <Check className="h-3.5 w-3.5" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                void deleteNotification(notification.id);
                                                            }}
                                                            title={trans('notifications::notifications.delete')}
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            {notification.body && (
                                                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{notification.body}</p>
                                            )}
                                            {/* Actions */}
                                            {notification.actions && notification.actions.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {notification.actions.map((action: any, index: number) =>
                                                        action.url ? (
                                                            <a
                                                                key={index}
                                                                href={action.url}
                                                                onClick={() => {
                                                                    if (!notification.readAt) {
                                                                        void markAsRead(notification.id);
                                                                    }
                                                                }}
                                                                className={actionClasses(action)}
                                                            >
                                                                {action.label}
                                                            </a>
                                                        ) : (
                                                            <button
                                                                key={index}
                                                                onClick={() => void handleAction(notification, action)}
                                                                className={actionClasses(action)}
                                                            >
                                                                {action.label}
                                                            </button>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

export { NotificationCenter };
