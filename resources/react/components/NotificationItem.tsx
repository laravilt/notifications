import { X } from 'lucide-react';
import type { ComponentType } from 'react';
import { cn } from '@/lib/utils';

export interface NotificationItemProps {
    notification: any;
    getIcon: (notification: any) => ComponentType<{ className?: string }> | null | undefined;
    getColorClasses: (notification: any) => string;
    /** Vue `remove` event. */
    onRemove?: (id: string) => void;
}

export default function NotificationItem({ notification, getIcon, getColorClasses, onRemove }: NotificationItemProps) {
    const Icon = getIcon(notification);

    return (
        <div className={cn('pointer-events-auto w-full rounded-lg shadow-lg p-4 flex gap-3 border', getColorClasses(notification))}>
            {/* Icon */}
            {Icon && <Icon className="size-5 flex-shrink-0 mt-0.5" />}

            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Title */}
                {notification.title && <p className="text-sm font-semibold mb-0.5">{notification.title}</p>}

                {/* Body or Message */}
                <p className={cn('text-sm', notification.title ? 'text-current/80' : 'font-medium')}>
                    {notification.body || notification.message}
                </p>

                {/* Actions */}
                {notification.actions && notification.actions.length ? (
                    <div className="flex gap-2 mt-3">
                        {notification.actions.map((action: any, index: number) => (
                            <button
                                key={index}
                                onClick={action.onClick}
                                className={cn(
                                    'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                                    action.variant === 'outline'
                                        ? 'border border-current/20 hover:bg-current/10'
                                        : action.variant === 'ghost'
                                          ? 'hover:bg-current/10'
                                          : 'bg-current/90 text-white hover:bg-current',
                                )}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                ) : null}
            </div>

            {/* Close button */}
            {notification.dismissible !== false && (
                <button
                    onClick={() => onRemove?.(notification.id)}
                    className="flex-shrink-0 text-current/60 hover:text-current transition-colors"
                >
                    <X className="size-4" />
                </button>
            )}
        </div>
    );
}

export { NotificationItem };
