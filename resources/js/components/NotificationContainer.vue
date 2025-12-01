<template>
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-md">
        <TransitionGroup name="notification">
            <div
                v-for="notification in notifications"
                :key="notification.id"
                :class="[
                    'pointer-events-auto w-full rounded-lg shadow-lg p-4 flex gap-3 border',
                    notification.color ? getCustomColorClasses(notification.color) : notificationClasses[notification.type || 'success']
                ]"
            >
                <!-- Icon -->
                <component
                    :is="getIcon(notification)"
                    class="size-5 flex-shrink-0 mt-0.5"
                />

                <!-- Content -->
                <div class="flex-1 min-w-0">
                    <!-- Title -->
                    <p v-if="notification.title" class="text-sm font-semibold mb-0.5">
                        {{ notification.title }}
                    </p>

                    <!-- Body or Message -->
                    <p class="text-sm" :class="notification.title ? 'text-current/80' : 'font-medium'">
                        {{ notification.body || notification.message }}
                    </p>

                    <!-- Actions -->
                    <div v-if="notification.actions && notification.actions.length" class="flex gap-2 mt-3">
                        <button
                            v-for="(action, index) in notification.actions"
                            :key="index"
                            @click="action.onClick"
                            :class="[
                                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                                action.variant === 'outline'
                                    ? 'border border-current/20 hover:bg-current/10'
                                    : action.variant === 'ghost'
                                    ? 'hover:bg-current/10'
                                    : 'bg-current/90 text-white hover:bg-current'
                            ]"
                        >
                            {{ action.label }}
                        </button>
                    </div>
                </div>

                <!-- Close button -->
                <button
                    @click="remove(notification.id)"
                    class="flex-shrink-0 text-current/60 hover:text-current transition-colors"
                >
                    <X class="size-4" />
                </button>
            </div>
        </TransitionGroup>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next';
import * as LucideIcons from 'lucide-vue-next';
import { useNotification } from '../composables/useNotification';

const { notifications, remove } = useNotification();

const notificationClasses = {
    success: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
    error: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
    info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
};

const defaultIcons = {
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

const getCustomColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
        primary: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
        secondary: 'bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800',
        danger: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
        purple: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
        indigo: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800',
    };

    return colorMap[color] || notificationClasses.success;
};
</script>

<style scoped>
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

.notification-move {
    transition: transform 0.3s ease;
}
</style>
