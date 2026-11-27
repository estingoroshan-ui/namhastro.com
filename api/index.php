<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$parsedUrl = parse_url($requestUri);
$path = $parsedUrl['path'] ?? '/';
$path = preg_replace('#^/api/(v1/)?#', '', $path);
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$rawBody = file_get_contents('php://input');
$body = json_decode($rawBody, true) ?: [];

$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}

function loadJson($file, $default = []) {
    if (file_exists($file)) {
        $content = file_get_contents($file);
        $data = json_decode($content, true);
        if (is_array($data)) return $data;
    }
    return $default;
}

function saveJson($file, $data) {
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// -------------------------------------------------------------
// 1. Auth: Send OTP
// -------------------------------------------------------------
if ($path === 'auth/otp/send' && $method === 'POST') {
    $phone = $body['phone'] ?? '+919988776655';
    $debugOtp = '123456';
    echo json_encode([
        'success' => true,
        'debugOtp' => $debugOtp,
        'message' => "OTP code sent successfully to $phone. Use 123456 for instant verification."
    ]);
    exit();
}

// -------------------------------------------------------------
// 2. Auth: Verify OTP
// -------------------------------------------------------------
if ($path === 'auth/otp/verify' && $method === 'POST') {
    $phone = $body['phone'] ?? '+919988776655';
    $otp = $body['otp'] ?? '';
    $fullName = !empty($body['fullName']) ? $body['fullName'] : 'Devotee User';

    $usersFile = $dataDir . '/users.json';
    $users = loadJson($usersFile, []);

    $userId = 'usr_' . substr(md5($phone), 0, 8);
    $user = [
        'id' => $userId,
        'fullName' => $fullName,
        'phone' => $phone,
        'email' => preg_replace('/[^0-9]/', '', $phone) . '@namhastro.com',
        'role' => 'CUSTOMER',
        'status' => 'ACTIVE',
        'preferredLanguage' => 'hi',
        'wallet' => [
            'paidBalanceInr' => 100.0,
            'promoBalanceInr' => 50.0,
            'totalBalanceInr' => 150.0
        ],
        'profile' => [
            'avatarUrl' => null,
            'dateOfBirth' => '1995-05-15',
            'birthPlace' => 'New Delhi, India',
            'currentCity' => 'New Delhi',
            'gender' => 'Male',
            'maritalStatus' => 'Single'
        ]
    ];

    $users[$userId] = $user;
    saveJson($usersFile, $users);

    $token = 'namh_token_' . bin2hex(random_bytes(16));
    echo json_encode([
        'success' => true,
        'tokens' => [
            'accessToken' => $token,
            'refreshToken' => 'namh_refresh_' . bin2hex(random_bytes(16))
        ],
        'user' => $user
    ]);
    exit();
}

// -------------------------------------------------------------
// 3. Auth: Current User Profile (auth/me)
// -------------------------------------------------------------
if ($path === 'auth/me' && $method === 'GET') {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    // Return standard active devotee user
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => 'usr_namh_demo',
            'fullName' => 'Devotee Acharya',
            'phone' => '+919988776655',
            'email' => 'devotee@namhastro.com',
            'role' => 'CUSTOMER',
            'status' => 'ACTIVE',
            'preferredLanguage' => 'hi',
            'wallet' => [
                'paidBalanceInr' => 100.0,
                'promoBalanceInr' => 50.0,
                'totalBalanceInr' => 150.0
            ],
            'profile' => [
                'dateOfBirth' => '1995-05-15',
                'birthPlace' => 'New Delhi, India',
                'currentCity' => 'New Delhi',
                'gender' => 'Male'
            ]
        ]
    ]);
    exit();
}

// -------------------------------------------------------------
// 4. Vendor / Astrologer Partner Application (partner/apply)
// -------------------------------------------------------------
if ($path === 'partner/apply' && $method === 'POST') {
    $appsFile = $dataDir . '/partner_applications.json';
    $apps = loadJson($appsFile, []);

    $appId = 'app_' . date('Ymd_His') . '_' . substr(md5(uniqid()), 0, 6);
    $newApp = array_merge($body, [
        'id' => $appId,
        'submittedAt' => date('c'),
        'status' => 'SUBMITTED',
        'verificationStage' => 'IN_REVIEW'
    ]);

    $apps[] = $newApp;
    saveJson($appsFile, $apps);

    echo json_encode([
        'success' => true,
        'message' => 'Vendor application submitted successfully! Your Vedic credentials are now under review by our council.',
        'data' => $newApp
    ]);
    exit();
}

// -------------------------------------------------------------
// 5. Vendor / Partner Dashboard (partner/dashboard)
// -------------------------------------------------------------
if ($path === 'partner/dashboard' && $method === 'GET') {
    echo json_encode([
        'success' => true,
        'data' => [
            'profile' => [
                'id' => 'ast_namh_live',
                'displayName' => 'Acharya Someshwar Shastri',
                'slug' => 'acharya-someshwar',
                'verificationStage' => 'APPROVED',
                'availabilityStatus' => 'ONLINE',
                'isOnline' => true,
                'chatEnabled' => true,
                'audioEnabled' => true,
                'videoEnabled' => true,
                'chatRatePaise' => 3000,
                'audioRatePaise' => 3500,
                'videoRatePaise' => 5000,
                'averageRating' => 4.9,
                'totalReviews' => 312,
                'totalConsultations' => 840
            ],
            'earnings' => [
                'grossRevenuePaise' => 2520000,
                'grossRevenueInr' => '25,200.00',
                'platformCommissionPaise' => 504000,
                'commissionPercent' => '20.00',
                'netEarningsPaise' => 2016000,
                'netEarningsInr' => '20,160.00',
                'withdrawablePaise' => 1850000,
                'withdrawableInr' => '18,500.00',
                'pendingSettlementPaise' => 166000,
                'pendingSettlementInr' => '1,660.00'
            ]
        ]
    ]);
    exit();
}

// -------------------------------------------------------------
// 6. Customer Birth Profiles (customer/birth-profiles)
// -------------------------------------------------------------
if (strpos($path, 'customer/birth-profiles') === 0) {
    $profilesFile = $dataDir . '/birth_profiles.json';
    $profiles = loadJson($profilesFile, [
        [
            'id' => 'prf_self',
            'relation' => 'SELF',
            'fullName' => 'Aarav Sharma',
            'gender' => 'Male',
            'dateOfBirth' => '1994-11-26',
            'timeOfBirth' => '08:45',
            'isBirthTimeUnknown' => false,
            'birthPlace' => 'New Delhi, Delhi, India',
            'isDefault' => true
        ]
    ]);

    if ($method === 'POST') {
        $newId = 'prf_' . time();
        $profile = array_merge($body, ['id' => $newId]);
        $profiles[] = $profile;
        saveJson($profilesFile, $profiles);
        echo json_encode(['success' => true, 'data' => $profile]);
        exit();
    }

    echo json_encode(['success' => true, 'data' => $profiles]);
    exit();
}

// -------------------------------------------------------------
// 7. Customer Support Tickets (customer/support/tickets)
// -------------------------------------------------------------
if (strpos($path, 'customer/support/tickets') === 0) {
    $ticketsFile = $dataDir . '/support_tickets.json';
    $tickets = loadJson($ticketsFile, [
        [
            'id' => 'tkt_101',
            'ticketNumber' => 'NAMH-TKT-101',
            'category' => 'CONSULTATION',
            'subject' => 'Call quality inquiry',
            'description' => 'Consultation was crisp and detailed.',
            'status' => 'RESOLVED',
            'priority' => 'NORMAL',
            'createdAt' => date('Y-m-d')
        ]
    ]);

    if ($method === 'POST') {
        $newTicket = [
            'id' => 'tkt_' . time(),
            'ticketNumber' => 'NAMH-TKT-' . rand(1000, 9999),
            'category' => $body['category'] ?? 'CONSULTATION',
            'subject' => $body['subject'] ?? 'General Query',
            'description' => $body['description'] ?? '',
            'status' => 'OPEN',
            'priority' => $body['priority'] ?? 'NORMAL',
            'createdAt' => date('Y-m-d')
        ];
        $tickets[] = $newTicket;
        saveJson($ticketsFile, $tickets);
        echo json_encode(['success' => true, 'data' => $newTicket]);
        exit();
    }

    echo json_encode(['success' => true, 'data' => $tickets]);
    exit();
}

// -------------------------------------------------------------
// 8. Wallet Services
// -------------------------------------------------------------
if (strpos($path, 'wallet/packages') === 0) {
    echo json_encode([
        'success' => true,
        'data' => [
            ['id' => 'wp_1', 'amountInr' => 100, 'extraPercent' => 0, 'popular' => false],
            ['id' => 'wp_2', 'amountInr' => 250, 'extraPercent' => 5, 'popular' => false],
            ['id' => 'wp_3', 'amountInr' => 500, 'extraPercent' => 10, 'popular' => true],
            ['id' => 'wp_4', 'amountInr' => 1000, 'extraPercent' => 15, 'popular' => false],
            ['id' => 'wp_5', 'amountInr' => 2500, 'extraPercent' => 20, 'popular' => false],
        ]
    ]);
    exit();
}

if (strpos($path, 'wallet/balance') === 0) {
    echo json_encode([
        'success' => true,
        'data' => [
            'paidBalanceInr' => 100.0,
            'promoBalanceInr' => 50.0,
            'totalBalanceInr' => 150.0
        ]
    ]);
    exit();
}

// Default fallback
echo json_encode([
    'success' => true,
    'message' => 'NAMH ASTRO API Engine Active',
    'endpoint' => $path
]);
