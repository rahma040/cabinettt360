<?php

namespace App\Http\Controllers;

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