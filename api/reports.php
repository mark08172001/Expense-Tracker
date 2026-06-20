<?php
/**
 * Reports API
 * Handles generating financial reports and analytics
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    $db = Database::getInstance();
    $userId = requireAuth();

    if ($method !== 'GET') {
        sendError('Method not allowed', 405);
    }

    switch ($action) {
        case 'dashboard':
            $month = $_GET['month'] ?? date('Y-m');
            $year = $_GET['year'] ?? date('Y');
            $startOfMonth = $month . '-01';
            $endOfMonth = date('Y-m-t', strtotime($startOfMonth));

            // Get all transactions for the month
            $endpoint = 'transactions?user_id=eq.' . $userId;
            $endpoint .= '&transaction_date=gte.' . urlencode($startOfMonth);
            $endpoint .= '&transaction_date=lte.' . urlencode($endOfMonth);
            $endpoint .= '&order=transaction_date.desc';

            $result = $db->request('GET', $endpoint);
            $transactions = $result['data'] ?? [];

            // Calculate totals
            $totalIncome = 0;
            $totalExpenses = 0;
            $spendingByCategory = [];

            foreach ($transactions as $transaction) {
                if ($transaction['transaction_type'] === 'income') {
                    $totalIncome += $transaction['amount'];
                } else {
                    $totalExpenses += $transaction['amount'];
                }

                // Group by category
                $catId = $transaction['category_id'];
                if (!isset($spendingByCategory[$catId])) {
                    $spendingByCategory[$catId] = [
                        'categoryId' => $catId,
                        'amount' => 0
                    ];
                }
                $spendingByCategory[$catId]['amount'] += $transaction['amount'];
            }

            // Get categories for labels
            $endpoint = 'categories?user_id=eq.' . $userId;
            $catResult = $db->request('GET', $endpoint);
            $categories = [];
            foreach ($catResult['data'] ?? [] as $cat) {
                $categories[$cat['id']] = $cat;
            }

            // Add category names
            foreach ($spendingByCategory as &$item) {
                $item['category'] = $categories[$item['categoryId']] ?? ['name' => 'Unknown'];
            }

            $monthlyBalance = $totalIncome - $totalExpenses;

            sendResponse([
                'month' => $month,
                'totalIncome' => $totalIncome,
                'totalExpenses' => $totalExpenses,
                'monthlyBalance' => $monthlyBalance,
                'recentTransactions' => array_slice($transactions, 0, 5),
                'spendingByCategory' => array_values($spendingByCategory),
                'transactionCount' => count($transactions)
            ]);

        case 'monthly':
            $year = intval($_GET['year'] ?? date('Y'));
            
            $monthlyData = [];

            for ($month = 1; $month <= 12; $month++) {
                $monthStr = sprintf('%04d-%02d', $year, $month);
                $startDate = $monthStr . '-01';
                $endDate = date('Y-m-t', strtotime($startDate));

                $endpoint = 'transactions?user_id=eq.' . $userId;
                $endpoint .= '&transaction_date=gte.' . urlencode($startDate);
                $endpoint .= '&transaction_date=lte.' . urlencode($endDate);

                $result = $db->request('GET', $endpoint);
                $transactions = $result['data'] ?? [];

                $income = 0;
                $expenses = 0;

                foreach ($transactions as $trans) {
                    if ($trans['transaction_type'] === 'income') {
                        $income += $trans['amount'];
                    } else {
                        $expenses += $trans['amount'];
                    }
                }

                $monthlyData[] = [
                    'month' => $monthStr,
                    'monthLabel' => date('M', strtotime($startDate)),
                    'income' => $income,
                    'expenses' => $expenses,
                    'balance' => $income - $expenses
                ];
            }

            sendResponse([
                'year' => $year,
                'data' => $monthlyData
            ]);

        case 'yearly':
            $startYear = intval($_GET['startYear'] ?? date('Y') - 2);
            $endYear = intval($_GET['endYear'] ?? date('Y'));

            $yearlyData = [];

            for ($year = $startYear; $year <= $endYear; $year++) {
                $startDate = $year . '-01-01';
                $endDate = $year . '-12-31';

                $endpoint = 'transactions?user_id=eq.' . $userId;
                $endpoint .= '&transaction_date=gte.' . urlencode($startDate);
                $endpoint .= '&transaction_date=lte.' . urlencode($endDate);

                $result = $db->request('GET', $endpoint);
                $transactions = $result['data'] ?? [];

                $income = 0;
                $expenses = 0;

                foreach ($transactions as $trans) {
                    if ($trans['transaction_type'] === 'income') {
                        $income += $trans['amount'];
                    } else {
                        $expenses += $trans['amount'];
                    }
                }

                $yearlyData[] = [
                    'year' => $year,
                    'income' => $income,
                    'expenses' => $expenses,
                    'balance' => $income - $expenses
                ];
            }

            sendResponse([
                'data' => $yearlyData
            ]);

        case 'category-trends':
            $month = $_GET['month'] ?? date('Y-m');
            $categoryId = intval($_GET['categoryId'] ?? 0);

            if ($categoryId <= 0) {
                sendError('Category ID required', 400);
            }

            // Get last 12 months of data for this category
            $trends = [];
            $today = new DateTime($month . '-01');

            for ($i = 0; $i < 12; $i++) {
                $currentMonth = $today->format('Y-m');
                $startDate = $currentMonth . '-01';
                $endDate = date('Y-m-t', strtotime($startDate));

                $endpoint = 'transactions?user_id=eq.' . $userId;
                $endpoint .= '&category_id=eq.' . $categoryId;
                $endpoint .= '&transaction_date=gte.' . urlencode($startDate);
                $endpoint .= '&transaction_date=lte.' . urlencode($endDate);

                $result = $db->request('GET', $endpoint);
                $transactions = $result['data'] ?? [];

                $amount = 0;
                foreach ($transactions as $trans) {
                    $amount += $trans['amount'];
                }

                $trends[] = [
                    'month' => $currentMonth,
                    'monthLabel' => $today->format('M'),
                    'amount' => $amount
                ];

                $today->modify('-1 month');
            }

            $trends = array_reverse($trends);

            sendResponse([
                'categoryId' => $categoryId,
                'trends' => $trends
            ]);

        default:
            sendError('Invalid action', 400);
    }

} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
?>
