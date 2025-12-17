<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { usePage } from '@inertiajs/vue3';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Bell,
    BellOff,
    Check,
    CheckCheck,
    Trash2,
    X,
    AlertCircle,
    CheckCircle2,
    AlertTriangle,
    Info,
} from 'lucide-vue-next';
import { useLocalization } from '@/composables/useLocalization';

const { trans } = useLocalization();

interface DatabaseNotification {
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

interface Props {
    pollingInterval?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
    pollingInterval: '30s',
});

const page = usePage<{
    panel?: {
        id: string;
        path: string;
        hasDatabaseNotifications: boolean;
        databaseNotificationsPolling: string | null;
    };
    databaseNotifications?: {
        notifications: DatabaseNotification[];
        unreadCount: number;
    };
}>();

const isOpen = ref(false);
const isLoading = ref(false);
const notifications = ref<DatabaseNotification[]>([]);
const unreadCount = ref(0);
let pollingTimer: ReturnType<typeof setInterval> | null = null;

const panelPath = computed(() => page.props?.panel?.path || '');
const hasDatabaseNotifications = computed(() => page.props?.panel?.hasDatabaseNotifications || false);
const pollingMs = computed(() => {
    const interval = props.pollingInterval || page.props?.panel?.databaseNotificationsPolling || '30s';
    if (!interval) return 30000;

    const match = interval.match(/^(\d+)(s|m)?$/);
    if (!match) return 30000;

    const value = parseInt(match[1], 10);
    const unit = match[2] || 's';

    return unit === 'm' ? value * 60 * 1000 : value * 1000;
});

const getStatusIcon = (status: string) => {
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

const getStatusColor = (status: string) => {
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

const fetchNotifications = async () => {
    if (!hasDatabaseNotifications.value) return;

    try {
        const response = await fetch(`/${panelPath.value}/notifications`);
        const data = await response.json();
        notifications.value = data.notifications || [];
        unreadCount.value = data.unreadCount || 0;
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
    }
};

const markAsRead = async (id: string) => {
    try {
        await fetch(`/${panelPath.value}/notifications/${id}/read`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
            },
        });

        const notification = notifications.value.find((n) => n.id === id);
        if (notification) {
            notification.readAt = new Date().toISOString();
            unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
    }
};

const markAllAsRead = async () => {
    try {
        await fetch(`/${panelPath.value}/notifications/read-all`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
            },
        });

        notifications.value.forEach((n) => {
            n.readAt = new Date().toISOString();
        });
        unreadCount.value = 0;
    } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
    }
};

const deleteNotification = async (id: string) => {
    try {
        await fetch(`/${panelPath.value}/notifications/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
            },
        });

        const index = notifications.value.findIndex((n) => n.id === id);
        if (index !== -1) {
            const notification = notifications.value[index];
            if (!notification.readAt) {
                unreadCount.value = Math.max(0, unreadCount.value - 1);
            }
            notifications.value.splice(index, 1);
        }
    } catch (error) {
        console.error('Failed to delete notification:', error);
    }
};

const deleteAllNotifications = async () => {
    try {
        await fetch(`/${panelPath.value}/notifications`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
            },
        });

        notifications.value = [];
        unreadCount.value = 0;
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
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
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

const startPolling = () => {
    if (pollingTimer) clearInterval(pollingTimer);
    if (!hasDatabaseNotifications.value) return;

    pollingTimer = setInterval(fetchNotifications, pollingMs.value);
};

const stopPolling = () => {
    if (pollingTimer) {
        clearInterval(pollingTimer);
        pollingTimer = null;
    }
};

// Watch for initial data from page props
watch(
    () => page.props?.databaseNotifications,
    (data) => {
        if (data) {
            notifications.value = data.notifications || [];
            unreadCount.value = data.unreadCount || 0;
        }
    },
    { immediate: true }
);

onMounted(() => {
    if (hasDatabaseNotifications.value) {
        startPolling();
    }
});

onUnmounted(() => {
    stopPolling();
});
</script>

<template>
    <Sheet v-model:open="isOpen">
        <SheetTrigger as-child>
            <Button
                variant="ghost"
                size="icon"
                class="relative"
                :disabled="!hasDatabaseNotifications"
            >
                <Bell class="h-5 w-5" />
                <Badge
                    v-if="unreadCount > 0"
                    variant="destructive"
                    class="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center text-xs"
                >
                    {{ unreadCount > 99 ? '99+' : unreadCount }}
                </Badge>
                <span class="sr-only">{{ trans('notifications::notifications.title') }}</span>
            </Button>
        </SheetTrigger>
        <SheetContent side="right" class="w-full sm:max-w-md flex flex-col" hide-close-button>
            <!-- Mobile close button -->
            <button
                @click="isOpen = false"
                class="sm:hidden absolute top-4 end-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
                <X class="h-4 w-4" />
                <span class="sr-only">{{ trans('notifications::notifications.close') }}</span>
            </button>

            <SheetHeader class="border-b pb-4">
                <div class="flex items-center justify-between">
                    <SheetTitle class="flex items-center gap-2">
                        <Bell class="h-5 w-5" />
                        {{ trans('notifications::notifications.title') }}
                        <Badge v-if="unreadCount > 0" variant="secondary">
                            {{ trans('notifications::notifications.unread_count', { count: unreadCount }) }}
                        </Badge>
                    </SheetTitle>
                    <div class="flex items-center gap-1">
                        <Button
                            v-if="notifications.length > 0 && unreadCount > 0"
                            variant="ghost"
                            size="sm"
                            @click="markAllAsRead"
                            :title="trans('notifications::notifications.mark_all_read')"
                        >
                            <CheckCheck class="h-4 w-4" />
                        </Button>
                        <Button
                            v-if="notifications.length > 0"
                            variant="ghost"
                            size="sm"
                            @click="deleteAllNotifications"
                            :title="trans('notifications::notifications.delete_all')"
                        >
                            <Trash2 class="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                </div>
            </SheetHeader>

            <div class="flex-1 overflow-y-auto">
                <div v-if="notifications.length === 0" class="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <BellOff class="h-12 w-12 mb-4 opacity-50" />
                    <p class="text-sm">{{ trans('notifications::notifications.no_notifications') }}</p>
                </div>

                <div v-else class="divide-y">
                    <div
                        v-for="notification in notifications"
                        :key="notification.id"
                        class="group relative flex gap-3 p-4 transition-colors hover:bg-muted/50"
                        :class="{ 'bg-muted/30': !notification.readAt }"
                    >
                        <!-- Unread indicator -->
                        <div
                            v-if="!notification.readAt"
                            class="absolute left-0 top-0 bottom-0 w-1 bg-primary"
                        />

                        <div class="flex-shrink-0 mt-0.5">
                            <component
                                :is="getStatusIcon(notification.status)"
                                class="h-5 w-5"
                                :class="getStatusColor(notification.status)"
                            />
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-start justify-between gap-2">
                                <p class="font-medium text-sm leading-5" :class="{ 'font-semibold': !notification.readAt }">
                                    {{ notification.title || 'Notification' }}
                                </p>
                                <div class="flex items-center gap-1 flex-shrink-0">
                                    <span class="text-xs text-muted-foreground whitespace-nowrap">
                                        {{ notification.humanTime }}
                                    </span>
                                    <div class="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            v-if="!notification.readAt"
                                            variant="ghost"
                                            size="icon"
                                            class="h-6 w-6"
                                            @click.stop="markAsRead(notification.id)"
                                            :title="trans('notifications::notifications.mark_as_read')"
                                        >
                                            <Check class="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            class="h-6 w-6 text-muted-foreground hover:text-destructive"
                                            @click.stop="deleteNotification(notification.id)"
                                            :title="trans('notifications::notifications.delete')"
                                        >
                                            <X class="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <p v-if="notification.body" class="text-sm text-muted-foreground mt-1 leading-relaxed">
                                {{ notification.body }}
                            </p>
                            <!-- Actions -->
                            <div v-if="notification.actions && notification.actions.length > 0" class="flex flex-wrap gap-2 mt-3">
                                <template v-for="(action, index) in notification.actions" :key="index">
                                    <a
                                        v-if="action.url"
                                        :href="action.url"
                                        @click="() => { if (!notification.readAt) markAsRead(notification.id); }"
                                        :class="[
                                            'inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                                            action.color === 'danger' || action.variant === 'destructive'
                                                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                                : action.variant === 'outline'
                                                ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                                                : action.variant === 'ghost'
                                                ? 'hover:bg-accent hover:text-accent-foreground'
                                                : 'bg-primary text-primary-foreground hover:bg-primary/90'
                                        ]"
                                    >
                                        {{ action.label }}
                                    </a>
                                    <button
                                        v-else
                                        @click="handleAction(notification, action)"
                                        :class="[
                                            'inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                                            action.color === 'danger' || action.variant === 'destructive'
                                                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                                : action.variant === 'outline'
                                                ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                                                : action.variant === 'ghost'
                                                ? 'hover:bg-accent hover:text-accent-foreground'
                                                : 'bg-primary text-primary-foreground hover:bg-primary/90'
                                        ]"
                                    >
                                        {{ action.label }}
                                    </button>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SheetContent>
    </Sheet>
</template>
