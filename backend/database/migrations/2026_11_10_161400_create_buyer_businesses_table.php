<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('buyer_businesses', function (Blueprint $table) {
            $table->id();
            $table->string('legal_name')->unique();
            $table->string('registration_number')->nullable()->unique();
            $table->string('status')->default('Pending')->index();
            $table->string('country')->default('Cambodia');
            $table->jsonb('profile')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('buyer_businesses');
    }
};
