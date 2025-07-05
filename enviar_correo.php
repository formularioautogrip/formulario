<?php
// Configura tu correo del taller aquí
$tallerEmail = 'soportetechwootit@gmail.com';

$data = json_decode(file_get_contents('php://input'), true);

$nombre = $data['nombre'] ?? 'Cliente';
$correo_cliente = $data['correo_cliente'] ?? '';
$pdfBase64 = $data['pdfBase64'] ?? '';

if (!$correo_cliente || !$pdfBase64) {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

$decodedPDF = base64_decode($pdfBase64);
$tempPDFPath = tempnam(sys_get_temp_dir(), 'autogrip_') . '.pdf';
file_put_contents($tempPDFPath, $decodedPDF);

$boundary = md5(uniqid());
$subject = "AutoGrip - Documento de Recepción";
$message = "--$boundary\r\n";
$message .= "Content-Type: text/plain; charset=utf-8\r\n\r\n";
$message .= "Adjunto el documento de recepción del vehículo para $nombre.\r\n";
$message .= "--$boundary\r\n";
$message .= "Content-Type: application/pdf; name=\"AutoGrip_$nombre.pdf\"\r\n";
$message .= "Content-Transfer-Encoding: base64\r\n";
$message .= "Content-Disposition: attachment; filename=\"AutoGrip_$nombre.pdf\"\r\n\r\n";
$message .= chunk_split(base64_encode(file_get_contents($tempPDFPath))) . "\r\n";
$message .= "--$boundary--";

$headers = "From: AutoGrip <no-reply@autogrip.com>\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";

$to = $correo_cliente . ',' . $tallerEmail;

$sent = mail($to, $subject, $message, $headers);

unlink($tempPDFPath);

if ($sent) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al enviar el correo.']);
}
?>