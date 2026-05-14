<?php

namespace Database\Seeders;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin account
        User::updateOrCreate([
            'email' => 'admin@gmail.com',
        ], [
            'name' => 'Admin User',
            'password' => Hash::make('123456789'),
            'email_verified_at' => now(),
            'role' => 'admin',
            'verified' => true,
        ]);

        // Create a patient account that can log in with the patient interface
        User::updateOrCreate([
            'email' => 'patient@gmail.com',
        ], [
            'name' => 'Patient Demo',
            'password' => Hash::make('123456789'),
            'email_verified_at' => now(),
            'role' => 'patient',
            'verified' => true,
        ]);

        Patient::updateOrCreate([
            'email' => 'patient@gmail.com',
        ], [
            'doctor_id' => null,
            'nom' => 'Patient',
            'prenom' => 'Demo',
            'telephone' => null,
            'adresse' => null,
        ]);
    }
}