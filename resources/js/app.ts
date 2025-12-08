// Laravilt Notifications Package Entry Point
import { notify } from './composables/useNotification';

export { default as NotificationContainer } from './components/NotificationContainer.vue';
export { useNotification, notify } from './composables/useNotification';

// Track if interceptor is already set up
let cookieCheckInitialized = false;

/**
 * Get a cookie value by name
 */
function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
    }
    return null;
}

/**
 * Delete a cookie by name
 */
function deleteCookie(name: string) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

/**
 * Process notifications from the laravilt_notifications cookie
 * This cookie is set by ActionController when session flash data won't persist
 * (e.g., in Playwright tests where session IDs change between requests)
 */
function processNotificationCookie() {
    const cookieValue = getCookie('laravilt_notifications');
    if (!cookieValue) return;

    try {
        const decoded = atob(decodeURIComponent(cookieValue));
        const notifications = JSON.parse(decoded);

        if (Array.isArray(notifications)) {
            notifications.forEach((notification: any) => {
                // Map backend notification format to frontend
                // Backend uses 'danger' but frontend uses 'error'
                const statusMap: Record<string, string> = {
                    success: 'success',
                    danger: 'error',
                    warning: 'warning',
                    info: 'info',
                };
                const rawType = notification.status || notification.type || 'success';
                const type = statusMap[rawType] || rawType;
                const title = notification.title || '';
                const body = notification.body || notification.message || '';

                // Convert heroicon format to lucide format if needed
                // e.g., 'heroicon-o-check-circle' -> 'check-circle'
                let icon = notification.icon;
                if (icon && icon.startsWith('heroicon-')) {
                    icon = icon.replace(/^heroicon-[os]-/, '');
                }

                if (title || body) {
                    notify({
                        title,
                        body,
                        type,
                        icon,
                        color: notification.color,
                        duration: notification.duration,
                        persistent: notification.persistent,
                        dismissible: notification.dismissible,
                        position: notification.position,
                        actions: notification.actions,
                    });
                }
            });
        }

        // Delete the cookie after processing
        deleteCookie('laravilt_notifications');
    } catch (e) {
        console.error('Failed to parse laravilt_notifications cookie:', e);
        // Delete the malformed cookie
        deleteCookie('laravilt_notifications');
    }
}

/**
 * Initialize the notification cookie check
 * This runs on page load and after Inertia navigations
 */
export function setupNotificationCookieCheck() {
    if (typeof window === 'undefined') return;
    if (cookieCheckInitialized) return;
    cookieCheckInitialized = true;

    // Check on initial page load
    processNotificationCookie();

    // Listen for Inertia navigation events
    // Use MutationObserver to detect page changes (more reliable than Inertia events)
    const observer = new MutationObserver(() => {
        // Small delay to ensure cookie is set
        setTimeout(processNotificationCookie, 50);
    });

    // Observe the document body for Inertia page swaps
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Also check on popstate (browser back/forward)
    window.addEventListener('popstate', () => {
        setTimeout(processNotificationCookie, 50);
    });

    // Also intercept fetch to check cookie after any request
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const response = await originalFetch.apply(this, args);
        // Check for notification cookie after each fetch
        setTimeout(processNotificationCookie, 100);
        return response;
    };

    console.log('[Laravilt Notifications] Cookie check initialized');
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
    // Run immediately in case the page was already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupNotificationCookieCheck);
    } else {
        setupNotificationCookieCheck();
    }
}
