<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('waiting_room', function (Blueprint $table) {
            $table->integer('slot')->nullable()->after('appointment_id');
        });
    }

    public function down()
    {
        Schema::table('waiting_room', function (Blueprint $table) {
            $table->dropColumn('slot');
        });
    }
};