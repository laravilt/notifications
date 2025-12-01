<?php

describe('notify() helper function', function () {
    beforeEach(function () {
        session()->flush();
    });

    it('creates a basic notification', function () {
        notify('Test Title', 'Test Body', 'success');

        $notifications = session('notifications');

        expect($notifications)->toBeArray()
            ->and($notifications)->toHaveCount(1)
            ->and($notifications[0]['title'])->toBe('Test Title')
            ->and($notifications[0]['body'])->toBe('Test Body')
            ->and($notifications[0]['type'])->toBe('success');
    });

    it('defaults to success type', function () {
        notify('Title', 'Body');

        $notifications = session('notifications');

        expect($notifications[0]['type'])->toBe('success');
    });

    it('supports error type', function () {
        notify('Error', 'Something went wrong', 'error');

        $notifications = session('notifications');

        expect($notifications[0]['type'])->toBe('error');
    });

    it('supports warning type', function () {
        notify('Warning', 'Be careful', 'warning');

        $notifications = session('notifications');

        expect($notifications[0]['type'])->toBe('warning');
    });

    it('supports info type', function () {
        notify('Info', 'FYI', 'info');

        $notifications = session('notifications');

        expect($notifications[0]['type'])->toBe('info');
    });

    it('can set custom icon', function () {
        notify('Title', 'Body', 'success', ['icon' => 'custom-icon']);

        $notifications = session('notifications');

        expect($notifications[0]['icon'])->toBe('custom-icon');
    });

    it('can set custom color', function () {
        notify('Title', 'Body', 'success', ['color' => 'purple']);

        $notifications = session('notifications');

        expect($notifications[0]['color'])->toBe('purple');
    });

    it('can set custom duration', function () {
        notify('Title', 'Body', 'success', ['duration' => 5000]);

        $notifications = session('notifications');

        expect($notifications[0]['duration'])->toBe(5000);
    });

    it('defaults duration to 3000', function () {
        notify('Title', 'Body');

        $notifications = session('notifications');

        expect($notifications[0]['duration'])->toBe(3000);
    });

    it('can set actions', function () {
        $actions = [['label' => 'View', 'url' => '/view']];
        notify('Title', 'Body', 'success', ['actions' => $actions]);

        $notifications = session('notifications');

        expect($notifications[0]['actions'])->toBe($actions);
    });

    it('can accept array as first parameter with all options', function () {
        notify([
            'title' => 'Array Title',
            'body' => 'Array Body',
            'type' => 'warning',
            'icon' => 'array-icon',
            'color' => 'orange',
            'duration' => 4000,
        ]);

        $notifications = session('notifications');

        expect($notifications[0])->toMatchArray([
            'title' => 'Array Title',
            'body' => 'Array Body',
            'type' => 'warning',
            'icon' => 'array-icon',
            'color' => 'orange',
            'duration' => 4000,
        ]);
    });

    it('defaults type to success when array lacks type', function () {
        notify([
            'title' => 'Test',
            'body' => 'Message',
        ]);

        $notifications = session('notifications');

        expect($notifications[0]['type'])->toBe('success');
    });

    it('can handle multiple notifications', function () {
        notify('First', 'Message 1', 'success');
        notify('Second', 'Message 2', 'error');
        notify('Third', 'Message 3', 'warning');

        $notifications = session('notifications');

        expect($notifications)->toHaveCount(3)
            ->and($notifications[0]['title'])->toBe('First')
            ->and($notifications[1]['title'])->toBe('Second')
            ->and($notifications[2]['title'])->toBe('Third')
            ->and($notifications[0]['type'])->toBe('success')
            ->and($notifications[1]['type'])->toBe('error')
            ->and($notifications[2]['type'])->toBe('warning');
    });

    it('handles null body', function () {
        notify('Only Title', null, 'info');

        $notifications = session('notifications');

        expect($notifications[0]['title'])->toBe('Only Title')
            ->and($notifications[0]['body'])->toBeNull();
    });

    it('passes through additional options', function () {
        notify('Title', 'Body', 'success', [
            'icon' => 'test-icon',
            'color' => 'blue',
            'duration' => 6000,
            'actions' => [['label' => 'Click']],
        ]);

        $notifications = session('notifications');

        expect($notifications[0])->toMatchArray([
            'icon' => 'test-icon',
            'color' => 'blue',
            'duration' => 6000,
        ])
            ->and($notifications[0]['actions'])->toHaveCount(1);
    });

    it('stores notifications in flash session', function () {
        notify('Flash Test', 'This is flashed');

        // Simulate next request
        session()->ageFlashData();

        $notifications = session('notifications');

        // Flash data should still be available on first access
        expect($notifications)->toBeArray();
    });
});
