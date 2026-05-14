<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\PrescriptionTemplateController;
use App\Http\Controllers\WaitingRoomController;
use App\Http\Controllers\SecretaryPaymentController;
use App\Http\Controllers\StatisticsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DoctorTaskController;
use App\Http\Controllers\CommunicationController;
use App\Http\Controllers\PasswordResetController;

// Public routes
Route::post('/register', [UsersController::class, 'register']);
Route::post('/login', [UsersController::class, 'login']);

// Password reset requests (authenticated)
Route::post('/password-reset-request', [PasswordResetController::class, 'sendRequest']);

// Protected routes – JWT authentication required
Route::middleware(['jwt.auth'])->group(function () {

    // Auth – get current user (includes integrity_hash)
    Route::get('/current-user', [AuthController::class, 'getCurrentUser']);
    Route::get('/auth/me', [AuthController::class, 'getCurrentUser']); 
    Route::put('/auth/update', [UsersController::class, 'updateProfile']);

    // User
    Route::get('/dashboard', [UsersController::class, 'dashboard']);
    Route::post('/logout', [UsersController::class, 'logout']);
    Route::get('/users', [UsersController::class, 'index']);

    Route::middleware(['jwt.auth', 'role:patient'])->group(function () {
        Route::get('/patient/profile', [PatientController::class, 'profile']);
        Route::get('/patient/appointments', [PatientController::class, 'patientAppointments']);
        Route::post('/patient/appointments', [PatientController::class, 'storePatientAppointment']);
    });


    Route::middleware(['jwt.auth', 'role:medecin'])->prefix('')->group(function () {
        // Documents
        Route::post('/patients/{id}/documents', [PatientController::class, 'uploadDocument']);
        Route::get('/patients/{id}/documents/{documentId}/view', [PatientController::class, 'viewDocument']);
        Route::get('/patients/{id}/documents/{documentId}/download', [PatientController::class, 'downloadDocument']);
        Route::delete('/patients/{id}/documents/{documentId}', [PatientController::class, 'deleteDocument']);
        // Prescription templates
        Route::get('/prescription-templates', [PrescriptionTemplateController::class, 'index']);
        Route::post('/prescription-templates', [PrescriptionTemplateController::class, 'store']);
        Route::get('/prescription-templates/{id}', [PrescriptionTemplateController::class, 'show']);
        Route::put('/prescription-templates/{id}', [PrescriptionTemplateController::class, 'update']);
        Route::delete('/prescription-templates/{id}', [PrescriptionTemplateController::class, 'destroy']);

    });


    Route::middleware(['jwt.auth', 'role:secretaire,medecin'])->prefix('')->group(function () {
        // Patients
        Route::get('/patients', [PatientController::class, 'index']);
        Route::post('/patients', [PatientController::class, 'store']);
        Route::get('/patients/{id}', [PatientController::class, 'show']);
        Route::put('/patients/{id}', [PatientController::class, 'update']);
        Route::delete('/patients/{id}', [PatientController::class, 'destroy']);
        Route::post('/patients/{id}/visites/{visiteId}/prescription-file', [PatientController::class, 'addPrescriptionFile']);
        // Visites
        Route::post('/patients/{id}/visites', [PatientController::class, 'addVisite']);
        Route::put('/patients/{id}/visites/{visiteId}', [PatientController::class, 'updateVisite']);
        Route::delete('/patients/{id}/visites/{visiteId}', [PatientController::class, 'deleteVisite']);
        Route::get('/patients/{id}/visites/{visiteId}/prescription/{fileIndex}/view', [PatientController::class, 'viewPrescription']);
        Route::get('/patients/{id}/visites/{visiteId}/prescription/{fileIndex}/download', [PatientController::class, 'downloadPrescription']);

        // Appointments
        Route::get('/appointments', [AppointmentController::class, 'index']);
        Route::post('/appointments', [AppointmentController::class, 'store']);
        Route::get('/appointments/{id}', [AppointmentController::class, 'show']);
        Route::put('/appointments/{id}', [AppointmentController::class, 'update']);
        Route::delete('/appointments/{id}', [AppointmentController::class, 'destroy']);
        
        // Appointment notifications
        Route::get('/appointments/pending-requests', [AppointmentController::class, 'getPendingRequests']);
        Route::post('/appointments/{id}/accept-request', [AppointmentController::class, 'acceptRequest']);
        Route::post('/appointments/{id}/deny-request', [AppointmentController::class, 'denyRequest']);
    });


    // Doctor Sec creation
    Route::middleware(['jwt.auth', 'role:medecin'])->prefix('doctor')->group(function () {
        Route::post('/secretaries', [UsersController::class, 'storeSecretary']);
        Route::get('/secretaries', [UsersController::class, 'getMySecretaries']);
        Route::delete('/secretaries/{id}', [UsersController::class, 'destroySecretary']);
    });

    // Waiting room ( doc/sec )
    Route::middleware(['jwt.auth', 'role:secretaire,medecin'])->prefix('waiting-room')->group(function () {
        Route::get('/', [WaitingRoomController::class, 'index']);
        Route::get('/available-patients', [WaitingRoomController::class, 'availablePatients']);
        Route::post('/', [WaitingRoomController::class, 'store']);
        Route::put('/{id}', [WaitingRoomController::class, 'update']);
        Route::delete('/{id}', [WaitingRoomController::class, 'destroy']);
    });

    // Secretary payments 
    Route::middleware(['jwt.auth', 'role:secretaire'])->prefix('secretary')->group(function () {
        Route::get('/payments', [SecretaryPaymentController::class, 'index']);
        Route::get('/payments/paid', [SecretaryPaymentController::class, 'paid']);
        Route::post('/payments/{visiteId}/finalize', [SecretaryPaymentController::class, 'finalize']);
    });

    // Doctor statistics
    Route::middleware(['jwt.auth', 'role:medecin'])->prefix('doctor/statistics')->group(function () {
        Route::get('/overview', [StatisticsController::class, 'overview']);
        Route::get('/visits-timeline', [StatisticsController::class, 'visitsTimeline']);
        Route::get('/revenue-timeline', [StatisticsController::class, 'revenueTimeline']);
        Route::get('/payment-distribution', [StatisticsController::class, 'paymentDistribution']);
        Route::get('/appointment-distribution', [StatisticsController::class, 'appointmentDistribution']);
        Route::get('/top-patients', [StatisticsController::class, 'topPatients']);
        Route::get('/age-distribution', [StatisticsController::class, 'ageDistribution']);
        Route::get('/monthly-comparison', [StatisticsController::class, 'monthlyComparison']);
        Route::get('/visits-by-day', [StatisticsController::class, 'visitsByDayOfWeek']);
        Route::get('/visit-status', [StatisticsController::class, 'visitStatusDistribution']);
        Route::get('/revenue-by-month', [StatisticsController::class, 'revenueByMonth']);
        Route::get('/blood-group-distribution', [StatisticsController::class, 'bloodGroupDistribution']);
        Route::get('/recent-activity', [StatisticsController::class, 'recentActivity']);
    });

    // Tasks ( doc/sec )
    Route::middleware(['jwt.auth', 'role:secretaire,medecin'])->prefix('doctor')->group(function () {
        Route::get('/tasks', [DoctorTaskController::class, 'index']);
        Route::post('/tasks', [DoctorTaskController::class, 'store']);
        Route::put('/tasks/{id}', [DoctorTaskController::class, 'update']);
        Route::delete('/tasks/{id}', [DoctorTaskController::class, 'destroy']);
    });

    // Communications ( doctor/admin )
    Route::middleware(['jwt.auth', 'role:admin,medecin'])->prefix('doctor')->group(function () {
        Route::get('/communications', [CommunicationController::class, 'index']);
        Route::post('/communications', [CommunicationController::class, 'store']);
        Route::get('/communications/{id}/download/{index?}', [CommunicationController::class, 'download']);
        Route::get('/communications/{id}/view/{index?}', [CommunicationController::class, 'view']);
    });

    // Admin routes
    Route::middleware(['jwt.auth', 'role:admin'])->prefix('admin')->group(function () {
        Route::get('/users', [UsersController::class, 'index']);
        Route::post('/users', [UsersController::class, 'storeUser']);
        Route::put('/users/{id}', [UsersController::class, 'updateUser']);
        Route::delete('/users/{id}', [UsersController::class, 'destroyUser']);
        Route::get('/password-reset-requests', [PasswordResetController::class, 'getPendingRequests']);
        Route::get('/get-user-by-email', [PasswordResetController::class, 'getUserByLoginEmail']);
        Route::post('/reset-password', [PasswordResetController::class, 'resetUserPassword']);
        Route::get('/search-users', [PasswordResetController::class, 'searchUsers']);
        Route::get('/communications', [CommunicationController::class, 'index']);
        Route::post('/communications', [CommunicationController::class, 'store']);
        Route::get('/communications/{id}/download/{index?}', [CommunicationController::class, 'download']);
        Route::get('/communications/{id}/view/{index?}', [CommunicationController::class, 'view']);
        Route::get('/unverified-doctors', [UsersController::class, 'getUnverifiedDoctors']);
        Route::put('/verify-doctor/{id}', [UsersController::class, 'verifyDoctor']);
        Route::get('/doctor-document/{id}', [UsersController::class, 'viewLicenceDocument']);
        Route::get('/dashboard', [StatisticsController::class, 'adminDashboard']);
    });

});

// 404 fallback
Route::fallback(fn() => response()->json(['error' => 'Route non trouvée'], 404));