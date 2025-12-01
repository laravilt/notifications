<?php

use Laravilt\Notifications\Notification;

describe('HasColor trait', function () {
    it('can set and get color', function () {
        $notification = Notification::make()->color('blue');

        expect($notification->getColor())->toBe('blue');
    });

    it('returns null by default', function () {
        $notification = Notification::make();

        expect($notification->getColor())->toBeNull();
    });

    it('can update color', function () {
        $notification = Notification::make()
            ->color('red')
            ->color('green');

        expect($notification->getColor())->toBe('green');
    });

    it('returns instance for chaining', function () {
        $notification = Notification::make();
        $result = $notification->color('purple');

        expect($result)->toBe($notification);
    });

    it('can handle standard notification colors', function () {
        expect(Notification::make()->color('success')->getColor())->toBe('success')
            ->and(Notification::make()->color('danger')->getColor())->toBe('danger')
            ->and(Notification::make()->color('warning')->getColor())->toBe('warning')
            ->and(Notification::make()->color('info')->getColor())->toBe('info');
    });

    it('can handle custom colors', function () {
        $notification = Notification::make()->color('custom-purple-500');

        expect($notification->getColor())->toBe('custom-purple-500');
    });
});
