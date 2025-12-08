<?php

declare(strict_types=1);

namespace Laravilt\Notifications\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['notifications' => [], 'unreadCount' => 0]);
        }

        $notifications = $user->notifications()
            ->latest()
            ->take(50)
            ->get()
            ->map(fn ($notification) => $this->formatNotification($notification));

        $unreadCount = $user->unreadNotifications()->count();

        return response()->json([
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }

    /**
     * Get unread notifications for the authenticated user.
     */
    public function unread(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['notifications' => [], 'unreadCount' => 0]);
        }

        $notifications = $user->unreadNotifications()
            ->latest()
            ->take(50)
            ->get()
            ->map(fn ($notification) => $this->formatNotification($notification));

        return response()->json([
            'notifications' => $notifications,
            'unreadCount' => $notifications->count(),
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['success' => false], 401);
        }

        $notification = $user->notifications()->find($id);

        if ($notification) {
            $notification->markAsRead();
        }

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['success' => false], 401);
        }

        $user->unreadNotifications->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Delete a notification.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['success' => false], 401);
        }

        $notification = $user->notifications()->find($id);

        if ($notification) {
            $notification->delete();
        }

        return response()->json(['success' => true]);
    }

    /**
     * Delete all notifications.
     */
    public function destroyAll(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['success' => false], 401);
        }

        $user->notifications()->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Format a notification for the frontend.
     */
    protected function formatNotification($notification): array
    {
        $data = $notification->data;

        // Check if this is a Laravilt notification format
        $isLaravilt = ($data['format'] ?? null) === 'laravilt';

        return [
            'id' => $notification->id,
            'type' => $notification->type,
            'title' => $data['title'] ?? null,
            'body' => $data['body'] ?? ($data['message'] ?? null),
            'icon' => $data['icon'] ?? null,
            'iconColor' => $data['icon_color'] ?? ($data['color'] ?? null),
            'status' => $data['status'] ?? 'info',
            'color' => $data['color'] ?? null,
            'actions' => $data['actions'] ?? [],
            'data' => $data['data'] ?? $data,
            'readAt' => $notification->read_at?->toISOString(),
            'createdAt' => $notification->created_at?->toISOString(),
            'humanTime' => $notification->created_at?->diffForHumans(),
        ];
    }
}
