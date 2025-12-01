<?php

use Laravilt\Notifications\Notification;

describe('Notification', function () {
    it('can create a notification instance', function () {
        $notification = Notification::make();

        expect($notification)->toBeInstanceOf(Notification::class)
            ->and($notification->getId())->toBeString()
            ->and($notification->getId())->toStartWith('notification_');
    });

    it('can create a success notification', function () {
        $notification = Notification::success();

        expect($notification->getStatus())->toBe('success')
            ->and($notification->getIcon())->toBe('heroicon-o-check-circle')
            ->and($notification->getColor())->toBe('success');
    });

    it('can create a danger notification', function () {
        $notification = Notification::danger();

        expect($notification->getStatus())->toBe('danger')
            ->and($notification->getIcon())->toBe('heroicon-o-x-circle')
            ->and($notification->getColor())->toBe('danger');
    });

    it('can create a warning notification', function () {
        $notification = Notification::warning();

        expect($notification->getStatus())->toBe('warning')
            ->and($notification->getIcon())->toBe('heroicon-o-exclamation-triangle')
            ->and($notification->getColor())->toBe('warning');
    });

    it('can create an info notification', function () {
        $notification = Notification::info();

        expect($notification->getStatus())->toBe('info')
            ->and($notification->getIcon())->toBe('heroicon-o-information-circle')
            ->and($notification->getColor())->toBe('info');
    });

    it('can set custom status', function () {
        $notification = Notification::make()->status('custom');

        expect($notification->getStatus())->toBe('custom');
    });

    it('can set title', function () {
        $notification = Notification::make()->title('Test Title');

        expect($notification->getTitle())->toBe('Test Title');
    });

    it('can set body', function () {
        $notification = Notification::make()->body('Test Body');

        expect($notification->getBody())->toBe('Test Body');
    });

    it('can set icon', function () {
        $notification = Notification::make()->icon('custom-icon');

        expect($notification->getIcon())->toBe('custom-icon');
    });

    it('can set color', function () {
        $notification = Notification::make()->color('blue');

        expect($notification->getColor())->toBe('blue');
    });

    it('can set duration', function () {
        $notification = Notification::make()->duration(5000);

        expect($notification->getDuration())->toBe(5000);
    });

    it('can set persistent flag', function () {
        $notification = Notification::make()->persistent();

        expect($notification->isPersistent())->toBeTrue();
    });

    it('can set dismissible flag', function () {
        $notification = Notification::make()->dismissible(false);

        expect($notification->isDismissible())->toBeFalse();
    });

    it('is dismissible by default', function () {
        $notification = Notification::make();

        expect($notification->isDismissible())->toBeTrue();
    });

    it('can set actions', function () {
        $actions = [
            ['label' => 'View', 'url' => '/view'],
            ['label' => 'Edit', 'url' => '/edit'],
        ];
        $notification = Notification::make()->actions($actions);

        expect($notification->getActions())->toBe($actions)
            ->and($notification->getActions())->toHaveCount(2);
    });

    it('can set data', function () {
        $data = ['key' => 'value', 'foo' => 'bar'];
        $notification = Notification::make()->data($data);

        expect($notification->getData())->toBe($data);
    });

    it('can send notification to session', function () {
        $notification = Notification::success()
            ->title('Success')
            ->body('Operation completed')
            ->send();

        expect(session('laravilt.notification'))->toBeArray()
            ->and(session('laravilt.notification')['title'])->toBe('Success')
            ->and(session('laravilt.notification')['body'])->toBe('Operation completed')
            ->and(session('laravilt.notification')['status'])->toBe('success');
    });

    it('converts to array correctly', function () {
        $notification = Notification::success()
            ->title('Test')
            ->body('Message')
            ->icon('test-icon')
            ->color('green')
            ->duration(4000)
            ->dismissible(false);

        $array = $notification->toArray();

        expect($array)->toBeArray()
            ->and($array)->toHaveKeys(['id', 'status', 'title', 'body', 'icon', 'color', 'duration', 'persistent', 'dismissible', 'actions', 'data'])
            ->and($array['title'])->toBe('Test')
            ->and($array['body'])->toBe('Message')
            ->and($array['icon'])->toBe('test-icon')
            ->and($array['color'])->toBe('green')
            ->and($array['duration'])->toBe(4000)
            ->and($array['persistent'])->toBeFalse()
            ->and($array['dismissible'])->toBeFalse()
            ->and($array['status'])->toBe('success');
    });

    it('can chain multiple methods', function () {
        $notification = Notification::make()
            ->status('info')
            ->title('Chained')
            ->body('Multiple methods')
            ->icon('chain')
            ->color('blue')
            ->duration(4000)
            ->dismissible(true)
            ->actions([['label' => 'OK']])
            ->data(['test' => true]);

        expect($notification->getStatus())->toBe('info')
            ->and($notification->getTitle())->toBe('Chained')
            ->and($notification->getBody())->toBe('Multiple methods')
            ->and($notification->getIcon())->toBe('chain')
            ->and($notification->getColor())->toBe('blue')
            ->and($notification->getDuration())->toBe(4000)
            ->and($notification->isDismissible())->toBeTrue()
            ->and($notification->getActions())->toHaveCount(1)
            ->and($notification->getData())->toHaveKey('test');
    });

    it('generates unique ids for each notification', function () {
        $notification1 = Notification::make();
        $notification2 = Notification::make();

        expect($notification1->getId())->not->toBe($notification2->getId());
    });

    it('returns itself after send', function () {
        $notification = Notification::success()->title('Test')->send();

        expect($notification)->toBeInstanceOf(Notification::class);
    });
});
