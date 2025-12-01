<?php

use Laravilt\Notifications\Notification;

describe('CanBeDismissed trait', function () {
    it('is dismissible by default', function () {
        $notification = Notification::make();

        expect($notification->isDismissible())->toBeTrue();
    });

    it('can set dismissible to false', function () {
        $notification = Notification::make()->dismissible(false);

        expect($notification->isDismissible())->toBeFalse();
    });

    it('can set dismissible to true explicitly', function () {
        $notification = Notification::make()->dismissible(true);

        expect($notification->isDismissible())->toBeTrue();
    });

    it('can toggle dismissible state', function () {
        $notification = Notification::make()
            ->dismissible(false)
            ->dismissible(true)
            ->dismissible(false);

        expect($notification->isDismissible())->toBeFalse();
    });

    it('returns instance for chaining', function () {
        $notification = Notification::make();
        $result = $notification->dismissible(true);

        expect($result)->toBe($notification);
    });

    it('can set persistent which may affect dismissible behavior', function () {
        $notification = Notification::make()
            ->persistent()
            ->dismissible(false);

        expect($notification->isPersistent())->toBeTrue()
            ->and($notification->isDismissible())->toBeFalse();
    });

    it('persistent notifications can still be dismissible', function () {
        $notification = Notification::make()
            ->persistent()
            ->dismissible(true);

        expect($notification->isPersistent())->toBeTrue()
            ->and($notification->isDismissible())->toBeTrue();
    });

    it('returns false for persistent by default', function () {
        $notification = Notification::make();

        expect($notification->isPersistent())->toBeFalse();
    });

    it('can set persistent flag', function () {
        $notification = Notification::make()->persistent();

        expect($notification->isPersistent())->toBeTrue();
    });

    it('persistent returns instance for chaining', function () {
        $notification = Notification::make();
        $result = $notification->persistent();

        expect($result)->toBe($notification);
    });
});
