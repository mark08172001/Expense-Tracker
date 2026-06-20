<?php
/**
 * Transactions API
 * Handles CRUD operations for transactions
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    $db = Database::getInstance();
    $userId = requireAuth();

    switch ($action) {
        case 'create':
            if ($method !== 'POST') {
                sendError('Method not allowed', 405);
            }

            $input = json_decode(file_get_contents('php://input'), true);
            
            $amount = floatval($input['amount'] ?? 0);
            $categoryId = intval($input['categoryId'] ?? 0);
            $type = $input['type'] ?? ''; // income or expense
            $paymentMethod = $input['paymentMethod'] ?? '';
            $date = $input['date'] ?? date('Y-m-d');
            $notes = $input['notes'] ?? '';

            if ($amount <= 0) {
                sendError('Amount must be greater than 0', 400);
            }

            if (!in_array($type, ['income', 'expense'])) {
                sendError('Invalid transaction type', 400);
            }

            if ($categoryId <= 0) {
                sendError('Valid category required', 400);
            }

            // Verify category belongs to user
            $category = $db->getOne('categories', $categoryId, $userId);
            if (!$category) {
                sendError('Category not found', 404);
            }

            $transactionData = [
                'user_id' => $userId,
                'category_id' => $categoryId,
                'amount' => $amount,
                'transaction_type' => $type,
                'payment_method' => $paymentMethod,
                'transaction_date' => $date,
                'notes' => $notes,
                'created_at' => date('c')
            ];

            $transaction = $db->insert('transactions', $transactionData);
            
            sendResponse([
                'success' => true,
                'message' => 'Transaction created',
                'transaction' => $transaction
            ], 201);

        case 'list':
            if ($method !== 'GET') {
                sendError('Method not allowed', 405);
            }

            $startDate = $_GET['startDate'] ?? date('Y-m-01', strtotime('first day of this month'));
            $endDate = $_GET['endDate'] ?? date('Y-m-d');
            $categoryId = $_GET['categoryId'] ?? null;
            $type = $_GET['type'] ?? null;
            $paymentMethod = $_GET['paymentMethod'] ?? null;
            $limit = intval($_GET['limit'] ?? 100);
            $offset = intval($_GET['offset'] ?? 0);

            // Build endpoint with filters
            $endpoint = 'transactions?user_id=eq.' . $userId;
            $endpoint .= '&transaction_date=gte.' . urlencode($startDate);
            $endpoint .= '&transaction_date=lte.' . urlencode($endDate);

            if ($categoryId) {
                $endpoint .= '&category_id=eq.' . intval($categoryId);
            }

            if ($type && in_array($type, ['income', 'expense'])) {
                $endpoint .= '&transaction_type=eq.' . urlencode($type);
            }

            if ($paymentMethod) {
                $endpoint .= '&payment_method=eq.' . urlencode($paymentMethod);
            }

            $endpoint .= '&order=transaction_date.desc&limit=' . $limit . '&offset=' . $offset;

            $result = $db->request('GET', $endpoint);
            
            // Get total count
            $countEndpoint = 'transactions?user_id=eq.' . $userId . '&select=count';
            $countResult = $db->request('GET', $countEndpoint);
            $count = $countResult['raw'] ? count(json_decode($countResult['raw'], true)) : 0;

            sendResponse([
                'transactions' => $result['data'] ?? [],
                'count' => $count,
                'limit' => $limit,
                'offset' => $offset
            ]);

        case 'get':
            if ($method !== 'GET') {
                sendError('Method not allowed', 405);
            }

            $id = intval($_GET['id'] ?? 0);
            if ($id <= 0) {
                sendError('Invalid transaction ID', 400);
            }

            $transaction = $db->getOne('transactions', $id, $userId);
            if (!$transaction) {
                sendError('Transaction not found', 404);
            }

            sendResponse($transaction);

        case 'update':
            if (!in_array($method, ['PUT', 'PATCH'])) {
                sendError('Method not allowed', 405);
            }

            $id = intval($_GET['id'] ?? 0);
            if ($id <= 0) {
                sendError('Invalid transaction ID', 400);
            }

            // Verify transaction belongs to user
            $transaction = $db->getOne('transactions', $id, $userId);
            if (!$transaction) {
                sendError('Transaction not found', 404);
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $updateData = [];

            if (isset($input['amount'])) {
                $amount = floatval($input['amount']);
                if ($amount <= 0) {
                    sendError('Amount must be greater than 0', 400);
                }
                $updateData['amount'] = $amount;
            }

            if (isset($input['categoryId'])) {
                $categoryId = intval($input['categoryId']);
                $category = $db->getOne('categories', $categoryId, $userId);
                if (!$category) {
                    sendError('Category not found', 404);
                }
                $updateData['category_id'] = $categoryId;
            }

            if (isset($input['type'])) {
                if (!in_array($input['type'], ['income', 'expense'])) {
                    sendError('Invalid transaction type', 400);
                }
                $updateData['transaction_type'] = $input['type'];
            }

            if (isset($input['paymentMethod'])) {
                $updateData['payment_method'] = $input['paymentMethod'];
            }

            if (isset($input['date'])) {
                $updateData['transaction_date'] = $input['date'];
            }

            if (isset($input['notes'])) {
                $updateData['notes'] = $input['notes'];
            }

            if (empty($updateData)) {
                sendError('No fields to update', 400);
            }

            $db->update('transactions', $id, $updateData, $userId);

            sendResponse(['success' => true, 'message' => 'Transaction updated']);

        case 'delete':
            if ($method !== 'DELETE') {
                sendError('Method not allowed', 405);
            }

            $id = intval($_GET['id'] ?? 0);
            if ($id <= 0) {
                sendError('Invalid transaction ID', 400);
            }

            // Verify transaction belongs to user
            $transaction = $db->getOne('transactions', $id, $userId);
            if (!$transaction) {
                sendError('Transaction not found', 404);
            }

            $db->delete('transactions', $id, $userId);

            sendResponse(['success' => true, 'message' => 'Transaction deleted']);

        default:
            sendError('Invalid action', 400);
    }

} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
?>
