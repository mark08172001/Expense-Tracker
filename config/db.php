<?php
/**
 * Supabase Database Configuration
 * Handles connection and common database operations
 */

require_once __DIR__ . '/../vendor/autoload.php';

class Database {
    private static $instance = null;
    private $connection;
    private $supabaseUrl;
    private $supabaseKey;

    private function __construct() {
        $this->supabaseUrl = $_ENV['SUPABASE_URL'] ?? getenv('SUPABASE_URL');
        $this->supabaseKey = $_ENV['SUPABASE_KEY'] ?? getenv('SUPABASE_KEY');

        if (!$this->supabaseUrl || !$this->supabaseKey) {
            throw new Exception('Supabase credentials not configured');
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Make an API request to Supabase
     */
    public function request($method, $endpoint, $data = null, $userId = null) {
        $url = $this->supabaseUrl . '/rest/v1/' . $endpoint;
        
        $headers = [
            'apikey: ' . $this->supabaseKey,
            'Content-Type: application/json',
        ];

        // Add authorization header if user ID provided
        if ($userId) {
            $headers[] = 'Authorization: Bearer ' . $_SESSION['access_token'] ?? '';
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        if ($method !== 'GET' && $data !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new Exception('Curl error: ' . $error);
        }

        return [
            'code' => $httpCode,
            'data' => json_decode($response, true),
            'raw' => $response
        ];
    }

    /**
     * Get single record
     */
    public function getOne($table, $id, $userId = null) {
        $endpoint = $table . '?id=eq.' . $id;
        if ($userId) {
            $endpoint .= '&user_id=eq.' . $userId;
        }
        $result = $this->request('GET', $endpoint . '&limit=1');
        return $result['data'][0] ?? null;
    }

    /**
     * Get records with filters
     */
    public function get($table, $filters = [], $options = []) {
        $endpoint = $table;
        $queryParams = [];

        foreach ($filters as $key => $value) {
            $queryParams[] = $key . '=eq.' . urlencode($value);
        }

        if (!empty($options['order'])) {
            $queryParams[] = 'order=' . $options['order'];
        }

        if (!empty($options['limit'])) {
            $queryParams[] = 'limit=' . intval($options['limit']);
        }

        if (!empty($options['offset'])) {
            $queryParams[] = 'offset=' . intval($options['offset']);
        }

        if (!empty($queryParams)) {
            $endpoint .= '?' . implode('&', $queryParams);
        }

        $result = $this->request('GET', $endpoint);
        return $result['data'] ?? [];
    }

    /**
     * Insert record
     */
    public function insert($table, $data) {
        $result = $this->request('POST', $table, [$data]);
        if ($result['code'] === 201) {
            return $result['data'][0] ?? $data;
        }
        throw new Exception('Insert failed: ' . json_encode($result['data']));
    }

    /**
     * Update record
     */
    public function update($table, $id, $data, $userId = null) {
        $endpoint = $table . '?id=eq.' . $id;
        if ($userId) {
            $endpoint .= '&user_id=eq.' . $userId;
        }
        $result = $this->request('PATCH', $endpoint, $data);
        if (in_array($result['code'], [200, 204])) {
            return true;
        }
        throw new Exception('Update failed: ' . json_encode($result['data']));
    }

    /**
     * Delete record
     */
    public function delete($table, $id, $userId = null) {
        $endpoint = $table . '?id=eq.' . $id;
        if ($userId) {
            $endpoint .= '&user_id=eq.' . $userId;
        }
        $result = $this->request('DELETE', $endpoint);
        if (in_array($result['code'], [200, 204])) {
            return true;
        }
        throw new Exception('Delete failed: ' . json_encode($result['data']));
    }
}

// Load environment variables
$dotenv = new Dotenv\Dotenv(__DIR__ . '/..');
try {
    $dotenv->load();
} catch (Exception $e) {
    // .env file not found, use server variables
}

// Initialize session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

?>
