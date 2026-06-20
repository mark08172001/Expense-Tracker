<?php
/**
 * Categories API
 * Handles CRUD operations for transaction categories
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    $db = Database::getInstance();
    $userId = requireAuth();

    // Default categories
    $defaultCategories = [
        ['name' => 'Salary', 'type' => 'income', 'icon' => '💰'],
        ['name' => 'Food', 'type' => 'expense', 'icon' => '🍔'],
        ['name' => 'Transportation', 'type' => 'expense', 'icon' => '🚗'],
        ['name' => 'Shopping', 'type' => 'expense', 'icon' => '🛍️'],
        ['name' => 'Bills', 'type' => 'expense', 'icon' => '💳'],
        ['name' => 'Entertainment', 'type' => 'expense', 'icon' => '🎬'],
        ['name' => 'Healthcare', 'type' => 'expense', 'icon' => '⚕️'],
        ['name' => 'Education', 'type' => 'expense', 'icon' => '📚'],
        ['name' => 'Investments', 'type' => 'income', 'icon' => '📈'],
        ['name' => 'Other', 'type' => 'expense', 'icon' => '📌'],
    ];

    switch ($action) {
        case 'list':
            if ($method !== 'GET') {
                sendError('Method not allowed', 405);
            }

            $type = $_GET['type'] ?? null;
            $endpoint = 'categories?user_id=eq.' . $userId . '&order=name.asc';
            
            if ($type && in_array($type, ['income', 'expense'])) {
                $endpoint .= '&type=eq.' . urlencode($type);
            }

            $result = $db->request('GET', $endpoint);

            sendResponse([
                'categories' => $result['data'] ?? [],
                'defaults' => $defaultCategories
            ]);

        case 'create':
            if ($method !== 'POST') {
                sendError('Method not allowed', 405);
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $name = trim($input['name'] ?? '');
            $type = $input['type'] ?? '';
            $icon = $input['icon'] ?? '📌';

            if (empty($name)) {
                sendError('Category name is required', 400);
            }

            if (!in_array($type, ['income', 'expense'])) {
                sendError('Invalid category type', 400);
            }

            $categoryData = [
                'user_id' => $userId,
                'name' => $name,
                'type' => $type,
                'icon' => $icon,
                'created_at' => date('c')
            ];

            $category = $db->insert('categories', $categoryData);

            sendResponse([
                'success' => true,
                'message' => 'Category created',
                'category' => $category
            ], 201);

        case 'update':
            if (!in_array($method, ['PUT', 'PATCH'])) {
                sendError('Method not allowed', 405);
            }

            $id = intval($_GET['id'] ?? 0);
            if ($id <= 0) {
                sendError('Invalid category ID', 400);
            }

            // Verify category belongs to user
            $category = $db->getOne('categories', $id, $userId);
            if (!$category) {
                sendError('Category not found', 404);
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $updateData = [];

            if (isset($input['name'])) {
                $name = trim($input['name']);
                if (empty($name)) {
                    sendError('Category name cannot be empty', 400);
                }
                $updateData['name'] = $name;
            }

            if (isset($input['icon'])) {
                $updateData['icon'] = $input['icon'];
            }

            if (empty($updateData)) {
                sendError('No fields to update', 400);
            }

            $db->update('categories', $id, $updateData, $userId);

            sendResponse(['success' => true, 'message' => 'Category updated']);

        case 'delete':
            if ($method !== 'DELETE') {
                sendError('Method not allowed', 405);
            }

            $id = intval($_GET['id'] ?? 0);
            if ($id <= 0) {
                sendError('Invalid category ID', 400);
            }

            // Verify category belongs to user
            $category = $db->getOne('categories', $id, $userId);
            if (!$category) {
                sendError('Category not found', 404);
            }

            // Check if category has transactions
            $transactions = $db->get('transactions', ['category_id' => $id]);
            if (!empty($transactions)) {
                sendError('Cannot delete category with existing transactions', 400);
            }

            $db->delete('categories', $id, $userId);

            sendResponse(['success' => true, 'message' => 'Category deleted']);

        default:
            sendError('Invalid action', 400);
    }

} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
?>
