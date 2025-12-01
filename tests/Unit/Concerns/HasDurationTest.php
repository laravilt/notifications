<?php

use Laravilt\Notifications\Notification;

describe('HasDuration trait', function () {
    it('can set and get duration', function () {
        $notification = Notification::make()->duration(5000);

        expect($notification->getDuration())->toBe(5000);
    });

    it('returns 3000 by default', function () {
        $notification = Notification::make();

        expect($notification->getDuration())->toBe(3000);
    });

    it('can update duration', function () {
        $notification = Notification::make()
            ->duration(3000)
            ->duration(6000);

        expect($notification->getDuration())->toBe(6000);
    });

    it('returns instance for chaining', function () {
        $notification = Notification::make();
        $result = $notification->duration(4000);

        expect($result)->toBe($notification);
    });

    it('can handle zero duration', function () {
        $notification = Notification::make()->duration(0);

        expect($notification->getDuration())->toBe(0);
    });

    it('can set persistent which affects duration', function () {
        $notification = Notification::make()
            ->duration(3000)
            ->persistent();

        expect($notification->isPersistent())->toBeTrue();
    });
});
