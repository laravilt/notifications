import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useNotification, notify } from '../useNotification';

describe('useNotification', () => {
    beforeEach(() => {
        // Clear notifications before each test
        const { clear } = useNotification();
        clear();
    });

    it('can create a notification', () => {
        const { notify: notifyFn, notifications } = useNotification();

        notifyFn('Test message', 'success');

        expect(notifications).toHaveLength(1);
        expect(notifications[0].message).toBe('Test message');
        expect(notifications[0].type).toBe('success');
    });

    it('generates unique ids for notifications', () => {
        const { notify: notifyFn, notifications } = useNotification();

        notifyFn('First message');
        notifyFn('Second message');

        expect(notifications).toHaveLength(2);
        expect(notifications[0].id).not.toBe(notifications[1].id);
    });

    it('can create success notifications', () => {
        const { notify: notifyFn, notifications } = useNotification();

        notifyFn('Success!', 'success');

        expect(notifications[0].type).toBe('success');
        expect(notifications[0].message).toBe('Success!');
    });

    it('can create error notifications', () => {
        const { notify: notifyFn, notifications } = useNotification();

        notifyFn('Error!', 'error');

        expect(notifications[0].type).toBe('error');
        expect(notifications[0].message).toBe('Error!');
    });

    it('can create warning notifications', () => {
        const { notify: notifyFn, notifications } = useNotification();

        notifyFn('Warning!', 'warning');

        expect(notifications[0].type).toBe('warning');
        expect(notifications[0].message).toBe('Warning!');
    });

    it('can create info notifications', () => {
        const { notify: notifyFn, notifications } = useNotification();

        notifyFn('Info!', 'info');

        expect(notifications[0].type).toBe('info');
        expect(notifications[0].message).toBe('Info!');
    });

    it('defaults to success type', () => {
        const { notify: notifyFn, notifications } = useNotification();

        notifyFn('Test message');

        expect(notifications[0].type).toBe('success');
    });

    it('can set custom duration', () => {
        const { notify: notifyFn, notifications } = useNotification();

        notifyFn('Test', 'success', 5000);

        expect(notifications[0].duration).toBe(5000);
    });

    it('defaults to 3000ms duration', () => {
        const { notify: notifyFn, notifications } = useNotification();

        notifyFn('Test');

        expect(notifications[0].duration).toBe(3000);
    });

    it('can remove notification by id', () => {
        const { notify: notifyFn, notifications, remove } = useNotification();

        const id = notifyFn('Test message');

        expect(notifications).toHaveLength(1);

        remove(id);

        expect(notifications).toHaveLength(0);
    });

    it('can handle removing non-existent notification', () => {
        const { notifications, remove } = useNotification();

        expect(() => remove('non-existent-id')).not.toThrow();
        expect(notifications).toHaveLength(0);
    });

    it('can clear all notifications', () => {
        const { notify: notifyFn, notifications, clear } = useNotification();

        notifyFn('First');
        notifyFn('Second');
        notifyFn('Third');

        expect(notifications).toHaveLength(3);

        clear();

        expect(notifications).toHaveLength(0);
    });

    it('can handle multiple notifications', () => {
        const { notify: notifyFn, notifications } = useNotification();

        notifyFn('First', 'success');
        notifyFn('Second', 'error');
        notifyFn('Third', 'warning');

        expect(notifications).toHaveLength(3);
        expect(notifications[0].type).toBe('success');
        expect(notifications[1].type).toBe('error');
        expect(notifications[2].type).toBe('warning');
    });

    it('auto-removes notification after duration', async () => {
        vi.useFakeTimers();

        const { notify: notifyFn, notifications } = useNotification();

        notifyFn('Test', 'success', 1000);

        expect(notifications).toHaveLength(1);

        // Fast-forward time
        vi.advanceTimersByTime(1000);

        // Wait for setTimeout to execute
        await vi.runAllTimersAsync();

        expect(notifications).toHaveLength(0);

        vi.useRealTimers();
    });

    it('does not auto-remove if duration is 0', async () => {
        vi.useFakeTimers();

        const { notify: notifyFn, notifications } = useNotification();

        notifyFn('Test', 'success', 0);

        expect(notifications).toHaveLength(1);

        vi.advanceTimersByTime(5000);

        expect(notifications).toHaveLength(1);

        vi.useRealTimers();
    });

    it('returns notification id', () => {
        const { notify: notifyFn } = useNotification();

        const id = notifyFn('Test');

        expect(id).toMatch(/notification-\d+/);
    });

    it('maintains notification order', () => {
        const { notify: notifyFn, notifications } = useNotification();

        notifyFn('First');
        notifyFn('Second');
        notifyFn('Third');

        expect(notifications[0].message).toBe('First');
        expect(notifications[1].message).toBe('Second');
        expect(notifications[2].message).toBe('Third');
    });

    it('handles removing middle notification', () => {
        const { notify: notifyFn, notifications, remove } = useNotification();

        notifyFn('First');
        const secondId = notifyFn('Second');
        notifyFn('Third');

        expect(notifications).toHaveLength(3);

        remove(secondId);

        expect(notifications).toHaveLength(2);
        expect(notifications[0].message).toBe('First');
        expect(notifications[1].message).toBe('Third');
    });
});

describe('notify global function', () => {
    beforeEach(() => {
        const { clear } = useNotification();
        clear();
    });

    it('works as a standalone function', () => {
        const { notifications } = useNotification();

        notify('Test message', 'success');

        expect(notifications).toHaveLength(1);
        expect(notifications[0].message).toBe('Test message');
    });

    it('returns notification id', () => {
        const id = notify('Test');

        expect(id).toMatch(/notification-\d+/);
    });

    it('supports all notification types', () => {
        const { notifications } = useNotification();

        notify('Success', 'success');
        notify('Error', 'error');
        notify('Warning', 'warning');
        notify('Info', 'info');

        expect(notifications).toHaveLength(4);
        expect(notifications[0].type).toBe('success');
        expect(notifications[1].type).toBe('error');
        expect(notifications[2].type).toBe('warning');
        expect(notifications[3].type).toBe('info');
    });

    it('supports custom duration', () => {
        const { notifications } = useNotification();

        notify('Test', 'success', 5000);

        expect(notifications[0].duration).toBe(5000);
    });
});

describe('notification composable sharing state', () => {
    beforeEach(() => {
        const { clear } = useNotification();
        clear();
    });

    it('shares state across multiple composable instances', () => {
        const instance1 = useNotification();
        const instance2 = useNotification();

        instance1.notify('Test');

        expect(instance1.notifications).toHaveLength(1);
        expect(instance2.notifications).toHaveLength(1);
        expect(instance1.notifications[0]).toBe(instance2.notifications[0]);
    });

    it('removes notification across all instances', () => {
        const instance1 = useNotification();
        const instance2 = useNotification();

        const id = instance1.notify('Test');

        expect(instance1.notifications).toHaveLength(1);
        expect(instance2.notifications).toHaveLength(1);

        instance2.remove(id);

        expect(instance1.notifications).toHaveLength(0);
        expect(instance2.notifications).toHaveLength(0);
    });

    it('clears all notifications across instances', () => {
        const instance1 = useNotification();
        const instance2 = useNotification();

        instance1.notify('First');
        instance2.notify('Second');

        expect(instance1.notifications).toHaveLength(2);
        expect(instance2.notifications).toHaveLength(2);

        instance1.clear();

        expect(instance1.notifications).toHaveLength(0);
        expect(instance2.notifications).toHaveLength(0);
    });
});
