<?php

use Illuminate\Support\Facades\DB;

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

try {
    echo "Laravel Bootstrap: OK\n";
    echo "Environment: " . config('app.env') . "\n";
    echo "Debug Mode: " . (config('app.debug') ? 'ON' : 'OFF') . "\n";
    echo "Database: " . config('database.default') . "\n";

    // Test database
    DB::connection()->getPdo();
    echo "Database Connection: OK\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
