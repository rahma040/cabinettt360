<?php

namespace App\Http\Controllers;

use OpenApi\Annotations as OA;
use App\Models\PrescriptionTemplate;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class PrescriptionTemplateController extends Controller
{
    protected $user;

    public function __construct()
    {
        try {
            $this->user = JWTAuth::parseToken()->authenticate();
        } catch (\Exception $e) {
            $this->user = null;
        }
    }


    /**
     * @OA\Get(
     *   path="/prescription-templates",
     *   tags={"PrescriptionTemplate"},
     *   summary="List prescription templates",
     *   security={{"bearerAuth":{}}},
     *   @OA\Response(response=200, description="Templates list", @OA\JsonContent(type="array", @OA\Items(type="object"))),
     *   @OA\Response(response=401, description="Non authentifié"),
     *   @OA\Response(response=500, description="Server error")
     * )
     */
    public function index()
    {
        if (!$this->user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $templates = PrescriptionTemplate::where('doctor_id', $this->user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($templates);
    }


    /**
     * @OA\Post(
     *   path="/prescription-templates",
     *   tags={"PrescriptionTemplate"},
     *   summary="Create a prescription template",
     *   security={{"bearerAuth":{}}},
     *   @OA\RequestBody(required=true, @OA\JsonContent(
     *     required={"name","template_data"},
     *     @OA\Property(property="name", type="string", example="Standard consult"),
     *     @OA\Property(property="template_data", type="string", example="{\"diagnostic\":\"...\"}")
     *   )),
     *   @OA\Response(response=201, description="Template created", @OA\JsonContent(type="object")),
     *   @OA\Response(response=401, description="Non authentifié"),
     *   @OA\Response(response=422, description="Validation error"),
     *   @OA\Response(response=500, description="Server error")
     * )
     */
    public function store(Request $request)
    {
        if (!$this->user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'template_data' => 'required|json',
        ]);

        $template = PrescriptionTemplate::create([
            'doctor_id' => $this->user->id,
            'name' => $request->name,
            'template_data' => json_decode($request->template_data, true),
        ]);

        return response()->json($template, 201);
    }


    /**
     * @OA\Get(
     *   path="/prescription-templates/{id}",
     *   tags={"PrescriptionTemplate"},
     *   summary="Get a prescription template",
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="Template details", @OA\JsonContent(type="object")),
     *   @OA\Response(response=401, description="Non authentifié"),
     *   @OA\Response(response=404, description="Modèle non trouvé"),
     *   @OA\Response(response=500, description="Server error")
     * )
     */
    public function show($id)
    {
        if (!$this->user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $template = PrescriptionTemplate::where('doctor_id', $this->user->id)
            ->where('id', $id)
            ->first();

        if (!$template) {
            return response()->json(['error' => 'Modèle non trouvé'], 404);
        }

        return response()->json($template);
    }


    /**
     * @OA\Put(
     *   path="/prescription-templates/{id}",
     *   tags={"PrescriptionTemplate"},
     *   summary="Update a prescription template",
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\RequestBody(@OA\JsonContent(
     *     @OA\Property(property="name", type="string", example="Updated template name"),
     *     @OA\Property(property="template_data", type="string", example="{\"diagnostic\":\"...\"}")
     *   )),
     *   @OA\Response(response=200, description="Template updated", @OA\JsonContent(type="object")),
     *   @OA\Response(response=401, description="Non authentifié"),
     *   @OA\Response(response=404, description="Modèle non trouvé"),
     *   @OA\Response(response=422, description="Validation error"),
     *   @OA\Response(response=500, description="Server error")
     * )
     */
    public function update(Request $request, $id)
    {
        if (!$this->user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $template = PrescriptionTemplate::where('doctor_id', $this->user->id)
            ->where('id', $id)
            ->first();

        if (!$template) {
            return response()->json(['error' => 'Modèle non trouvé'], 404);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'template_data' => 'sometimes|json',
        ]);

        if ($request->has('name')) {
            $template->name = $request->name;
        }
        if ($request->has('template_data')) {
            $template->template_data = json_decode($request->template_data, true);
        }
        $template->save();

        return response()->json($template);
    }


    /**
     * @OA\Delete(
     *   path="/prescription-templates/{id}",
     *   tags={"PrescriptionTemplate"},
     *   summary="Delete a prescription template",
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="Template deleted", @OA\JsonContent(type="object")),
     *   @OA\Response(response=401, description="Non authentifié"),
     *   @OA\Response(response=404, description="Modèle non trouvé"),
     *   @OA\Response(response=500, description="Server error")
     * )
     */
    public function destroy($id)
    {
        if (!$this->user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $template = PrescriptionTemplate::where('doctor_id', $this->user->id)
            ->where('id', $id)
            ->first();

        if (!$template) {
            return response()->json(['error' => 'Modèle non trouvé'], 404);
        }

        $template->delete();

        return response()->json(['message' => 'Modèle supprimé avec succès']);
    }
}