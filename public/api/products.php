<?php
include_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    // Basic read with JOIN shop
    $query = "SELECT p.*, s.name as shop_name FROM products p LEFT JOIN shops s ON p.shop_id = s.id LIMIT 50";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $result = array_map(function($p) {
        return [
            'id' => $p['id'],
            'name' => $p['name'],
            'sku' => $p['sku'],
            'price' => (float)$p['price'],
            'stock' => (int)$p['stock'],
            'imageUrl' => $p['image_url'],
            'status' => $p['status'],
            'platform' => $p['platform'],
            'shopName' => $p['shop_name'],
            'sales' => (int)$p['sales'],
            'lastSynced' => $p['last_synced'],
            // Mock performance data nếu database chưa có trường này
            'performance' => [
                'revenue' => (float)$p['revenue'],
                'adSpend' => (float)$p['ad_spend'],
                'roas' => (float)$p['roas'],
                'classification' => $p['classification']
            ]
        ];
    }, $products);

    echo json_encode($result);
}
?>