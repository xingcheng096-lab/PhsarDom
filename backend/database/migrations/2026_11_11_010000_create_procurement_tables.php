<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('rfqs', function (Blueprint $table) {
            $table->id(); $table->foreignId('buyer_business_id')->constrained()->cascadeOnDelete(); $table->foreignId('created_by')->constrained('users'); $table->string('status')->default('Submitted')->index(); $table->text('message')->nullable(); $table->timestamps();
        });
        Schema::create('rfq_items', function (Blueprint $table) {
            $table->id(); $table->foreignId('rfq_id')->constrained()->cascadeOnDelete(); $table->foreignId('product_id')->constrained()->restrictOnDelete(); $table->unsignedInteger('quantity'); $table->decimal('target_unit_price', 14, 2)->nullable(); $table->timestamps(); $table->unique(['rfq_id', 'product_id']);
        });
        Schema::create('quotations', function (Blueprint $table) {
            $table->id(); $table->foreignId('rfq_id')->constrained()->cascadeOnDelete(); $table->foreignId('buyer_business_id')->constrained()->cascadeOnDelete(); $table->foreignId('issued_by')->constrained('users'); $table->string('status')->default('Issued')->index(); $table->date('expires_at')->nullable(); $table->decimal('total_amount', 14, 2); $table->timestamps();
        });
        Schema::create('quotation_items', function (Blueprint $table) {
            $table->id(); $table->foreignId('quotation_id')->constrained()->cascadeOnDelete(); $table->foreignId('product_id')->constrained()->restrictOnDelete(); $table->unsignedInteger('quantity'); $table->decimal('unit_price', 14, 2); $table->decimal('line_total', 14, 2); $table->timestamps();
        });
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id(); $table->foreignId('quotation_id')->unique()->constrained()->cascadeOnDelete(); $table->foreignId('buyer_business_id')->constrained()->cascadeOnDelete(); $table->string('status')->default('Confirmed')->index(); $table->decimal('total_amount', 14, 2); $table->timestamps();
        });
        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->id(); $table->foreignId('purchase_order_id')->constrained()->cascadeOnDelete(); $table->foreignId('product_id')->constrained()->restrictOnDelete(); $table->unsignedInteger('quantity'); $table->decimal('unit_price', 14, 2); $table->decimal('line_total', 14, 2); $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('purchase_order_items'); Schema::dropIfExists('purchase_orders'); Schema::dropIfExists('quotation_items'); Schema::dropIfExists('quotations'); Schema::dropIfExists('rfq_items'); Schema::dropIfExists('rfqs'); }
};
