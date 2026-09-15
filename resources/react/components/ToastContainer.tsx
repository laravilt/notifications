import { router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react';
import { createPortal } from 'react-dom';
import { useLatest } from '@laravilt/support/composables/hooks';
import Toast from './Toast';

export interface ToastNotification {
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

/** Vue `defineExpose({ addToast })`. */
export interface ToastContainerHandle {
    addToast(notification: ToastNotification): void;
}

export interface ToastContainerProps {
    ref?: Ref<ToastContainerHandle>;
}

export default function ToastContainer({ ref }: ToastContainerProps) {
    const page = usePage();
    const latestPage = useLatest(page);
    const [toasts, setToasts] = useState<ToastNotification[]>([]);
    const [mounted, setMounted] = useState(false);
    const initialFlashHandled = useRef(false);

    const addToast = useCallback((notification: ToastNotification) => {
        setToasts((current) => [...current, notification]);
    }, []);

    // Inertia keeps omitted props on partial reloads, so the same flash can be read again on `finish`.
    // Skip it instead of appending a second toast with the same id (and React key).
    const lastFlashId = useRef<string | null>(null);

    const addFlashToast = useCallback(
        (notification: ToastNotification) => {
            if (lastFlashId.current === notification.id) {
                return;
            }

            lastFlashId.current = notification.id;
            addToast(notification);
        },
        [addToast],
    );

    const removeToast = useCallback((id: string) => {
        setToasts((current) => {
            const index = current.findIndex((t) => t.id === id);

            if (index === -1) {
                return current;
            }

            const next = current.slice();
            next.splice(index, 1);

            return next;
        });
    }, []);

    // Check for flash notification from session
    useEffect(() => {
        setMounted(true);

        if (initialFlashHandled.current) {
            return;
        }

        initialFlashHandled.current = true;

        const flashNotification = (latestPage.current.props as any)['laravilt.notification'];

        if (flashNotification) {
            addFlashToast(flashNotification);
        }
    }, [addFlashToast, latestPage]);

    // Listen for Inertia page loads using router.on('finish')
    useEffect(() => {
        const removeFinishListener = router.on('finish', () => {
            // Vue reads the reactive page here; wait one tick so React has committed the new page props.
            setTimeout(() => {
                const flashNotification = (latestPage.current.props as any)['laravilt.notification'];

                if (flashNotification) {
                    addFlashToast(flashNotification);
                }
            }, 0);
        });

        // Clean up listener on unmount
        return () => {
            if (removeFinishListener) {
                removeFinishListener();
            }
        };
    }, [addFlashToast, latestPage]);

    // Expose method to add toasts programmatically
    useImperativeHandle(ref, () => ({ addToast }), [addToast]);

    if (!mounted || typeof document === 'undefined') {
        return null;
    }

    return createPortal(
        <div className="fixed top-4 end-4 z-50 flex flex-col gap-3 pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast {...toast} onClose={() => removeToast(toast.id)} />
                </div>
            ))}
        </div>,
        document.body,
    );
}

export { ToastContainer };
