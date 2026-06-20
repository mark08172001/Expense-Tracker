<?php
/**
 * Authentication API
 * Handles user registration, login, logout, and profile management
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    $db = Database::getInstance();

    switch ($action) {
        case 'register':
            if ($method !== 'POST') {
                sendError('Method not allowed', 405);
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            $email = $input['email'] ?? '';
            $password = $input['password'] ?? '';
            $fullName = $input['fullName'] ?? '';

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                sendError('Invalid email format', 400);
            }

            if (strlen($password) < 8) {
                sendError('Password must be at least 8 characters', 400);
            }

            // Check if user exists
            $existing = $db->get('users', ['email' => $email]);
            if (!empty($existing)) {
                sendError('Email already registered', 409);
            }

            // Create user with hashed password
            $userData = [
                'email' => $email,
                'full_name' => $fullName,
                'password_hash' => password_hash($password, PASSWORD_BCRYPT),
                'created_at' => date('c')
            ];

            $user = $db->insert('users', $userData);
            
            // Start session
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['email'] = $user['email'];
            
            sendResponse([
                'success' => true,
                'message' => 'Registration successful',
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'fullName' => $user['full_name']
                ]
            ], 201);

        case 'login':
            if ($method !== 'POST') {
                sendError('Method not allowed', 405);
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $email = $input['email'] ?? '';
            $password = $input['password'] ?? '';

            if (!$email || !$password) {
                sendError('Email and password required', 400);
            }

            // Get user by email
            $users = $db->get('users', ['email' => $email]);
            if (empty($users)) {
                sendError('Invalid credentials', 401);
            }

            $user = $users[0];

            // Verify password
            if (!password_verify($password, $user['password_hash'])) {
                sendError('Invalid credentials', 401);
            }

            // Start session
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['full_name'] = $user['full_name'];

            sendResponse([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'fullName' => $user['full_name']
                ]
            ]);

        case 'logout':
            session_destroy();
            sendResponse(['success' => true, 'message' => 'Logged out successfully']);

        case 'profile':
            $userId = requireAuth();

            if ($method === 'GET') {
                $user = $db->getOne('users', $userId);
                if (!$user) {
                    sendError('User not found', 404);
                }

                sendResponse([
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'fullName' => $user['full_name'],
                    'createdAt' => $user['created_at']
                ]);

            } elseif ($method === 'PUT' || $method === 'PATCH') {
                $input = json_decode(file_get_contents('php://input'), true);
                
                $updateData = [];
                if (!empty($input['fullName'])) {
                    $updateData['full_name'] = $input['fullName'];
                }
                if (!empty($input['password'])) {
                    if (strlen($input['password']) < 8) {
                        sendError('Password must be at least 8 characters', 400);
                    }
                    $updateData['password_hash'] = password_hash($input['password'], PASSWORD_BCRYPT);
                }

                if (empty($updateData)) {
                    sendError('No fields to update', 400);
                }

                $db->update('users', $userId, $updateData, $userId);

                $_SESSION['full_name'] = $updateData['full_name'] ?? $_SESSION['full_name'];

                sendResponse(['success' => true, 'message' => 'Profile updated']);
            }
            break;

        case 'check':
            $userId = getAuthUserId();
            if ($userId) {
                $user = $db->getOne('users', $userId);
                sendResponse(['authenticated' => true, 'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'fullName' => $user['full_name']
                ]]);
            } else {
                sendResponse(['authenticated' => false]);
            }
            break;

        default:
            sendError('Invalid action', 400);
    }

} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
?>
