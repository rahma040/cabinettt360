<?php
namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Visite;
use App\Models\Appointment;
use App\Models\Communication;
use App\Models\PasswordResetRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class StatisticsController extends Controller
{
    protected function getAuthenticatedUser()
    {
        try {
            return JWTAuth::parseToken()->authenticate();
        } catch (\Exception $e) {
            return null;
        }
    }

    protected function getDoctorId($user)
    {
        if ($user->role === 'secretaire') {
            return $user->doctor_id;
        }
        return $user->id;
    }

    public function overview()
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) return response()->json(['error' => 'Non authentifié'], 401);

        $doctorId = $this->getDoctorId($user);
        if (!$doctorId) return response()->json(['error' => 'Médecin non trouvé'], 400);

        $totalPatients      = Patient::where('doctor_id', $doctorId)->count();
        $totalVisits        = Visite::whereHas('patient', fn($q) => $q->where('doctor_id', $doctorId))->count();
        $totalAppointments  = Appointment::where('doctor_id', $doctorId)->count();
        $totalRevenue       = Visite::whereHas('patient', fn($q) => $q->where('doctor_id', $doctorId))
                                ->where('statut_paiement', 'payé')->sum('montant');

        $newPatientsThisMonth = Patient::where('doctor_id', $doctorId)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $newPatientsLastMonth = Patient::where('doctor_id', $doctorId)
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->count();

        $completedVisitsThisMonth = Visite::whereHas('patient', fn($q) => $q->where('doctor_id', $doctorId))
            ->whereMonth('date_visite', now()->month)
            ->whereYear('date_visite', now()->year)
            ->count();

        $completedVisitsLastMonth = Visite::whereHas('patient', fn($q) => $q->where('doctor_id', $doctorId))
            ->whereMonth('date_visite', now()->subMonth()->month)
            ->whereYear('date_visite', now()->subMonth()->year)
            ->count();

        $revenueThisMonth = Visite::whereHas('patient', fn($q) => $q->where('doctor_id', $doctorId))
            ->where('statut_paiement', 'payé')
            ->whereMonth('date_visite', now()->month)
            ->whereYear('date_visite', now()->year)
            ->sum('montant');

        $revenueLastMonth = Visite::whereHas('patient', fn($q) => $q->where('doctor_id', $doctorId))
            ->where('statut_paiement', 'payé')
            ->whereMonth('date_visite', now()->subMonth()->month)
            ->whereYear('date_visite', now()->subMonth()->year)
            ->sum('montant');

        $cancelledAppointments = Appointment::where('doctor_id', $doctorId)
            ->where('status', 'cancelled')->count();

        $avgVisitsPerPatient = $totalPatients > 0 ? round($totalVisits / $totalPatients, 1) : 0;

        $paidVisits = Visite::whereHas('patient', fn($q) => $q->where('doctor_id', $doctorId))
            ->where('statut_paiement', 'payé')->count();
        $avgRevenuePerVisit = $paidVisits > 0 ? round($totalRevenue / $paidVisits, 2) : 0;

        $completedAppointments = Appointment::where('doctor_id', $doctorId)
            ->where('status', 'completed')->count();
        $attendanceRate = $totalAppointments > 0 ? round(($completedAppointments / $totalAppointments) * 100, 1) : 0;

        $pendingPayments = Visite::whereHas('patient', fn($q) => $q->where('doctor_id', $doctorId))
            ->whereIn('statut_paiement', ['en_attente', 'impayé'])->count();

        $pendingPaymentsAmount = Visite::whereHas('patient', fn($q) => $q->where('doctor_id', $doctorId))
            ->whereIn('statut_paiement', ['en_attente', 'impayé'])->sum('montant');

        return response()->json([
            'totalPatients' => $totalPatients,
            'totalVisits' => $totalVisits,
            'totalAppointments' => $totalAppointments,
            'totalRevenue'  => $totalRevenue,
            'newPatientsThisMonth'  => $newPatientsThisMonth,
            'newPatientsLastMonth'  => $newPatientsLastMonth,
            'completedVisitsThisMonth' => $completedVisitsThisMonth,
            'completedVisitsLastMonth' => $completedVisitsLastMonth,
            'revenueThisMonth' => $revenueThisMonth,
            'revenueLastMonth' => $revenueLastMonth,
            'cancelledAppointments'  => $cancelledAppointments,
            'avgVisitsPerPatient'  => $avgVisitsPerPatient,
            'avgRevenuePerVisit'  => $avgRevenuePerVisit,
            'attendanceRate'  => $attendanceRate,
            'pendingPayments'  => $pendingPayments,
            'pendingPaymentsAmount'  => $pendingPaymentsAmount,
        ]);
    }

    public function visitsTimeline(Request $request)
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) return response()->json(['error' => 'Non authentifié'], 401);

        $doctorId = $this->getDoctorId($user);
        if (!$doctorId) return response()->json(['error' => 'Médecin non trouvé'], 400);

        $period     = $request->get('period', 'month');
        $dateFormat = '%Y-%m-%d';

        switch ($period) {
            case 'week':  $startDate = now()->subDays(7); break;
            case 'month': $startDate = now()->subDays(30); break;
            case 'year':  $startDate = now()->subYear(); $dateFormat = '%Y-%m'; break;
            default:      $startDate = now()->subDays(30);
        }

        $visits = Visite::whereHas('patient', fn($q) => $q->where('doctor_id', $doctorId))
            ->where('date_visite', '>=', $startDate)
            ->select(
                DB::raw("DATE_FORMAT(date_visite, '{$dateFormat}') as date"),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json($visits);
    }

    public function revenueTimeline(Request $request)
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) return response()->json(['error' => 'Non authentifié'], 401);

        $doctorId = $this->getDoctorId($user);
        if (!$doctorId) return response()->json(['error' => 'Médecin non trouvé'], 400);

        $period     = $request->get('period', 'month');
        $dateFormat = '%Y-%m-%d';

        switch ($period) {
            case 'week':  $startDate = now()->subDays(7); break;
            case 'month': $startDate = now()->subDays(30); break;
            case 'year':  $startDate = now()->subYear(); $dateFormat = '%Y-%m'; break;
            default:      $startDate = now()->subDays(30);
        }

        $revenue = Visite::whereHas('patient', fn($q) => $q->where('doctor_id', $doctorId))
            ->where('statut_paiement', 'payé')
            ->where('date_visite', '>=', $startDate)
            ->select(
                DB::raw("DATE_FORMAT(date_visite, '{$dateFormat}') as date"),
                DB::raw('SUM(montant) as revenue'),
                DB::raw('COUNT(*) as visits')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json($revenue);
    }

    public function paymentDistribution()
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) return response()->json(['error' => 'Non authentifié'], 401);

        $doctorId = $this->getDoctorId($user);
        if (!$doctorId) return response()->json(['error' => 'Médecin non trouvé'], 400);

        $paid    = Visite::whereHas('patient', fn($q) => $q->where('doctor_id', $doctorId))->where('statut_paiement', 'payé')->count();
        $pending = Visite::whereHas('patient', fn($q) => $q->where('doctor_id', $doctorId))->where('statut_paiement', 'en_attente')->count();
        $unpaid  = Visite::whereHas('patient', fn($q) => $q->where('doctor_id', $doctorId))->where('statut_paiement', 'impayé')->count();

        return response()->json([
            ['name' => 'Payé',      'value' => $paid],
            ['name' => 'En attente','value' => $pending],
            ['name' => 'Impayé',    'value' => $unpaid],
        ]);
    }

    public function appointmentDistribution()
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) return response()->json(['error' => 'Non authentifié'], 401);

        $doctorId = $this->getDoctorId($user);
        if (!$doctorId) return response()->json(['error' => 'Médecin non trouvé'], 400);

        $scheduled = Appointment::where('doctor_id', $doctorId)->where('status', 'scheduled')->count();
        $completed = Appointment::where('doctor_id', $doctorId)->where('status', 'completed')->count();
        $cancelled = Appointment::where('doctor_id', $doctorId)->where('status', 'cancelled')->count();

        return response()->json([
            ['name' => 'Planifiés', 'value' => $scheduled],
            ['name' => 'Terminés',  'value' => $completed],
            ['name' => 'Annulés',   'value' => $cancelled],
        ]);
    }

    public function topPatients(Request $request)
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) return response()->json(['error' => 'Non authentifié'], 401);

        $doctorId = $this->getDoctorId($user);
        if (!$doctorId) return response()->json(['error' => 'Médecin non trouvé'], 400);

        $limit = $request->get('limit', 5);

        $topPatients = Patient::where('doctor_id', $doctorId)
            ->withCount('visites')
            ->orderBy('visites_count', 'desc')
            ->limit($limit)
            ->get(['id', 'nom', 'prenom', 'visites_count']);

        return response()->json($topPatients);
    }

    public function ageDistribution()
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) return response()->json(['error' => 'Non authentifié'], 401);

        $doctorId = $this->getDoctorId($user);
        if (!$doctorId) return response()->json(['error' => 'Médecin non trouvé'], 400);

        $patients = Patient::where('doctor_id', $doctorId)->get(['age']);

        $distribution = ['<18' => 0, '18-30' => 0, '31-50' => 0, '51-65' => 0, '>65' => 0];

        foreach ($patients as $p) {
            $age = (int) $p->age;
            if ($age < 18)      $distribution['<18']++;
            elseif ($age <= 30) $distribution['18-30']++;
            elseif ($age <= 50) $distribution['31-50']++;
            elseif ($age <= 65) $distribution['51-65']++;
            else                $distribution['>65']++;
        }

        return response()->json(
            array_map(fn($range, $count) => ['name' => $range, 'value' => $count],
                array_keys($distribution), $distribution)
        );
    }

    public function monthlyComparison()
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) return response()->json(['error' => 'Non authentifié'], 401);

        $doctorId = $this->getDoctorId($user);
        if (!$doctorId) return response()->json(['error' => 'Médecin non trouvé'], 400);

        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $date  = now()->subMonths($i);
            $label = $date->locale('fr')->isoFormat('MMM YY');

            $visitsCount = Visite::whereHas('patient', fn($q) => $q->where('doctor_id', $doctorId))
                ->whereMonth('date_visite', $date->month)
                ->whereYear('date_visite', $date->year)
                ->count();

            $revenue = Visite::whereHas('patient', fn($q) => $q->where('doctor_id', $doctorId))
                ->where('statut_paiement', 'payé')
                ->whereMonth('date_visite', $date->month)
                ->whereYear('date_visite', $date->year)
                ->sum('montant');

            $newPatients = Patient::where('doctor_id', $doctorId)
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->count();

            $months[] = [
                'month'       => $label,
                'visites'     => $visitsCount,
                'revenue'     => (float) $revenue,
                'newPatients' => $newPatients,
            ];
        }

        return response()->json($months);
    }

    public function visitsByDayOfWeek()
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) return response()->json(['error' => 'Non authentifié'], 401);

        $doctorId = $this->getDoctorId($user);
        if (!$doctorId) return response()->json(['error' => 'Médecin non trouvé'], 400);

        $raw = Visite::whereHas('patient', fn($q) => $q->where('doctor_id', $doctorId))
            ->where('date_visite', '>=', now()->subMonths(3))
            ->select(DB::raw('DAYOFWEEK(date_visite) as day_num'), DB::raw('COUNT(*) as count'))
            ->groupBy('day_num')
            ->orderBy('day_num')
            ->get()
            ->keyBy('day_num');

        $dayNames = [2 => 'Lun', 3 => 'Mar', 4 => 'Mer', 5 => 'Jeu', 6 => 'Ven', 7 => 'Sam', 1 => 'Dim'];
        $result = [];
        foreach ([2, 3, 4, 5, 6, 7, 1] as $dayNum) {
            $result[] = [
                'day'   => $dayNames[$dayNum],
                'count' => $raw->has($dayNum) ? $raw[$dayNum]->count : 0,
            ];
        }

        return response()->json($result);
    }

    public function visitStatusDistribution()
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) return response()->json(['error' => 'Non authentifié'], 401);

        $doctorId = $this->getDoctorId($user);
        if (!$doctorId) return response()->json(['error' => 'Médecin non trouvé'], 400);

        $done      = Visite::whereHas('patient', fn($q) => $q->where('doctor_id', $doctorId))->where('statut', 'terminé')->count();
        $planned   = Visite::whereHas('patient', fn($q) => $q->where('doctor_id', $doctorId))->where('statut', 'planifié')->count();
        $cancelled = Visite::whereHas('patient', fn($q) => $q->where('doctor_id', $doctorId))->where('statut', 'annulé')->count();

        return response()->json([
            ['name' => 'Terminées',  'value' => $done],
            ['name' => 'Planifiées', 'value' => $planned],
            ['name' => 'Annulées',   'value' => $cancelled],
        ]);
    }

    public function revenueByMonth()
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) return response()->json(['error' => 'Non authentifié'], 401);

        $doctorId = $this->getDoctorId($user);
        if (!$doctorId) return response()->json(['error' => 'Médecin non trouvé'], 400);

        $data = [];
        for ($i = 11; $i >= 0; $i--) {
            $date    = now()->subMonths($i);
            $label   = $date->locale('fr')->isoFormat('MMM YY');

            $revenue = Visite::whereHas('patient', fn($q) => $q->where('doctor_id', $doctorId))
                ->where('statut_paiement', 'payé')
                ->whereMonth('date_visite', $date->month)
                ->whereYear('date_visite', $date->year)
                ->sum('montant');

            $data[] = ['month' => $label, 'revenue' => (float) $revenue];
        }

        return response()->json($data);
    }

    public function bloodGroupDistribution()
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) return response()->json(['error' => 'Non authentifié'], 401);

        $doctorId = $this->getDoctorId($user);
        if (!$doctorId) return response()->json(['error' => 'Médecin non trouvé'], 400);

        $groups = Patient::where('doctor_id', $doctorId)
            ->whereNotNull('groupe_sanguin')
            ->select('groupe_sanguin', DB::raw('COUNT(*) as count'))
            ->groupBy('groupe_sanguin')
            ->orderBy('count', 'desc')
            ->get();

        return response()->json(
            $groups->map(fn($g) => ['name' => $g->groupe_sanguin, 'value' => $g->count])
        );
    }

    public function recentActivity()
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) return response()->json(['error' => 'Non authentifié'], 401);

        $doctorId = $this->getDoctorId($user);
        if (!$doctorId) return response()->json(['error' => 'Médecin non trouvé'], 400);

        $recentVisits = Visite::whereHas('patient', fn($q) => $q->where('doctor_id', $doctorId))
            ->with('patient:id,nom,prenom')
            ->orderBy('date_visite', 'desc')
            ->limit(5)
            ->get(['id', 'patient_id', 'date_visite', 'motif', 'statut_paiement', 'montant']);

        $recentPatients = Patient::where('doctor_id', $doctorId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'nom', 'prenom', 'created_at', 'age']);

        return response()->json([
            'recentVisits'   => $recentVisits,
            'recentPatients' => $recentPatients,
        ]);
    }

    public function adminDashboard()
    {
        try {
            $admin = JWTAuth::parseToken()->authenticate();
            if ($admin->role !== 'admin') {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $totalUsers = User::count();
            $totalPatients = User::where('role', 'patient')->count();
            $totalMedecins = User::where('role', 'medecin')->count();
            $totalSecretaires = User::where('role', 'secretaire')->count();
            $totalAdmins = User::where('role', 'admin')->count();
            $unverifiedDoctors = User::where('role', 'medecin')->where('verified', false)->count();

            $totalAppointments = Appointment::count();
            $totalCommunications = Communication::count();
            $pendingResetRequests = PasswordResetRequest::where('status', 'pending')->count();

            $recentUsers = User::orderBy('created_at', 'desc')->limit(5)->get(['id', 'name', 'email', 'role', 'created_at']);
            $recentPasswordResets = PasswordResetRequest::orderBy('created_at', 'desc')->limit(5)->get();
            $recentCommunications = Communication::orderBy('created_at', 'desc')->limit(5)->get();

            $userRoleDistribution = [
                ['name' => 'Patients', 'value' => $totalPatients],
                ['name' => 'Médecins', 'value' => $totalMedecins],
                ['name' => 'Secrétaires', 'value' => $totalSecretaires],
                ['name' => 'Admins', 'value' => $totalAdmins],
            ];

            return response()->json([
                'totalUsers' => $totalUsers,
                'totalPatients' => $totalPatients,
                'totalMedecins' => $totalMedecins,
                'totalSecretaires' => $totalSecretaires,
                'totalAdmins' => $totalAdmins,
                'unverifiedDoctors' => $unverifiedDoctors,
                'totalAppointments' => $totalAppointments,
                'totalCommunications' => $totalCommunications,
                'pendingResetRequests' => $pendingResetRequests,
                'recentUsers' => $recentUsers,
                'recentPasswordResets' => $recentPasswordResets,
                'recentCommunications' => $recentCommunications,
                'userRoleDistribution' => $userRoleDistribution,
            ]);
        } catch (\Exception $e) {
            \Log::error('adminDashboard error: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur interne: ' . $e->getMessage()], 500);
        }
    }
}