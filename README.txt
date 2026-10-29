HOSTNEIL WEBSITE V2.0 — PHP STARTER
===================================

Features
- Hybrid dark/light-feeling premium design (dark base, bright cards and gradients)
- Responsive site navigation
- English/Bangla language toggle for core interface text
- Homepage, Hosting, VPS quote request, Pricing, Contact
- Blog with seeded sample posts and admin post creation
- Customer registration, login, dashboard, order history
- Manual payment reference submission for bKash/Nagad/bank transfer
- Admin dashboard for orders, payment verification, VPS quotes, and blog posts
- PHP session authentication and CSRF tokens
- JSON-file storage (no SQL database required)

REQUIREMENTS
- PHP 8.0+ recommended
- PHP sessions enabled
- Writable data/ directory
- Apache shared hosting is easiest; Nginx may need equivalent deny rules
- HTTPS strongly recommended/required for real customer data

INSTALL
1. Upload all files and folders to your hosting document root.
2. Open config.php and change:
   ADMIN_EMAIL
   ADMIN_PASSWORD
   SUPPORT_EMAIL
   WHATSAPP_NUMBER
   BKASH_NUMBER
   NAGAD_NUMBER
   Optional BASE_URL
3. Set data/ permissions so PHP can write store.json, while the folder remains inaccessible from the web.
4. Visit admin.php and sign in using the configured admin email/password.
5. Register a customer account via register.php to test customer dashboard.
6. Test an order, submit a payment reference, then verify/reject it in admin.php.
7. Test a VPS quote and create a blog post from admin dashboard.
8. Replace sample blog and legal text with your own.
9. Check PHP error logs after upload.

IMPORTANT SECURITY / PRODUCTION LIMITATIONS
- This is a working PHP starter, not a fully audited commercial billing platform.
- Storage uses a JSON file. Suitable only for low-volume testing/small early launch; simultaneous writes and growth can become a problem. Move to MySQL and use transactional writes before serious production use.
- Change the default admin credentials immediately. Use a long unique password.
- The current admin password is configured in config.php as plain text. For production, replace with environment secrets or a hashed secret-based login implementation and protect config.php.
- Protect the entire data/ directory using server rules. The included .htaccess works on compatible Apache configurations only; verify from a browser that /data/store.json returns 403/404. On Nginx, configure deny rules explicitly.
- Use HTTPS. Set secure cookie flags, rate limiting, login throttling, backups, audit logs, and server-side validation before accepting real customer data.
- Payment references are NOT automatically verified. An admin must check bKash/Nagad/bank transactions manually.
- No payment gateway API is integrated.
- Orders do NOT automatically provision hosting or VPS. You must provision through your upstream provider manually and update order status in admin.
- No WHM/cPanel/VPS provider API is connected.
- No password reset or email verification feature.
- Customer order access uses the submitted email for guest orders; customers should create an account before ordering for best dashboard tracking.
- Sample package prices and features are proposals only. Confirm upstream provider price, limits, and resale permissions.
- Legal pages are starter templates, not legal advice.
- Replace placeholders and validate all workflows before launch.

FOLDER STRUCTURE
index.php, hosting.php, vps.php, pricing.php, order.php, payment.php
register.php, login.php, logout.php, dashboard.php, admin.php
blog.php, post.php, contact.php, lang.php, terms.php, privacy.php, refund.php
config.php, includes/, assets/, data/

ADMIN LOGIN
Go to /admin.php and use the values configured in config.php.
