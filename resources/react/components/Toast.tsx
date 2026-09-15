import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { resolveIcon } from '@laravilt/support/lib/icons';
import { useLatest } from '@laravilt/support/composables/hooks';
import { cn } from '@/lib/utils';

export interface ToastProps {
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
    /** Vue `close` event (fired 300ms after the toast starts hiding). */
    onClose?: () => void;
}

type Phase = 'enter-from' | 'enter-to' | 'idle' | 'leave-from' | 'leave-to' | 'gone';

// Same classes as the Vue <Transition> enter/leave props
const phaseClasses: Record<Phase, string> = {
    'enter-from': 'transition duration-300 ease-out transform translate-x-full opacity-0',
    'enter-to': 'transition duration-300 ease-out transform translate-x-0 opacity-100',
    idle: '',
    'leave-from': 'transition duration-200 ease-in transform translate-x-0 opacity-100',
    'leave-to': 'transition duration-200 ease-in transform translate-x-full opacity-0',
    gone: '',
};

const statusClassMap = {
    success: 'bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100 border-green-200 dark:border-green-800',
    danger: 'bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100 border-red-200 dark:border-red-800',
    warning: 'bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-100 border-amber-200 dark:border-amber-800',
    info: 'bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-800',
};

const statusIcons: Record<string, string> = {
    success: 'CheckCircle',
    danger: 'XCircle',
    warning: 'AlertTriangle',
    info: 'Info',
};

/** Run a callback after the next two animation frames (like Vue's transition `nextFrame`). */
function nextFrame(callback: () => void): () => void {
    let second = 0;
    const first = requestAnimationFrame(() => {
        second = requestAnimationFrame(callback);
    });

    return () => {
        cancelAnimationFrame(first);
        cancelAnimationFrame(second);
    };
}

export default function Toast({
    status = 'info',
    title,
    body,
    icon,
    duration = 3000,
    persistent = false,
    dismissible = true,
    actions = [],
    onClose,
}: ToastProps) {
    const [phase, setPhase] = useState<Phase>('enter-from');
    const latestOnClose = useLatest(onClose);
    const cleanups = useRef<Array<() => void>>([]);
    const closing = useRef(false);

    const schedule = (callback: () => void, ms: number) => {
        const timer = setTimeout(callback, ms);
        cleanups.current.push(() => clearTimeout(timer));
    };

    const close = () => {
        if (closing.current) {
            return;
        }

        closing.current = true;
        setPhase('leave-from');
        cleanups.current.push(nextFrame(() => setPhase('leave-to')));
        schedule(() => setPhase('gone'), 200);
        schedule(() => latestOnClose.current?.(), 300);
    };

    const latestClose = useLatest(close);

    useEffect(() => {
        closing.current = false;
        setPhase('enter-from');
        cleanups.current.push(nextFrame(() => setPhase('enter-to')));
        schedule(() => setPhase((current) => (current === 'enter-to' ? 'idle' : current)), 300);

        if (!persistent && duration) {
            schedule(() => latestClose.current(), duration);
        }

        return () => {
            cleanups.current.forEach((cleanup) => cleanup());
            cleanups.current = [];
        };
        // onMounted only, like the Vue component
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (phase === 'gone') {
        return null;
    }

    const statusClasses = statusClassMap[status] || statusClassMap.info;
    const iconName = icon || statusIcons[status];
    const IconComponent = iconName ? resolveIcon(iconName) : null;

    return (
        <div
            className={cn('flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-md', statusClasses, phaseClasses[phase])}
            role="alert"
        >
            {iconName && <div className="flex-shrink-0">{IconComponent && <IconComponent className="size-5" />}</div>}

            <div className="flex-1 min-w-0">
                {title && <h3 className="text-sm font-semibold">{title}</h3>}
                {body && <p className={cn('text-sm', { 'mt-1': title })}>{body}</p>}

                {actions.length > 0 && (
                    <div className="flex gap-2 mt-3">
                        {actions.map((action: any) => (
                            <button
                                key={action.name}
                                type="button"
                                className="text-xs font-medium underline hover:no-underline"
                                onClick={action.onClick}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {dismissible && (
                <button type="button" className="flex-shrink-0 hover:opacity-70 transition-opacity" onClick={close} aria-label="Close">
                    <X className="size-4" />
                </button>
            )}
        </div>
    );
}

export { Toast };
