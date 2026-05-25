<?php

namespace App\Http\Controllers;

use OpenApi\Annotations as OA;
use App\Models\DoctorTask;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Exceptions\JWTException;

class DoctorTaskController extends Controller
{
    private function getAuthenticatedUser()
    {
        try {
            return JWTAuth::parseToken()->authenticate();
        } catch (TokenExpiredException | TokenInvalidException | JWTException $e) {
            return null;
        }
    }

    private function getDoctorId($user)
    {
        if ($user->role === 'medecin') {
            return $user->id;
        }
        if ($user->role === 'secretaire') {
            return $user->doctor_id; 
        }
        return null;
    }

    /**
     * @OA\Get(
    *   path="/doctor/tasks",
     *   tags={"DoctorTask"},
     *   summary="List tasks for the current doctor",
     *   security={{"bearerAuth":{}}},
     *   @OA\Response(response=200, description="Task list", @OA\JsonContent(type="array", @OA\Items(type="object"))),
     *   @OA\Response(response=401, description="Unauthorized"),
     *   @OA\Response(response=500, description="Server error")
     * )
     */
    public function index(Request $request)
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $doctorId = $this->getDoctorId($user);
        if (!$doctorId) {
            return response()->json([]); 
        }

        $tasks = DoctorTask::where('doctor_id', $doctorId)
            ->orderBy('time', 'desc')
            ->get();

        return response()->json($tasks);
    }

    /**
     * @OA\Post(
    *   path="/doctor/tasks",
     *   tags={"DoctorTask"},
     *   summary="Create a task",
     *   security={{"bearerAuth":{}}},
     *   @OA\RequestBody(required=true, @OA\JsonContent(
     *     required={"task","time","priority","status"},
     *     @OA\Property(property="task", type="string", example="Call patient and review results"),
     *     @OA\Property(property="time", type="string", format="date-time", example="2026-05-25T10:30:00Z"),
     *     @OA\Property(property="priority", type="string", enum={"low","medium","high"}, example="high"),
     *     @OA\Property(property="status", type="string", enum={"pending","done","cancelled"}, example="pending"),
     *     @OA\Property(property="note", type="string", example="Bring previous lab tests")
     *   )),
     *   @OA\Response(response=201, description="Task created", @OA\JsonContent(type="object")),
     *   @OA\Response(response=401, description="Unauthorized"),
     *   @OA\Response(response=403, description="Forbidden"),
     *   @OA\Response(response=422, description="Validation error"),
     *   @OA\Response(response=500, description="Server error")
     * )
     */
    public function store(Request $request)
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        if ($user->role !== 'medecin') {
            return response()->json(['error' => 'Forbidden: only doctors can create tasks'], 403);
        }

        $validator = Validator::make($request->all(), [
            'task'     => 'required|string|max:255',
            'time'     => 'required|date',
            'priority' => 'required|in:low,medium,high',
            'status'   => 'required|in:pending,done,cancelled',
            'note'     => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $task = DoctorTask::create([
            'doctor_id' => $user->id,
            'task'      => $request->task,
            'time'      => $request->time,
            'priority'  => $request->priority,
            'status'    => $request->status,
            'note'      => $request->note,
        ]);

        return response()->json($task, 201);
    }

    /**
     * @OA\Put(
    *   path="/doctor/tasks/{id}",
     *   tags={"DoctorTask"},
     *   summary="Update a task",
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\RequestBody(@OA\JsonContent(
     *     @OA\Property(property="task", type="string", example="Updated task title"),
     *     @OA\Property(property="time", type="string", format="date-time", example="2026-05-25T11:00:00Z"),
     *     @OA\Property(property="priority", type="string", enum={"low","medium","high"}, example="medium"),
     *     @OA\Property(property="status", type="string", enum={"pending","done","cancelled"}, example="done"),
     *     @OA\Property(property="note", type="string", example="Updated note")
     *   )),
     *   @OA\Response(response=200, description="Task updated", @OA\JsonContent(type="object")),
     *   @OA\Response(response=401, description="Unauthorized"),
     *   @OA\Response(response=404, description="Task not found"),
     *   @OA\Response(response=422, description="Validation error"),
     *   @OA\Response(response=500, description="Server error")
     * )
     */
    public function update(Request $request, $id)
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $doctorId = $this->getDoctorId($user);
        if (!$doctorId) {
            return response()->json(['error' => 'No doctor assigned'], 404);
        }

        $task = DoctorTask::where('doctor_id', $doctorId)
            ->where('id', $id)
            ->first();

        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'task'     => 'sometimes|string|max:255',
            'time'     => 'sometimes|date',
            'priority' => 'sometimes|in:low,medium,high',
            'status'   => 'sometimes|in:pending,done,cancelled',
            'note'     => 'sometimes|nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($user->role === 'secretaire') {
            $data = $request->only('status');
            if (count($data) === 0 || !isset($data['status'])) {
                return response()->json(['error' => 'Secretaries can only update status'], 422);
            }
            $task->update($data);
        } else {
            $task->update($request->only(['task', 'time', 'priority', 'status', 'note']));
        }

        return response()->json($task);
    }

    /**
     * @OA\Delete(
    *   path="/doctor/tasks/{id}",
     *   tags={"DoctorTask"},
     *   summary="Delete a task",
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="Task deleted", @OA\JsonContent(type="object")),
     *   @OA\Response(response=401, description="Unauthorized"),
     *   @OA\Response(response=403, description="Forbidden"),
     *   @OA\Response(response=404, description="Task not found"),
     *   @OA\Response(response=500, description="Server error")
     * )
     */
    public function destroy(Request $request, $id)
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        if ($user->role !== 'medecin') {
            return response()->json(['error' => 'Forbidden: only doctors can delete tasks'], 403);
        }

        $task = DoctorTask::where('doctor_id', $user->id)
            ->where('id', $id)
            ->first();

        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        $task->delete();

        return response()->json(['message' => 'Task deleted']);
    }
}