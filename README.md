![Notifications](./arts/screenshot.jpg)

# Notifications Plugin for Laravilt

[![Latest Stable Version](https://poser.pugx.org/laravilt/notifications/version.svg)](https://packagist.org/packages/laravilt/notifications)
[![License](https://poser.pugx.org/laravilt/notifications/license.svg)](https://packagist.org/packages/laravilt/notifications)
[![Downloads](https://poser.pugx.org/laravilt/notifications/d/total.svg)](https://packagist.org/packages/laravilt/notifications)
[![Dependabot Updates](https://github.com/laravilt/notifications/actions/workflows/dependabot/dependabot-updates/badge.svg)](https://github.com/laravilt/notifications/actions/workflows/dependabot/dependabot-updates)
[![PHP Code Styling](https://github.com/laravilt/notifications/actions/workflows/fix-php-code-styling.yml/badge.svg)](https://github.com/laravilt/notifications/actions/workflows/fix-php-code-styling.yml)
[![Tests](https://github.com/laravilt/notifications/actions/workflows/tests.yml/badge.svg)](https://github.com/laravilt/notifications/actions/workflows/tests.yml)

plugin for Laravilt

## Installation

You can install the plugin via composer:

```bash
composer require laravilt/notifications
```

The package will automatically register its service provider which handles all Laravel-specific functionality (views, migrations, config, etc.).

## Configuration

Publish the config file:

```bash
php artisan vendor:publish --tag="notifications-config"
```

## Assets

Publish the plugin assets:

```bash
php artisan vendor:publish --tag="notifications-assets"
```

## Testing

```bash
composer test
```

## Code Style

```bash
composer format
```

## Static Analysis

```bash
composer analyse
```

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
