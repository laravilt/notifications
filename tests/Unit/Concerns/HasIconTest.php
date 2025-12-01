<?php

use Laravilt\Notifications\Notification;

describe('HasIcon trait', function () {
    it('can set and get icon', function () {
        $notification = Notification::make()->icon('check-circle');

        expect($notification->getIcon())->toBe('check-circle');
    });

    it('returns null by default', function () {
        $notification = Notification::make();

        expect($notification->getIcon())->toBeNull();
    });

    it('can update icon', function () {
        $notification = Notification::make()
            ->icon('first-icon')
            ->icon('second-icon');

        expect($notification->getIcon())->toBe('second-icon');
    });

    it('returns instance for chaining', function () {
        $notification = Notification::make();
        $result = $notification->icon('chainable-icon');

        expect($result)->toBe($notification);
    });

    it('can handle heroicon format', function () {
        $notification = Notification::make()->icon('heroicon-o-check-circle');

        expect($notification->getIcon())->toBe('heroicon-o-check-circle');
    });

    it('can handle lucide icon format', function () {
        $notification = Notification::make()->icon('lucide-check');

        expect($notification->getIcon())->toBe('lucide-check');
    });
});
