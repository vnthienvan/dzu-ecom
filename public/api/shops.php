<?php
include_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Lấy danh sách shop
        $query = "SELECT * FROM shops ORDER BY created_at DESC";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $shops = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Chuyển đổi keys sang camelCase cho Frontend React
        $result = array_map(function($shop) {
            return [
                'id' => $shop['id'],
                'name' => $shop['name'],
                'platform' => $shop['platform'],
                'accountName' => $shop['account_name'],
                'status' => $shop['status'],
                'productCount' => $shop['product_count'],
                'violationReason' => $shop['violation_reason']
            ];
        }, $shops);

        echo json_encode($result);
        break;

    case 'POST':
        // Tạo shop mới
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->name) && !empty($data->platform)) {
            $query = "INSERT INTO shops (id, name, platform, account_name, status, product_count, agency_id) VALUES (:id, :name, :platform, :account_name, 'connected', 0, 'ag1')";
            
            $stmt = $conn->prepare($query);
            $id = uniqid('s_'); // Tạo ID ngẫu nhiên
            
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':name', $data->name);
            $stmt->bindParam(':platform', $data->platform);
            $stmt->bindParam(':account_name', $data->accountName);
            
            if($stmt->execute()) {
                http_response_code(201);
                echo json_encode(["message" => "Shop created.", "id" => $id]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to create shop."]);
            }
        }
        break;
        
    case 'DELETE':
        // Xóa shop (Lấy ID từ URL query parameter ?id=...)
        if(isset($_GET['id'])) {
            $query = "DELETE FROM shops WHERE id = ?";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(1, $_GET['id']);
            if($stmt->execute()) {
                echo json_encode(["message" => "Shop deleted."]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to delete shop."]);
            }
        }
        break;
}
?>