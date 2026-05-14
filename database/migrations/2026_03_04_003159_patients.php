<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('doctor_id')->nullable();
            $table->string('nom')->nullable();
            $table->string('prenom')->nullable();
            $table->integer('age')->nullable();
            $table->float('poids')->nullable();
            $table->float('taille')->nullable();
            $table->string('email')->nullable();
            $table->string('telephone')->nullable();
            $table->string('adresse')->nullable();
            $table->string('groupe_sanguin')->nullable();
            $table->text('antecedents_medicaux')->nullable();
            $table->text('antecedents_chirurgicaux')->nullable();
            $table->text('antecedents_familiaux')->nullable();
            $table->text('allergies')->nullable();
            $table->text('medicaments_actuels')->nullable();
            $table->text('notes_doctor')->nullable();
            $table->timestamps();
            
            $table->foreign('doctor_id')->references('id')->on('users')->onDelete('set null');
        });

        Schema::create('documents_medicaux', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->string('titre')->nullable();
            $table->enum('type', ['scan', 'analyse_sang', 'radio', 'ordonnance', 'autre'])->default('autre');
            $table->string('fichier_path')->nullable();
            $table->string('fichier_nom')->nullable();
            $table->date('date_document')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('visites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->date('date_visite')->nullable();
            $table->string('motif')->nullable();
            $table->text('diagnostic')->nullable();
            $table->text('prescription_texte')->nullable();
            $table->string('prescription_fichier_path')->nullable();
            $table->string('prescription_fichier_nom')->nullable();
            $table->string('montant')->nullable();
            $table->enum('statut_paiement', ['paye', 'en_attente', 'impaye'])->default('en_attente');
            $table->string('medecin')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visites');
        Schema::dropIfExists('documents_medicaux');
        Schema::dropIfExists('patients');
    }
};