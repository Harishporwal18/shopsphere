<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    public function definition()
    {
        $price = $this->faker->randomFloat(2, 10, 1000);
        return [
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->paragraphs(3, true),
            'sku' => $this->faker->unique()->regexify('[A-Z]{3}[0-9]{6}'),
            'price' => $price,
            'cost_price' => $price * 0.6,
            'stock_quantity' => $this->faker->numberBetween(0, 500),
            'min_stock_level' => $this->faker->numberBetween(5, 20),
            'category_id' => Category::factory(),
            'images' => [
                $this->faker->imageUrl(640, 480, 'products', true),
                $this->faker->imageUrl(640, 480, 'products', true),
            ],
            'weight' => $this->faker->randomFloat(2, 0.1, 50),
            'dimensions' => $this->faker->randomFloat(2, 10, 100) . 'x' . $this->faker->randomFloat(2, 10, 100) . 'x' . $this->faker->randomFloat(2, 10, 100),
            'status' => $this->faker->randomElement(['active', 'inactive', 'out_of_stock']),
            'is_featured' => $this->faker->boolean(20),
        ];
    }
}
