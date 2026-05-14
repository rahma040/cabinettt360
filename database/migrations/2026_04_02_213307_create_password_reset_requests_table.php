<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('password_reset_requests', function (Blueprint $table) {
            $table->id();
            $table->string('login_email');                       // the user's account email
            $table->enum('contact_method', ['email', 'phone']);  // how to contact them back
            $table->string('contact_email')->nullable();         // their alternative email
            $table->string('contact_phone')->nullable();         // their phone number
            $table->text('message')->nullable();                 // optional note
            $table->enum('status', ['pending', 'processed'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('password_reset_requests');
    }
};