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
        Schema::create('comparison_metrics', function (Blueprint $table) {
            $table->id();
            $table->string('request_id', 64)->index();
            $table->string('install_id_hash', 64)->index();
            $table->unsignedTinyInteger('pages_count')->default(2);
            $table->string('category')->nullable()->index();
            $table->boolean('is_successful')->default(true)->index();
            $table->unsignedInteger('duration_ms')->nullable();
            $table->string('ai_provider', 32)->nullable();
            $table->string('model', 64)->nullable();
            $table->unsignedInteger('input_tokens')->default(0);
            $table->unsignedInteger('output_tokens')->default(0);
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comparison_metrics');
    }
};
