<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;

class ProductSeeder extends Seeder
{
    public function run()
    {
        $categories = Category::all();
        $chunkSize = 1000;
        $totalProducts = 25000;

        for ($i = 0; $i < $totalProducts; $i += $chunkSize) {
            Product::factory($chunkSize)->create([
                'category_id' => $categories->random()->id,
            ]);
            $this->command->info("Created " . ($i + $chunkSize) . " products");
        }
    }
}
