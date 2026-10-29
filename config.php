<?php
declare(strict_types=1);
session_start();

/*
 * HOSTNEIL V2 configuration.
 * Change these values before deployment.
 */
define('SITE_NAME', 'HOSTNEIL');
define('ADMIN_EMAIL', 'admin@example.com'); // Change this.
define('ADMIN_PASSWORD', 'ChangeThisAdminPassword!'); // Change immediately.
define('SUPPORT_EMAIL', 'support@example.com'); // Change this.
define('WHATSAPP_NUMBER', '8801XXXXXXXXX'); // International format, digits only.
define('BKASH_NUMBER', '01XXXXXXXXX');
define('NAGAD_NUMBER', '01XXXXXXXXX');
define('CURRENCY', '৳');
define('DATA_DIR', __DIR__ . '/data');
define('DATA_FILE', DATA_DIR . '/store.json');
define('INSTALL_LOCK', DATA_DIR . '/installed.lock');
define('BASE_URL', ''); // Optional e.g. https://example.com, no trailing slash.

if (!is_dir(DATA_DIR)) { @mkdir(DATA_DIR, 0750, true); }
if (!file_exists(DATA_FILE)) {
    $seed = [
        'users' => [],
        'orders' => [],
        'payments' => [],
        'vps_quotes' => [],
        'posts' => [
            ['id'=>1,'title'=>'How to Choose a Hosting Plan','title_bn'=>'কীভাবে সঠিক হোস্টিং প্ল্যান বেছে নেবেন','slug'=>'choose-hosting-plan','excerpt'=>'A practical checklist for choosing hosting for a new website.','excerpt_bn'=>'নতুন ওয়েবসাইটের জন্য হোস্টিং বেছে নেওয়ার সহজ নির্দেশিকা।','body'=>'Start with the needs of your website. Check storage, bandwidth, email, backups, renewal pricing, and support terms before purchasing.','body_bn'=>'আপনার ওয়েবসাইটের প্রয়োজন বুঝে হোস্টিং বেছে নিন। কেনার আগে স্টোরেজ, ব্যান্ডউইথ, ইমেইল, ব্যাকআপ, নবায়ন মূল্য এবং সাপোর্টের শর্ত যাচাই করুন।','published'=>true,'created'=>date('Y-m-d')],
            ['id'=>2,'title'=>'VPS vs Shared Hosting','title_bn'=>'VPS বনাম Shared Hosting','slug'=>'vps-vs-shared-hosting','excerpt'=>'Understand when a VPS may be useful for your project.','excerpt_bn'=>'কোন পরিস্থিতিতে VPS আপনার কাজে লাগতে পারে তা জানুন।','body'=>'Shared hosting is often a simple starting point for smaller websites. A VPS can provide more control, but it usually requires more server administration knowledge.','body_bn'=>'ছোট ওয়েবসাইটের জন্য shared hosting সহজ শুরু হতে পারে। VPS বেশি নিয়ন্ত্রণ দিতে পারে, তবে সাধারণত সার্ভার পরিচালনার বেশি জ্ঞান প্রয়োজন।','published'=>true,'created'=>date('Y-m-d')]
        ],
        'next_order_id' => 1001,
        'next_payment_id' => 5001,
        'next_quote_id' => 7001
    ];
    file_put_contents(DATA_FILE, json_encode($seed, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE), LOCK_EX);
}
function store_read(): array {
    $raw = @file_get_contents(DATA_FILE);
    $data = json_decode($raw ?: '', true);
    return is_array($data) ? $data : ['users'=>[],'orders'=>[],'payments'=>[],'vps_quotes'=>[],'posts'=>[],'next_order_id'=>1001,'next_payment_id'=>5001,'next_quote_id'=>7001];
}
function store_write(array $data): bool {
    $tmp = DATA_FILE . '.tmp';
    $ok = file_put_contents($tmp, json_encode($data, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE), LOCK_EX);
    return $ok !== false && rename($tmp, DATA_FILE);
}
function h(string $s): string { return htmlspecialchars($s, ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8'); }
function csrf_token(): string {
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}
function csrf_check(): void {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $t = (string)($_POST['csrf'] ?? '');
        if (!$t || !hash_equals((string)($_SESSION['csrf'] ?? ''), $t)) {
            http_response_code(403); exit('Invalid form token. Please go back and try again.');
        }
    }
}
function is_admin(): bool { return !empty($_SESSION['is_admin']); }
function current_user(): ?array {
    if (empty($_SESSION['user_email'])) return null;
    foreach (store_read()['users'] as $u) if (($u['email'] ?? '') === $_SESSION['user_email']) return $u;
    return null;
}
function require_admin(): void { if (!is_admin()) { header('Location: admin.php'); exit; } }
function require_user(): array {
    $u=current_user(); if (!$u) { header('Location: login.php'); exit; } return $u;
}
function redirect(string $url): never { header('Location: '.$url); exit; }
function flash(string $message, string $type='success'): void { $_SESSION['flash']=['message'=>$message,'type'=>$type]; }
function get_flash(): ?array { $f=$_SESSION['flash'] ?? null; unset($_SESSION['flash']); return $f; }
function t(string $en, string $bn): string { return (($_SESSION['lang'] ?? 'en') === 'bn') ? $bn : $en; }
function money($n): string { return CURRENCY . number_format((float)$n, 0); }
