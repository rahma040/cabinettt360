<?php

namespace App\Http\Controllers;

use OpenApi\Annotations as OA;
use Illuminate\Http\Request;
use App\Models\Communication;
use App\Models\User;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Validator;

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

    /**
     * @OA\Post(
     *   path="/communications",
     *   tags={"Communication"},
     *   summary="Send a communication message",
     *   security={{"bearerAuth":{}}},
     *   @OA\RequestBody(required=true, @OA\JsonContent(
     *     required={"message"},
     *     @OA\Property(property="message", type="string", example="Bonjour, voici le dossier demandé."),
     *     @OA\Property(property="recipient_id", type="integer", example=12),
     *     @OA\Property(property="recipient_email", type="string", format="email", example="secretary@example.com"),
     *     @OA\Property(property="files", type="array", @OA\Items(type="string", format="binary"))
     *   )),
     *   @OA\Response(response=201, description="Message sent", @OA\JsonContent(type="object")),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=422, description="Validation error"),
     *   @OA\Response(response=500, description="Server error")
     * )
     */
    public function store(Request $request)
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $rules = [
            'message' => 'required|string',
            'files' => 'nullable|array',
            'files.*' => 'mimes:pdf|max:10240',
        ];

        if ($user->role === 'medecin') {
            $rules['recipient_id'] = 'required|integer';
        } elseif ($user->role === 'admin') {
            $rules['recipient_email'] = 'required_without:recipient_id|nullable|email';
            $rules['recipient_id'] = 'nullable|integer';
        }

        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $recipient = null;
        $recipientEmail = null;

        if ($user->role === 'medecin') {
            $recipient = User::where('id', $request->integer('recipient_id'))
                ->where('role', 'secretaire')
                ->where('doctor_id', $user->id)
                ->first();

            if (!$recipient) {
                return response()->json(['error' => 'Destinataire invalide'], 422);
            }

            $recipientEmail = $recipient->email;
        } elseif ($user->role === 'secretaire') {
            $recipient = User::where('id', $user->doctor_id)
                ->where('role', 'medecin')
                ->first();

            if (!$recipient) {
                return response()->json(['error' => 'Médecin lié introuvable'], 422);
            }

            $recipientEmail = $recipient->email;
        } else {
            if ($request->filled('recipient_id')) {
                $recipient = User::find($request->integer('recipient_id'));
                if ($recipient) {
                    $recipientEmail = $recipient->email;
                }
            }

            if (!$recipientEmail) {
                $recipientEmail = $request->input('recipient_email');
            }

            if (!$recipientEmail) {
                return response()->json(['error' => 'Destinataire invalide'], 422);
            }
        }

        $data = [
            'sender_id' => $user->id,
            'recipient_id' => $recipient?->id,
            'recipient_email' => $recipientEmail,
            'message' => $request->message,
            'is_read' => false,
        ];

        $filePaths = [];
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('communications', 'public');
                $filePaths[] = $path;
            }
        }
        $data['file_path'] = $filePaths;

        $communication = Communication::create($data)->load(['sender:id,name,email', 'recipient:id,name,email']);

        return response()->json([
            'message'       => 'Message envoyé avec succès',
            'communication' => $communication,
        ], 201);
    }

    /**
     * @OA	ag(name="Communication", description="Internal messaging and notifications")
     */

    /**
     * @OA\Get(
     *   path="/communications",
     *   tags={"Communication"},
     *   summary="List communications for the authenticated user",
     *   security={{"bearerAuth":{}}},
     *   @OA\Response(response=200, description="Communications list", @OA\JsonContent(type="array", @OA\Items(type="object"))),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=500, description="Server error")
     * )
     */
    public function index(Request $request)
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $communications = Communication::with(['sender:id,name,email', 'recipient:id,name,email'])
            ->where(function ($query) use ($user) {
                $query->where('sender_id', $user->id)
                    ->orWhere('recipient_id', $user->id)
                    ->orWhere('recipient_email', $user->email);
            })
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($item) use ($user) {
                $isSender = (int) $item->sender_id === (int) $user->id;

                $item->direction = $isSender ? 'sent' : 'received';

                if ($isSender) {
                    $item->other_party_id = $item->recipient_id;
                    $item->other_party_name = $item->recipient?->name;
                    $item->other_party_email = $item->recipient?->email ?? $item->recipient_email;
                } else {
                    $item->other_party_id = $item->sender?->id;
                    $item->other_party_name = $item->sender?->name;
                    $item->other_party_email = $item->sender?->email ?? 'inconnu@example.com';
                }

                return $item;
            })
            ->values();

        return response()->json($communications);
    }

    /**
     * @OA\Get(
     *   path="/communications/contacts",
     *   tags={"Communication"},
     *   summary="List message contacts",
     *   security={{"bearerAuth":{}}},
     *   @OA\Response(response=200, description="Contacts list", @OA\JsonContent(type="array", @OA\Items(type="object"))),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=500, description="Server error")
     * )
     */
    public function contacts(Request $request)
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        if ($user->role === 'medecin') {
            $contacts = User::where('doctor_id', $user->id)
                ->where('role', 'secretaire')
                ->orderBy('name')
                ->get(['id', 'name', 'email'])
                ->map(fn ($contact) => [
                    'id' => $contact->id,
                    'name' => $contact->name,
                    'email' => $contact->email,
                    'role' => $contact->role,
                ])
                ->values();

            return response()->json($contacts);
        }

        if ($user->role === 'secretaire') {
            $doctor = User::where('id', $user->doctor_id)
                ->where('role', 'medecin')
                ->first(['id', 'name', 'email', 'role']);

            return response()->json($doctor ? [$doctor] : []);
        }

        $contacts = User::whereIn('role', ['medecin', 'secretaire'])
            ->orderBy('name')
            ->limit(100)
            ->get(['id', 'name', 'email', 'role']);

        return response()->json($contacts);
    }

    /**
     * @OA\Get(
     *   path="/communications/unread-count",
     *   tags={"Communication"},
     *   summary="Get unread communications count",
     *   security={{"bearerAuth":{}}},
     *   @OA\Response(response=200, description="Unread count", @OA\JsonContent(type="object", @OA\Property(property="count", type="integer", example=3))),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=500, description="Server error")
     * )
     */
    public function unreadCount(Request $request)
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $count = Communication::where(function ($query) use ($user) {
            $query->where('recipient_id', $user->id)
                ->orWhere('recipient_email', $user->email);
        })
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->count();

        return response()->json(['count' => $count]);
    }

    /**
     * @OA\Get(
     *   path="/communications/notifications",
     *   tags={"Communication"},
     *   summary="List unread communication notifications",
     *   security={{"bearerAuth":{}}},
     *   @OA\Response(response=200, description="Notifications list", @OA\JsonContent(type="array", @OA\Items(type="object"))),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=500, description="Server error")
     * )
     */
    public function notifications(Request $request)
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $items = Communication::with(['sender:id,name,email'])
            ->where(function ($query) use ($user) {
                $query->where('recipient_id', $user->id)
                    ->orWhere('recipient_email', $user->email);
            })
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'sender_id' => $item->sender_id,
                    'sender_name' => $item->sender?->name,
                    'sender_email' => $item->sender?->email,
                    'message_preview' => mb_substr((string) $item->message, 0, 120),
                    'created_at' => $item->created_at,
                ];
            })
            ->values();

        return response()->json($items);
    }

    /**
     * @OA\Post(
     *   path="/communications/{id}/mark-read",
     *   tags={"Communication"},
     *   summary="Mark a communication as read",
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="Marked as read", @OA\JsonContent(type="object")),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=404, description="Message not found"),
     *   @OA\Response(response=500, description="Server error")
     * )
     */
    public function markRead(Request $request, $id)
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $communication = Communication::where('id', $id)
            ->where(function ($query) use ($user) {
                $query->where('recipient_id', $user->id)
                    ->orWhere('recipient_email', $user->email);
            })
            ->first();

        if (!$communication) {
            return response()->json(['error' => 'Message non trouvé'], 404);
        }

        $communication->is_read = true;
        $communication->save();

        return response()->json(['message' => 'Notification marquée comme lue']);
    }

    /**
     * @OA\Get(
     *   path="/communications/{id}/view/{index}",
     *   tags={"Communication"},
     *   summary="View an attached communication file",
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Parameter(name="index", in="path", required=false, @OA\Schema(type="integer", default=0)),
     *   @OA\Response(response=200, description="File response"),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="File not found"),
     *   @OA\Response(response=500, description="Server error")
     * )
     */
    public function view(Request $request, $id, $index = 0)
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $communication = Communication::where('id', $id)->firstOrFail();

        $isSender = ((int) $communication->sender_id === (int) $user->id);
        $isRecipient = ((int) $communication->recipient_id === (int) $user->id) || ($communication->recipient_email === $user->email);

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

    /**
     * @OA\Get(
     *   path="/communications/{id}/download/{index}",
     *   tags={"Communication"},
     *   summary="Download an attached communication file",
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Parameter(name="index", in="path", required=false, @OA\Schema(type="integer", default=0)),
     *   @OA\Response(response=200, description="File download"),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="File not found"),
     *   @OA\Response(response=500, description="Server error")
     * )
     */
    public function download(Request $request, $id, $index = 0)
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $communication = Communication::where('id', $id)->firstOrFail();

        $isSender = ((int) $communication->sender_id === (int) $user->id);
        $isRecipient = ((int) $communication->recipient_id === (int) $user->id) || ($communication->recipient_email === $user->email);

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