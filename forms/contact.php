<?php
/**
 * Requires the "PHP Email Form" library
 * The "PHP Email Form" library is available only in the pro version of the template
 * The library should be uploaded to: vendor/php-email-form/php-email-form.php
 * For more info and help: https://bootstrapmade.com/php-email-form/
 */

// Replace contact@example.com with your real receiving email address
$receiving_email_address = 'shreeharshjadhav79@gmail.com';

// Ensure the library file exists
if (file_exists($php_email_form = '../assets/vendor/php-email-form/php-email-form.php')) {
    include($php_email_form);
} else {
    http_response_code(500); // Internal Server Error
    die('Unable to load the "PHP Email Form" Library!');
}

// Initialize PHP Email Form instance
$contact = new PHP_Email_Form;
$contact->ajax = true;

// Sanitize and validate input data
$name = filter_var($_POST['name'], FILTER_SANITIZE_STRING);
$email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
$subject = filter_var($_POST['subject'], FILTER_SANITIZE_STRING);
$message = filter_var($_POST['message'], FILTER_SANITIZE_STRING);

// Validate email address
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400); // Bad Request
    echo 'Invalid email format';
    exit;
}

// Configure email settings
$contact->to = $receiving_email_address;
$contact->from_name = $name;
$contact->from_email = $email;
$contact->subject = $subject;

// Uncomment below code if you want to use SMTP to send emails. You need to enter your correct SMTP credentials
/*
$contact->smtp = array(
    'host' => 'smtp.example.com',
    'username' => 'your_username',
    'password' => 'your_password',
    'port' => '587'
);
*/

$contact->add_message($name, 'From');
$contact->add_message($email, 'Email');
$contact->add_message($message, 'Message', 10);

// Send email and handle response
$result = $contact->send();
if ($result) {
    echo 'Email sent successfully!';
} else {
    http_response_code(500); // Internal Server Error
    echo 'Failed to send email.';
    // Optionally log error details here
    error_log("Email sending failed: " . $contact->get_error());
}
?>
