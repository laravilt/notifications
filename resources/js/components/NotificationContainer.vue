<template>
    <!-- Top Right (default) - uses end-4 for RTL support -->
    <div class="fixed top-4 end-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-md">
        <TransitionGroup name="notification">
            <NotificationItem
                v-for="notification in topRightNotifications"
                :key="notification.id"
                :notification="notification"
                :get-icon="getIcon"
                :get-color-classes="getColorClasses"
                @remove="remove"
            />
        </TransitionGroup>
    </div>

    <!-- Top Left - uses start-4 for RTL support -->
    <div class="fixed top-4 start-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-md">
        <TransitionGroup name="notification-left">
            <NotificationItem
                v-for="notification in topLeftNotifications"
                :key="notification.id"
                :notification="notification"
                :get-icon="getIcon"
                :get-color-classes="getColorClasses"
                @remove="remove"
            />
        </TransitionGroup>
    </div>

    <!-- Bottom Right - uses end-4 for RTL support -->
    <div class="fixed bottom-4 end-4 z-[9999] flex flex-col-reverse gap-2 pointer-events-none max-w-md">
        <TransitionGroup name="notification">
            <NotificationItem
                v-for="notification in bottomRightNotifications"
                :key="notification.id"
                :notification="notification"
                :get-icon="getIcon"
                :get-color-classes="getColorClasses"
                @remove="remove"
            />
        </TransitionGroup>
    </div>

    <!-- Bottom Left - uses start-4 for RTL support -->
    <div class="fixed bottom-4 start-4 z-[9999] flex flex-col-reverse gap-2 pointer-events-none max-w-md">
        <TransitionGroup name="notification-left">
            <NotificationItem
                v-for="notification in bottomLeftNotifications"
                :key="notification.id"
                :notification="notification"
                :get-icon="getIcon"
                :get-color-classes="getColorClasses"
                @remove="remove"
            />
        </TransitionGroup>
    </div>

    <!-- Top Center -->
    <div class="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none max-w-md">
        <TransitionGroup name="notification-center">
            <NotificationItem
                v-for="notification in topCenterNotifications"
                :key="notification.id"
                :notification="notification"
                :get-icon="getIcon"
                :get-color-classes="getColorClasses"
                @remove="remove"
            />
        </TransitionGroup>
    </div>

    <!-- Bottom Center -->
    <div class="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col-reverse gap-2 pointer-events-none max-w-md">
        <TransitionGroup name="notification-center">
            <NotificationItem
                v-for="notification in bottomCenterNotifications"
                :key="notification.id"
                :notification="notification"
                :get-icon="getIcon"
                :get-color-classes="getColorClasses"
                @remove="remove"
            />
        </TransitionGroup>
    </div>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-vue-next';
import * as LucideIcons from 'lucide-vue-next';
import { usePage } from '@inertiajs/vue3';
import { useNotification } from '../composables/useNotification';
import NotificationItem from './NotificationItem.vue';

const { notifications, notify, remove } = useNotification();
const page = usePage();

// Track processed notification hashes to prevent duplicates
const processedNotifications = ref(new Set<string>());

// Map backend status to frontend type
const mapStatusToType = (notification: any) => {
    // If type is already set, use it
    if (notification.type) return notification;

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

// Watch for notifications from Inertia (from session)
watch(
    () => page.props.notifications as any[],
    (newNotifications) => {
        if (newNotifications && Array.isArray(newNotifications) && newNotifications.length > 0) {
            newNotifications.forEach((notification) => {
                // Use the backend-generated ID as primary dedup key
                // Fall back to content hash if no ID exists
                const notificationKey = notification.id || JSON.stringify({
                    title: notification.title,
                    body: notification.body,
                    status: notification.status,
                });

                if (!processedNotifications.value.has(notificationKey)) {
                    processedNotifications.value.add(notificationKey);
                    // Map status to type for backend compatibility
                    notify(mapStatusToType(notification));
                }
            });
        }
    },
    { immediate: true, deep: true }
);

// Filter notifications by position
const topRightNotifications = computed(() =>
    notifications.value.filter(n => !n.position || n.position === 'top-right')
);
const topLeftNotifications = computed(() =>
    notifications.value.filter(n => n.position === 'top-left')
);
const bottomRightNotifications = computed(() =>
    notifications.value.filter(n => n.position === 'bottom-right')
);
const bottomLeftNotifications = computed(() =>
    notifications.value.filter(n => n.position === 'bottom-left')
);
const topCenterNotifications = computed(() =>
    notifications.value.filter(n => n.position === 'top-center')
);
const bottomCenterNotifications = computed(() =>
    notifications.value.filter(n => n.position === 'bottom-center')
);

const notificationClasses: Record<string, string> = {
    success: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-400 dark:border-green-800',
    error: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-400 dark:border-red-800',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-400 dark:border-yellow-800',
    info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-400 dark:border-blue-800',
};

const defaultIcons: Record<string, any> = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

const getIcon = (notification: any) => {
    if (notification.icon) {
        // Get custom icon from Lucide
        const iconName = notification.icon
            .split('-')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');

        return (LucideIcons as any)[iconName] || defaultIcons[notification.type || 'success'];
    }

    return defaultIcons[notification.type || 'success'];
};

const getColorClasses = (notification: any) => {
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
</script>

<style scoped>
/* Right side animations (flips for RTL) */
.notification-enter-active,
.notification-leave-active {
    transition: all 0.3s ease;
}

.notification-enter-from {
    opacity: 0;
    transform: translateX(100%);
}

.notification-leave-to {
    opacity: 0;
    transform: translateX(100%);
}

:dir(rtl) .notification-enter-from {
    transform: translateX(-100%);
}

:dir(rtl) .notification-leave-to {
    transform: translateX(-100%);
}

.notification-move {
    transition: transform 0.3s ease;
}

/* Left side animations (flips for RTL) */
.notification-left-enter-active,
.notification-left-leave-active {
    transition: all 0.3s ease;
}

.notification-left-enter-from {
    opacity: 0;
    transform: translateX(-100%);
}

.notification-left-leave-to {
    opacity: 0;
    transform: translateX(-100%);
}

:dir(rtl) .notification-left-enter-from {
    transform: translateX(100%);
}

:dir(rtl) .notification-left-leave-to {
    transform: translateX(100%);
}

.notification-left-move {
    transition: transform 0.3s ease;
}

/* Center animations */
.notification-center-enter-active,
.notification-center-leave-active {
    transition: all 0.3s ease;
}

.notification-center-enter-from {
    opacity: 0;
    transform: translateY(-20px);
}

.notification-center-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

.notification-center-move {
    transition: transform 0.3s ease;
}
</style>
