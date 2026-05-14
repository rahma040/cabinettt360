<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Communication;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class CommunicationController extends Controller
{
    private function resolveUser(Request $request)
    {
        $token = $request->query('token') ?? $request->bearerToken();
        if (!$token) return null;
        try {
            return JWTAuth::setToken($token)->authenticate();
        } catch (\Exception $e) {
            return null;
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'recipient_email' => 'required|email',
            'message'         => 'required|string',
            'files'           => 'nullable|array',
            'files.*'         => 'mimes:pdf|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $data = [
            'sender_id'       => $user->id,
            'recipient_email' => $request->recipient_email,
            'message'         => $request->message,
        ];

        $filePaths = [];
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('communications', 'public');
                $filePaths[] = $path;
            }
        }
        $data['file_path'] = $filePaths;

        $communication = Communication::create($data);

        return response()->json([
            'message'       => 'Message envoyé avec succès',
            'communication' => $communication,
        ], 201);
    }

    public function index(Request $request)
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Fetch sent messages
        $sent = Communication::where('sender_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($item) use ($user) {
                $item->direction = 'sent';
                $item->other_party_email = $item->recipient_email;
                return $item;
            });

        // Fetch received messages
        $received = Communication::where('recipient_email', $user->email)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($item) use ($user) {
                $item->direction = 'received';
                // Load sender details
                if ($item->sender) {
                    $item->other_party_email = $item->sender->email;
                } else {
                    $item->other_party_email = 'inconnu@example.com';
                }
                return $item;
            });

        $communications = $sent->concat($received)->sortByDesc('created_at')->values();

        return response()->json($communications);
    }

    public function view(Request $request, $id, $index = 0)
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $communication = Communication::where('id', $id)->firstOrFail();

        $isSender = ($communication->sender_id == $user->id);
        $isRecipient = ($communication->recipient_email == $user->email);

        if (!$isSender && !$isRecipient) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $filePaths = $communication->file_path;
        if (empty($filePaths) || !isset($filePaths[$index])) {
            return response()->json(['error' => 'No file attached at this index'], 404);
        }

        $filePath = storage_path('app/public/' . $filePaths[$index]);

        if (!file_exists($filePath)) {
            return response()->json(['error' => 'File not found on disk'], 404);
        }

        return response()->file($filePath, [
            'Content-Type' => 'application/pdf'
        ]);
    }

    public function download(Request $request, $id, $index = 0)
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $communication = Communication::where('id', $id)->firstOrFail();

        $isSender = ($communication->sender_id == $user->id);
        $isRecipient = ($communication->recipient_email == $user->email);

        if (!$isSender && !$isRecipient) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $filePaths = $communication->file_path;
        if (empty($filePaths) || !isset($filePaths[$index])) {
            return response()->json(['error' => 'No file attached at this index'], 404);
        }

        $filePath = storage_path('app/public/' . $filePaths[$index]);

        if (!file_exists($filePath)) {
            return response()->json(['error' => 'File not found on disk'], 404);
        }

        $fileName = basename($filePath);

        return response()->download($filePath, $fileName, [
            'Content-Type' => 'application/pdf'
        ]);
    }
}