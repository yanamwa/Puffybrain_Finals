<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once __DIR__ . "/db.php";

if (!isset($conn)) {
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed"
    ]);
    exit;
}

$result = $conn->query("SELECT ModuleID, Title, DateCreated, Status FROM modules ORDER BY DateCreated DESC");

$modules = [];

while ($row = $result->fetch_assoc()) {
    $modules[] = [
        "id" => $row["ModuleID"],
        "title" => $row["Title"],
        "date" => $row["DateCreated"],
        "status" => $row["Status"]
    ];
}

echo json_encode([
    "success" => true,
    "modules" => $modules
]);