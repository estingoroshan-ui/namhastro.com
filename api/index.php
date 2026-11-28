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
        'message' => "Verification code dispatched to $phone."
    ]);
    exit();
}

// -------------------------------------------------------------
// 2. Auth: Verify OTP
// -------------------------------------------------------------
if ($path === 'auth/otp/verify' && $method === 'POST') {
    $phone = $body['phone'] ?? '+919988776655';
    $otp = $body['otp'] ?? '';
    $fullName = !empty($body['fullName']) ? $body['fullName'] : '';
    $dateOfBirth = !empty($body['dateOfBirth']) ? $body['dateOfBirth'] : '';
    $timeOfBirth = !empty($body['timeOfBirth']) ? $body['timeOfBirth'] : '';
    $birthPlace = !empty($body['birthPlace']) ? $body['birthPlace'] : '';

    $usersFile = $dataDir . '/users.json';
    $users = loadJson($usersFile, []);

    $userId = 'usr_' . substr(md5($phone), 0, 8);

    if (isset($users[$userId])) {
        $user = $users[$userId];
        if (!empty($fullName)) $user['fullName'] = $fullName;
        if (!empty($dateOfBirth)) $user['profile']['dateOfBirth'] = $dateOfBirth;
        if (!empty($timeOfBirth)) $user['profile']['timeOfBirth'] = $timeOfBirth;
        if (!empty($birthPlace)) $user['profile']['birthPlace'] = $birthPlace;
    } else {
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        $displayName = !empty($fullName) ? $fullName : '';
        $user = [
            'id' => $userId,
            'fullName' => $displayName,
            'phone' => $phone,
            'email' => '',
            'role' => 'CUSTOMER',
            'status' => 'ACTIVE',
            'preferredLanguage' => '',
            'wallet' => [
                'paidBalanceInr' => 100.0,
                'promoBalanceInr' => 50.0,
                'totalBalanceInr' => 150.0
            ],
            'profile' => [
                'avatarUrl' => null,
                'dateOfBirth' => $dateOfBirth,
                'timeOfBirth' => $timeOfBirth,
                'birthPlace' => $birthPlace,
                'currentCity' => $birthPlace,
                'gender' => '',
                'maritalStatus' => ''
            ]
        ];
    }

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
    
    $usersFile = $dataDir . '/users.json';
    $users = loadJson($usersFile, []);
    $firstUser = !empty($users) ? reset($users) : null;

    if ($firstUser) {
        echo json_encode([
            'success' => true,
            'user' => $firstUser
        ]);
        exit();
    }

    echo json_encode([
        'success' => true,
        'user' => [
            'id' => 'usr_namh_demo',
            'fullName' => '',
            'phone' => '+919988776655',
            'email' => '',
            'role' => 'CUSTOMER',
            'status' => 'ACTIVE',
            'preferredLanguage' => '',
            'wallet' => [
                'paidBalanceInr' => 100.0,
                'promoBalanceInr' => 50.0,
                'totalBalanceInr' => 150.0
            ],
            'profile' => [
                'dateOfBirth' => '',
                'timeOfBirth' => '',
                'birthPlace' => '',
                'currentCity' => '',
                'gender' => ''
            ]
        ]
    ]);
    exit();
}

// -------------------------------------------------------------
// 3b. Customer Profile Update (customer/profile)
// -------------------------------------------------------------
if ((strpos($path, 'customer/profile') === 0 || strpos($path, 'auth/profile') === 0) && ($method === 'PUT' || $method === 'POST')) {
    $usersFile = $dataDir . '/users.json';
    $users = loadJson($usersFile, []);
    if (!empty($users)) {
        $keys = array_keys($users);
        $firstKey = $keys[0];
        $users[$firstKey] = array_merge($users[$firstKey], $body);
        if (isset($body['dateOfBirth']) || isset($body['timeOfBirth']) || isset($body['birthPlace']) || isset($body['gender'])) {
            $users[$firstKey]['profile'] = array_merge($users[$firstKey]['profile'] ?? [], [
                'dateOfBirth' => $body['dateOfBirth'] ?? ($users[$firstKey]['profile']['dateOfBirth'] ?? ''),
                'timeOfBirth' => $body['timeOfBirth'] ?? ($users[$firstKey]['profile']['timeOfBirth'] ?? ''),
                'birthPlace' => $body['birthPlace'] ?? ($users[$firstKey]['profile']['birthPlace'] ?? ''),
                'gender' => $body['gender'] ?? ($users[$firstKey]['profile']['gender'] ?? 'Male')
            ]);
        }
        saveJson($usersFile, $users);
    }
    echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
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
    $profiles = loadJson($profilesFile, []);

    // Handle PUT / update existing profile
    if ($method === 'PUT' || ($method === 'POST' && !empty($body['id']))) {
        $id = $body['id'] ?? basename($path);
        $found = false;
        foreach ($profiles as &$p) {
            if ($p['id'] === $id) {
                $p = array_merge($p, $body);
                $found = true;
                break;
            }
        }
        if (!$found && !empty($body)) {
            $profiles[] = array_merge($body, ['id' => $id ?: ('prf_' . time())]);
        }
        saveJson($profilesFile, $profiles);
        echo json_encode(['success' => true, 'data' => $body, 'profiles' => $profiles]);
        exit();
    }

    if ($method === 'POST') {
        $newId = 'prf_' . time();
        $profile = array_merge($body, ['id' => $newId]);
        $profiles[] = $profile;
        saveJson($profilesFile, $profiles);
        echo json_encode(['success' => true, 'data' => $profile, 'profiles' => $profiles]);
        exit();
    }

    if ($method === 'DELETE') {
        $delId = basename($path);
        $profiles = array_values(array_filter($profiles, function($p) use ($delId) {
            return $p['id'] !== $delId;
        }));
        saveJson($profilesFile, $profiles);
        echo json_encode(['success' => true, 'profiles' => $profiles]);
        exit();
    }

    echo json_encode(['success' => true, 'profiles' => $profiles, 'data' => $profiles]);
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
            ['id' => 'wp_1', 'code' => 'WP100', 'name' => 'Shubh Starter', 'amountInr' => 100, 'bonusInr' => 0, 'totalCreditInr' => 100, 'isPopular' => false, 'badgeText' => ''],
            ['id' => 'wp_2', 'code' => 'WP250', 'name' => 'Mangal Pack', 'amountInr' => 250, 'bonusInr' => 25, 'totalCreditInr' => 275, 'isPopular' => false, 'badgeText' => '+₹25 Bonus'],
            ['id' => 'wp_3', 'code' => 'WP500', 'name' => 'Kalyan Popular', 'amountInr' => 500, 'bonusInr' => 75, 'totalCreditInr' => 575, 'isPopular' => true, 'badgeText' => 'Most Popular · +₹75'],
            ['id' => 'wp_4', 'code' => 'WP1000', 'name' => 'Lakshmi Prosperity', 'amountInr' => 1000, 'bonusInr' => 200, 'totalCreditInr' => 1200, 'isPopular' => false, 'badgeText' => '20% Extra'],
            ['id' => 'wp_5', 'code' => 'WP2500', 'name' => 'Divya Supreme', 'amountInr' => 2500, 'bonusInr' => 600, 'totalCreditInr' => 3100, 'isPopular' => false, 'badgeText' => 'Maximum Value'],
        ]
    ]);
    exit();
}

if (strpos($path, 'wallet/balance') === 0) {
    echo json_encode([
        'success' => true,
        'data' => [
            'currency' => 'INR',
            'paidBalanceInr' => 100.0,
            'promoBalanceInr' => 50.0,
            'totalBalanceInr' => 150.0
        ]
    ]);
    exit();
}

if (strpos($path, 'wallet/transactions') === 0) {
    echo json_encode([
        'success' => true,
        'data' => [
            'transactions' => [
                [
                    'id' => 'tx_init_1',
                    'idempotencyKey' => 'idemp_promo_50',
                    'type' => 'CREDIT_PROMO',
                    'amountInr' => '50.00',
                    'balanceAfterInr' => '150.00',
                    'referenceType' => 'WELCOME_BONUS',
                    'description' => 'Welcome Promotional Credit (₹1/min Offer)',
                    'createdAt' => date('Y-m-d H:i:s', strtotime('-1 day'))
                ],
                [
                    'id' => 'tx_init_2',
                    'idempotencyKey' => 'idemp_paid_100',
                    'type' => 'CREDIT_PAID',
                    'amountInr' => '100.00',
                    'balanceAfterInr' => '100.00',
                    'referenceType' => 'INTRO_RECHARGE',
                    'description' => 'Introductory Consultation Balance',
                    'createdAt' => date('Y-m-d H:i:s', strtotime('-2 days'))
                ]
            ]
        ]
    ]);
    exit();
}

if (strpos($path, 'wallet/invoices') === 0) {
    echo json_encode([
        'success' => true,
        'data' => [
            [
                'id' => 'inv_init_1',
                'invoiceNumber' => 'INV-NAMH-' . date('Y') . '-001',
                'orderId' => 'ord_welcome_100',
                'customerName' => 'Devotee Customer',
                'customerGstin' => null,
                'sacCode' => '998399',
                'taxableAmountInr' => '100.00',
                'cgstInr' => '9.00',
                'sgstInr' => '9.00',
                'totalAmountInr' => '118.00',
                'issuedAt' => date('Y-m-d H:i:s', strtotime('-2 days'))
            ]
        ]
    ]);
    exit();
}

if (strpos($path, 'wallet/recharge/order') === 0 && $method === 'POST') {
    $amountInr = $body['amountInr'] ?? 500;
    $gstInr = round($amountInr * 0.18, 2);
    $totalInr = $amountInr + $gstInr;
    echo json_encode([
        'success' => true,
        'data' => [
            'gatewayOrderId' => 'order_sim_' . time(),
            'razorpayKeyId' => 'rzp_test_5d06namhastro2026',
            'amountPaise' => $totalInr * 100,
            'walletCreditInr' => $amountInr,
            'gstInr' => $gstInr,
            'customerName' => 'Devotee Customer',
            'customerEmail' => 'customer@namhastro.com',
            'customerPhone' => '+919988776655'
        ]
    ]);
    exit();
}

if (strpos($path, 'wallet/recharge/verify') === 0 && $method === 'POST') {
    echo json_encode([
        'success' => true,
        'message' => 'Payment verified and wallet credited successfully.'
    ]);
    exit();
}

// Default fallback
echo json_encode([
    'success' => true,
    'message' => 'NAMH ASTRO API Engine Active',
    'endpoint' => $path
]);
