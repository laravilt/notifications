<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { usePage, router } from '@inertiajs/vue3';
import Toast from './Toast.vue';

interface ToastNotification {
    id: string;
    status?: 'success' | 'danger' | 'warning' | 'info';
    title?: string;
    body?: string;
    icon?: string;
    color?: string;
    duration?: number | null;
    persistent?: boolean;
    dismissible?: boolean;
    actions?: any[];
    data?: Record<string, any>;
}

const page = usePage();
const toasts = ref<ToastNotification[]>([]);

// Check for flash notification from session
onMounted(() => {
    const flashNotification = (page.props as any)['laravilt.notification'];
    if (flashNotification) {
        addToast(flashNotification);
    }
});

// Listen for Inertia page loads using router.on() in Inertia v2
const removeFinishListener = router.on('finish', () => {
    const flashNotification = (page.props as any)['laravilt.notification'];
    if (flashNotification) {
        addToast(flashNotification);
    }
});

// Clean up listener on unmount
onUnmounted(() => {
    if (removeFinishListener) {
        removeFinishListener();
    }
});

const addToast = (notification: ToastNotification) => {
    toasts.value.push(notification);
};

const removeToast = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index > -1) {
        toasts.value.splice(index, 1);
    }
};

// Expose method to add toasts programmatically
defineExpose({
    addToast,
});
</script>

<template>
    <Teleport to="body">
        <div class="fixed top-4 end-4 z-50 flex flex-col gap-3 pointer-events-none">
            <div
                v-for="toast in toasts"
                :key="toast.id"
                class="pointer-events-auto"
            >
                <Toast
                    v-bind="toast"
                    @close="removeToast(toast.id)"
                />
            </div>
        </div>
    </Teleport>
</template>
