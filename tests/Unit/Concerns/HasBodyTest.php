<?php

use Laravilt\Notifications\Notification;

describe('HasBody trait', function () {
    it('can set and get body', function () {
        $notification = Notification::make()->body('Test Body');

        expect($notification->getBody())->toBe('Test Body');
    });

    it('returns null by default', function () {
        $notification = Notification::make();

        expect($notification->getBody())->toBeNull();
    });

    it('can update body', function () {
        $notification = Notification::make()
            ->body('First Body')
            ->body('Second Body');

        expect($notification->getBody())->toBe('Second Body');
    });

    it('returns instance for chaining', function () {
        $notification = Notification::make();
        $result = $notification->body('Chainable');

        expect($result)->toBe($notification);
    });

    it('can handle long body text', function () {
        $longText = str_repeat('Lorem ipsum dolor sit amet. ', 100);
        $notification = Notification::make()->body($longText);

        expect($notification->getBody())->toBe($longText);
    });
});
