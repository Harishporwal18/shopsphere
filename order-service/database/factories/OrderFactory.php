<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    public function definition()
    {
        $subtotal = $this->faker->randomFloat(2, 50, 1000);
        $taxRate = 0.1;
        $taxAmount = $subtotal * $taxRate;
        $shippingAmount = $this->faker->randomFloat(2, 5, 25);
        $totalAmount = $subtotal + $taxAmount + $shippingAmount;

        return [
            'order_number' => 'ORD-' . $this->faker->unique()->numerify('######'),
            'user_id' => $this->faker->numberBetween(1, 10000), // Reference to user service
            'status' => $this->faker->randomElement(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'shipping_amount' => $shippingAmount,
            'total_amount' => $totalAmount,
            'shipping_address' => [
                'name' => $this->faker->name(),
                'address' => $this->faker->address(),
                'city' => $this->faker->city(),
                'postal_code' => $this->faker->postcode(),
                'country' => $this->faker->country(),
            ],
            'billing_address' => [
                'name' => $this->faker->name(),
                'address' => $this->faker->address(),
                'city' => $this->faker->city(),
                'postal_code' => $this->faker->postcode(),
                'country' => $this->faker->country(),
            ],
            'payment_method' => $this->faker->randomElement(['credit_card', 'paypal', 'bank_transfer']),
            'payment_status' => $this->faker->randomElement(['pending', 'paid', 'failed', 'refunded']),
            'shipped_at' => $this->faker->boolean(60) ? $this->faker->dateTimeBetween('-30 days', 'now') : null,
            'delivered_at' => $this->faker->boolean(40) ? $this->faker->dateTimeBetween('-20 days', 'now') : null,
            'notes' => $this->faker->optional()->sentence(),
        ];
    }
}
