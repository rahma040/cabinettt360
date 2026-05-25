<?php

namespace App\Http\Controllers;

use OpenApi\Annotations as OA;

/**
 * @OA\OpenApi(
 *     security={{"bearerAuth": {}}},
 *     @OA\Tag(
 *         name="endpoints"
 *     )
 * )
 * @OA\Info(
 *     title="Testing annotations from bugreports",
 *     version="1.0.0"
 * )
 * @OA\Components(
 *     @OA\SecurityScheme(
 *         securityScheme="bearerAuth",
 *         type="http",
 *         scheme="bearer"
 *     )
 * )
 */
class TempOpenApiSpec
{
}
