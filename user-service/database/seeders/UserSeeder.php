<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Create 10,000 users in chunks to avoid memory issues
        $chunkSize = 1000;
        $totalUsers = 10000;

        for ($i = 0; $i < $totalUsers; $i += $chunkSize) {
            User::factory($chunkSize)->create();
            $this->command->info("Created " . ($i + $chunkSize) . " users");
        }
    }
}
