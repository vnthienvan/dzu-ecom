<?php
include_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->email) && !empty($data->password)) {
    $table_name = 'users';
    $query = "SELECT id, username, email, password_hash, role, agency_id FROM " . $table_name . " WHERE email = ? LIMIT 0,1";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(1, $data->email);
    $stmt->execute();

    if($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Trong thực tế, dùng: if(password_verify($data->password, $row['password_hash']))
        // Ở đây demo so sánh trực tiếp hoặc giả lập verify thành công nếu pass đúng quy tắc
        if($data->password === 'admin123' || password_verify($data->password, $row['password_hash'])) {
            
            // Lấy thông tin Agency
            $agency_query = "SELECT name, tier FROM agencies WHERE id = ?";
            $agency_stmt = $conn->prepare($agency_query);
            $agency_stmt->bindParam(1, $row['agency_id']);
            $agency_stmt->execute();
            $agency = $agency_stmt->fetch(PDO::FETCH_ASSOC);

            http_response_code(200);
            echo json_encode([
                "message" => "Login successful.",
                "user" => [
                    "id" => $row['id'],
                    "username" => $row['username'],
                    "email" => $row['email'],
                    "role" => $row['role'],
                    "agencyId" => $row['agency_id'],
                    "agencyName" => $agency['name'] ?? 'Unknown'
                ],
                "token" => bin2hex(random_bytes(16)) // Giả lập token
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Sai mật khẩu."]);
        }
    } else {
        http_response_code(401);
        echo json_encode(["message" => "Email không tồn tại."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Thiếu dữ liệu đăng nhập."]);
}
?>