<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\OrderItem;

class OrderSeeder extends Seeder
{
    public function run()
    {
        $chunkSize = 500;
        $totalOrders = 5000;

        for ($i = 0; $i < $totalOrders; $i += $chunkSize) {
            // Create orders
            Order::factory($chunkSize)->create()->each(function ($order) {
                // Create 1-5 order items per order
                $itemCount = rand(1, 5);
                OrderItem::factory($itemCount)->create(['order_id' => $order->id]);
            });

            $this->command->info("Created " . ($i + $chunkSize) . " orders");
        }
    }
}
