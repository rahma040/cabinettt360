<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use OpenApi\Generator;
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
use App\Http\Controllers\DoctorAssistantController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\PatientContextController;

// Public routes
Route::post('/register', [UsersController::class, 'register']);
Route::post('/login', [UsersController::class, 'login']);

Route::get('/documentation', function () {
    $openApiJsonUrl = json_encode(url('/api/documentation/openapi.json'), JSON_UNESCAPED_SLASHES);

    return response(<<<HTML
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>API Documentation</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
    <style>
        html, body { margin: 0; padding: 0; background: #0f172a; }
        #swagger-ui { min-height: 100vh; }
    </style>
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>
window.addEventListener('load', function () {
    window.ui = SwaggerUIBundle({
        url: $openApiJsonUrl,
        dom_id: '#swagger-ui',
        deepLinking: true,
        persistAuthorization: true,
        docExpansion: 'list'
    });
});
</script>
</body>
</html>
HTML, 200)->header('Content-Type', 'text/html');
});

Route::get('/documentation/openapi.json', function () {
    $controllerFiles = glob(app_path('Http/Controllers/*.php'));

    foreach ($controllerFiles as $controllerFile) {
        require_once $controllerFile;
    }

    try {
        $openApi = Generator::scan($controllerFiles);

        return response($openApi->toJson(), 200)
            ->header('Content-Type', 'application/json');
    } catch (\Throwable $exception) {
        $paths = [];

        foreach (Route::getRoutes() as $route) {
            $uri = $route->uri();

            if (Str::startsWith($uri, 'documentation')) {
                continue;
            }

            $path = '/' . ltrim($uri, '/');
            $pathParameters = [];

            preg_match_all('/\{([^}]+)\}/', $path, $matches);
            foreach ($matches[1] as $parameterName) {
                $pathParameters[] = [
                    'name' => $parameterName,
                    'in' => 'path',
                    'required' => true,
                    'schema' => ['type' => 'string'],
                ];
            }

            foreach (array_diff($route->methods(), ['HEAD', 'OPTIONS']) as $method) {
                $method = strtolower($method);
                $operation = [
                    'tags' => [Str::headline(explode('/', trim($uri, '/'))[0] ?? 'API')],
                    'summary' => $route->getActionName(),
                    'responses' => [
                        '200' => ['description' => 'Success'],
                        '201' => ['description' => 'Created'],
                        '401' => ['description' => 'Unauthorized'],
                        '404' => ['description' => 'Not found'],
                        '422' => ['description' => 'Validation error'],
                        '500' => ['description' => 'Server error'],
                    ],
                ];

                if ($pathParameters) {
                    $operation['parameters'] = $pathParameters;
                }

                if (in_array($method, ['post', 'put', 'patch'], true)) {
                    $operation['requestBody'] = [
                        'required' => true,
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    'type' => 'object',
                                    'additionalProperties' => true,
                                ],
                            ],
                        ],
                    ];
                }

                $paths[$path][$method] = $operation;
            }
        }

        // Provide targeted request schemas for key endpoints so "Try it out" shows fields.
        if (isset($paths['/api/register']['post'])) {
            $paths['/api/register']['post']['requestBody'] = [
                'required' => true,
                'content' => [
                    'application/json' => [
                        'schema' => [
                            'type' => 'object',
                            'required' => ['name','email','password'],
                            'properties' => [
                                'name' => ['type' => 'string', 'example' => 'Sara Benali'],
                                'email' => ['type' => 'string', 'format' => 'email', 'example' => 'sara@example.com'],
                                'password' => ['type' => 'string', 'example' => 'secret123'],
                                'role' => ['type' => 'string', 'example' => 'patient'],
                                'licence_document' => ['type' => 'string', 'description' => 'Base64 file or multipart upload']
                            ]
                        ]
                    ]
                ]
            ];
        }
        if (isset($paths['/api/login']['post'])) {
            $paths['/api/login']['post']['requestBody'] = [
                'required' => true,
                'content' => [
                    'application/json' => [
                        'schema' => [
                            'type' => 'object',
                            'required' => ['email','password'],
                            'properties' => [
                                'email' => ['type' => 'string', 'format' => 'email', 'example' => 'sara@example.com'],
                                'password' => ['type' => 'string', 'example' => 'secret123']
                            ]
                        ]
                    ]
                ]
            ];
        }

        $fallbackSpec = [
            'openapi' => '3.0.0',
            'info' => [
                'title' => 'Cabinet360 API',
                'version' => '1.0.0',
            ],
            'servers' => [
                ['url' => url('/api')],
            ],
            'components' => [
                'securitySchemes' => [
                    'bearerAuth' => [
                        'type' => 'http',
                        'scheme' => 'bearer',
                        'bearerFormat' => 'JWT',
                    ],
                ],
            ],
            'security' => [
                ['bearerAuth' => []],
            ],
            'paths' => (object) $paths,
        ];

        return response()->json($fallbackSpec, 200);
    }
});

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
        Route::get('/patient/documents/{documentId}/view', [PatientController::class, 'viewMyDocument']);
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
        // Patient account management (doctor + secretary)
        Route::post('/patients-users', [UsersController::class, 'storePatientUser']);
        Route::get('/patients-users', [UsersController::class, 'getMyPatientUsers']);
        Route::delete('/patients-users/{id}', [UsersController::class, 'destroyPatientUser']);
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

    // Communications (admin/doctor/secretary)
    Route::middleware(['jwt.auth', 'role:admin,medecin,secretaire'])->prefix('communications')->group(function () {
        Route::get('/', [CommunicationController::class, 'index']);
        Route::post('/', [CommunicationController::class, 'store']);
        Route::get('/contacts', [CommunicationController::class, 'contacts']);
        Route::get('/unread-count', [CommunicationController::class, 'unreadCount']);
        Route::get('/notifications', [CommunicationController::class, 'notifications']);
        Route::post('/{id}/mark-read', [CommunicationController::class, 'markRead']);
        Route::get('/{id}/download/{index?}', [CommunicationController::class, 'download']);
        Route::get('/{id}/view/{index?}', [CommunicationController::class, 'view']);
    });

    // Doctor AI assistant
    Route::middleware(['jwt.auth', 'role:medecin'])->prefix('doctor/assistant')->group(function () {
        Route::post('/chat', [DoctorAssistantController::class, 'chat']);
    });

    Route::middleware(['jwt.auth', 'role:medecin'])->prefix('doctor/patient-context')->group(function () {
        Route::post('/ask', [PatientContextController::class, 'ask']);
    });

    // Admin routes
    Route::middleware(['jwt.auth', 'role:admin'])->prefix('admin')->group(function () {
        Route::get('/users', [UsersController::class, 'index']);
        Route::get('/users/total', [UsersController::class, 'totalUsers']);
        Route::get('/users/role/{role}', [UsersController::class, 'totalByRole']);
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