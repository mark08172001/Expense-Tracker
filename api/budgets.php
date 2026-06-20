<?php
/**
 * Budgets API
 * Handles CRUD operations for monthly budgets
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    $db = Database::getInstance();
    $userId = requireAuth();

    switch ($action) {
        case 'list':
            if ($method !== 'GET') {
                sendError('Method not allowed', 405);
            }

            $month = $_GET['month'] ?? date('Y-m');
            
            $endpoint = 'budgets?user_id=eq.' . $userId . '&month=eq.' . urlencode($month);
            $result = $db->request('GET', $endpoint);

            sendResponse([
                'budgets' => $result['data'] ?? [],
                'month' => $month
            ]);

        case 'create':
            if ($method !== 'POST') {
                sendError('Method not allowed', 405);
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $categoryId = intval($input['categoryId'] ?? 0);
            $monthlyLimit = floatval($input['monthlyLimit'] ?? 0);
            $month = $input['month'] ?? date('Y-m');

            if ($categoryId <= 0) {
                sendError('Valid category required', 400);
            }

            if ($monthlyLimit <= 0) {
                sendError('Monthly limit must be greater than 0', 400);
            }

            // Verify category belongs to user
            $category = $db->getOne('categories', $categoryId, $userId);
            if (!$category) {
                sendError('Category not found', 404);
            }

            // Check for existing budget
            $endpoint = 'budgets?user_id=eq.' . $userId . '&category_id=eq.' . $categoryId . '&month=eq.' . urlencode($month);
            $existing = $db->request('GET', $endpoint)['data'] ?? [];
            
            if (!empty($existing)) {
                sendError('Budget already exists for this category this month', 409);
            }

            $budgetData = [
                'user_id' => $userId,
                'category_id' => $categoryId,
                'monthly_limit' => $monthlyLimit,
                'month' => $month,
                'created_at' => date('c')
            ];

            $budget = $db->insert('budgets', $budgetData);

            sendResponse([
                'success' => true,
                'message' => 'Budget created',
                'budget' => $budget
            ], 201);

        case 'update':
            if (!in_array($method, ['PUT', 'PATCH'])) {
                sendError('Method not allowed', 405);
            }

            $id = intval($_GET['id'] ?? 0);
            if ($id <= 0) {
                sendError('Invalid budget ID', 400);
            }

            // Verify budget belongs to user
            $budget = $db->getOne('budgets', $id, $userId);
            if (!$budget) {
                sendError('Budget not found', 404);
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $updateData = [];

            if (isset($input['monthlyLimit'])) {
                $monthlyLimit = floatval($input['monthlyLimit']);
                if ($monthlyLimit <= 0) {
                    sendError('Monthly limit must be greater than 0', 400);
                }
                $updateData['monthly_limit'] = $monthlyLimit;
            }

            if (empty($updateData)) {
                sendError('No fields to update', 400);
            }

            $db->update('budgets', $id, $updateData, $userId);

            sendResponse(['success' => true, 'message' => 'Budget updated']);

        case 'delete':
            if ($method !== 'DELETE') {
                sendError('Method not allowed', 405);
            }

            $id = intval($_GET['id'] ?? 0);
            if ($id <= 0) {
                sendError('Invalid budget ID', 400);
            }

            // Verify budget belongs to user
            $budget = $db->getOne('budgets', $id, $userId);
            if (!$budget) {
                sendError('Budget not found', 404);
            }

            $db->delete('budgets', $id, $userId);

            sendResponse(['success' => true, 'message' => 'Budget deleted']);

        default:
            sendError('Invalid action', 400);
    }

} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
?>
