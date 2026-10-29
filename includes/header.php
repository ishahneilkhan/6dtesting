<?php $flash=get_flash(); $lang=$_SESSION['lang'] ?? 'en'; ?>
<!doctype html><html lang="<?= h($lang) ?>"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="HOSTNEIL web hosting and VPS services"><title><?= h($page_title ?? 'HOSTNEIL — Hosting & VPS') ?></title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="assets/style.css"></head><body>
<header class="header"><div class="wrap nav"><a class="brand" href="index.php"><span class="logo">H</span><span>HOST<span class="accent">NEIL</span><small>HOSTING · VPS · CLOUD</small></span></a>
<button class="menu" aria-label="Menu" onclick="document.querySelector('.links').classList.toggle('show')">☰</button><nav class="links">
<a href="index.php"><?= t('Home','হোম') ?></a><a href="hosting.php"><?= t('Hosting','হোস্টিং') ?></a><a href="vps.php">VPS</a><a href="pricing.php"><?= t('Pricing','মূল্য') ?></a><a href="blog.php">Blog</a><a href="contact.php"><?= t('Contact','যোগাযোগ') ?></a>
<?php if (current_user()): ?><a href="dashboard.php"><?= t('Dashboard','ড্যাশবোর্ড') ?></a><?php else: ?><a href="login.php"><?= t('Login','লগইন') ?></a><?php endif; ?>
<a href="lang.php?lang=<?= $lang==='bn'?'en':'bn' ?>" class="lang"><?= $lang==='bn'?'EN':'বাংলা' ?></a><a class="navbtn" href="order.php"><?= t('Order now','অর্ডার করুন') ?> ↗</a>
</nav></div></header>
<?php if ($flash): ?><div class="wrap"><div class="flash <?= h($flash['type']) ?>"><?= h($flash['message']) ?></div></div><?php endif; ?>
