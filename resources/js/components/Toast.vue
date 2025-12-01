<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { X } from 'lucide-vue-next';

interface ToastProps {
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

const props = withDefaults(defineProps<ToastProps>(), {
    status: 'info',
    duration: 3000,
    persistent: false,
    dismissible: true,
    actions: () => [],
    data: () => ({}),
});

const emit = defineEmits<{
    close: [];
}>();

const isVisible = ref(true);

onMounted(() => {
    if (!props.persistent && props.duration) {
        setTimeout(() => {
            close();
        }, props.duration);
    }
});

const close = () => {
    isVisible.value = false;
    setTimeout(() => {
        emit('close');
    }, 300);
};

const statusClasses = computed(() => {
    const classes = {
        success: 'bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100 border-green-200 dark:border-green-800',
        danger: 'bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100 border-red-200 dark:border-red-800',
        warning: 'bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-100 border-amber-200 dark:border-amber-800',
        info: 'bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-800',
    };
    return classes[props.status] || classes.info;
});

const iconComponent = computed(() => {
    const icons: Record<string, string> = {
        success: 'CheckCircle',
        danger: 'XCircle',
        warning: 'AlertTriangle',
        info: 'Info',
    };
    return props.icon || icons[props.status];
});
</script>

<template>
    <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform translate-x-full opacity-0"
        enter-to-class="transform translate-x-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform translate-x-0 opacity-100"
        leave-to-class="transform translate-x-full opacity-0"
    >
        <div
            v-if="isVisible"
            :class="['flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-md', statusClasses]"
            role="alert"
        >
            <div v-if="iconComponent" class="flex-shrink-0">
                <component :is="iconComponent" class="size-5" />
            </div>

            <div class="flex-1 min-w-0">
                <h3 v-if="title" class="text-sm font-semibold">{{ title }}</h3>
                <p v-if="body" class="text-sm" :class="{ 'mt-1': title }">{{ body }}</p>

                <div v-if="actions.length > 0" class="flex gap-2 mt-3">
                    <button
                        v-for="action in actions"
                        :key="action.name"
                        type="button"
                        class="text-xs font-medium underline hover:no-underline"
                        @click="action.onClick"
                    >
                        {{ action.label }}
                    </button>
                </div>
            </div>

            <button
                v-if="dismissible"
                type="button"
                class="flex-shrink-0 hover:opacity-70 transition-opacity"
                @click="close"
                aria-label="Close"
            >
                <X class="size-4" />
            </button>
        </div>
    </Transition>
</template>
