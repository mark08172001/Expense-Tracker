<?php
/**
 * CORS and Security Headers
 */

// Allow requests from localhost and the app domain
$allowedOrigins = [
    'http://localhost:8000',
    'http://localhost:3000',
    'http://127.0.0.1:8000',
    'http://127.0.0.1:3000',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Max-Age: 86400');
}

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Helper function to send JSON response
 */
function sendResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit();
}

/**
 * Helper function to send error response
 */
function sendError($message, $code = 400) {
    sendResponse(['error' => $message, 'code' => $code], $code);
}

/**
 * Get authenticated user ID from session/token
 */
function getAuthUserId() {
    return $_SESSION['user_id'] ?? null;
}

/**
 * Require authentication
 */
function requireAuth() {
    $userId = getAuthUserId();
    if (!$userId) {
        sendError('Unauthorized', 401);
    }
    return $userId;
}

?>
