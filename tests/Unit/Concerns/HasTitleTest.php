<?php

use Laravilt\Notifications\Notification;

describe('HasTitle trait', function () {
    it('can set and get title', function () {
        $notification = Notification::make()->title('Test Title');

        expect($notification->getTitle())->toBe('Test Title');
    });

    it('returns null by default', function () {
        $notification = Notification::make();

        expect($notification->getTitle())->toBeNull();
    });

    it('can update title', function () {
        $notification = Notification::make()
            ->title('First Title')
            ->title('Second Title');

        expect($notification->getTitle())->toBe('Second Title');
    });

    it('returns instance for chaining', function () {
        $notification = Notification::make();
        $result = $notification->title('Chainable');

        expect($result)->toBe($notification);
    });

    it('can set empty string as title', function () {
        $notification = Notification::make()->title('');

        expect($notification->getTitle())->toBe('');
    });
});
