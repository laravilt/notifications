<template>
    <div
        :class="[
            'pointer-events-auto w-full rounded-lg shadow-lg p-4 flex gap-3 border',
            getColorClasses(notification)
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
            v-if="notification.dismissible !== false"
            @click="$emit('remove', notification.id)"
            class="flex-shrink-0 text-current/60 hover:text-current transition-colors"
        >
            <X class="size-4" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next';

defineProps<{
    notification: any;
    getIcon: (notification: any) => any;
    getColorClasses: (notification: any) => string;
}>();

defineEmits<{
    (e: 'remove', id: string): void;
}>();
</script>
