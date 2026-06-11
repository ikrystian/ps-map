<?php
// Local dev router that emulates .htaccess for `php -S`.
// Usage: php -S localhost:3000 dev-router.php
// Real files are served by the built-in server; everything else goes through index.php.
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$fullPath = __DIR__ . $path;
if ($path !== '/' && is_file($fullPath)) {
    return false;
}
require __DIR__ . '/index.php';
