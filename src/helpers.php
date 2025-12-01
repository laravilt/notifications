<?php

if (! function_exists('notify')) {
    /**
     * Add a notification to the session to be displayed on the next request.
     *
     * @param  string|array  $title  Notification title or array of notification data
     * @param  string|null  $body  Notification body (optional if $title is array)
     * @param  string  $type  Notification type (success, error, warning, info)
     * @param  array  $options  Additional options (icon, color, actions, duration)
     */
    function notify(string|array $title, ?string $body = null, string $type = 'success', array $options = []): void
    {
        // If title is an array, it contains all notification data
        if (is_array($title)) {
            $notification = $title;
        } else {
            // Build notification from parameters
            $notification = [
                'title' => $title,
                'body' => $body,
                'type' => $type,
                'icon' => $options['icon'] ?? null,
                'color' => $options['color'] ?? null,
                'actions' => $options['actions'] ?? [],
                'duration' => $options['duration'] ?? 3000,
            ];
        }

        // Ensure required fields
        if (! isset($notification['type'])) {
            $notification['type'] = 'success';
        }

        $notifications = session()->get('notifications', []);
        $notifications[] = $notification;
        session()->flash('notifications', $notifications);
    }
}
