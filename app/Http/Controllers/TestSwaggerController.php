<?php

namespace App\Http\Controllers;

use OpenApi\Annotations as OA;

class TestSwaggerController
{
    /**
     * @OA\Get(path="/test-swagger",
     *     tags={"test"},
     *     summary="Test endpoint",
     *     operationId="testSwagger",
     *     @OA\Response(response=200, description="successful operation")
     * )
     */
    public function index()
    {
    }
}
