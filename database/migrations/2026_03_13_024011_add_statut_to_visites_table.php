<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('visites', function (Blueprint $table) {
            $table->string('statut')->default('planifié')->after('notes');
        });
    }

    public function down()
    {
        Schema::table('visites', function (Blueprint $table) {
            $table->dropColumn('statut');
        });
    }
};