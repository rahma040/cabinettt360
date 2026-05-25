<?php

namespace App\Http\Controllers;

use OpenApi\Annotations as OA;

/**
 * @OA\OpenApi(
 *   security={{"bearerAuth": {}}},
 *   @OA\Tag(name="Patient", description="Patient operations"),
 *   @OA\Tag(name="Appointment", description="Appointment operations"),
 *   @OA\Tag(name="Auth", description="Authentication and user"),
 *   @OA\Tag(name="Document", description="Medical documents and prescriptions"),
 *   @OA\Tag(name="Communication", description="Internal messaging and notifications"),
 *   @OA\Tag(name="DoctorTask", description="Doctor task management"),
 *   @OA\Tag(name="DoctorAssistant", description="Doctor AI assistant"),
 *   @OA\Tag(name="PasswordReset", description="Password reset workflow"),
 *   @OA\Tag(name="PatientContext", description="Patient context assistant"),
 *   @OA\Tag(name="PrescriptionTemplate", description="Prescription templates"),
 *   @OA\Tag(name="SecretaryPayment", description="Secretary payment workflow"),
 *   @OA\Tag(name="Statistics", description="Dashboard and reporting"),
 *   @OA\Tag(name="WaitingRoom", description="Waiting room management"),
 *   @OA\Tag(name="User", description="Administrative user management")
 * )
 */
/**
 * @OA\Info(
 *   title="Cabinet360 API",
 *   version="1.0.0"
 * )
 */
/**
 * @OA\Components(
 *   @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT"
 *   )
 * )
 */
abstract class Controller
{
    //
}
