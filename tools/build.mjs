// HOSTNEIL static site generator. Run: node tools/build.mjs  (no dependencies)
// Writes bn pages at repo root and en pages under /en. Commit the generated files.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const TAG = 'Your Website. Our Priority.';
const DISC = {
  en: 'HOSTNEIL resells web hosting provided by third-party upstream providers. HOSTNEIL does not own data centers.',
  bn: 'HOSTNEIL তৃতীয় পক্ষের আপস্ট্রিম প্রোভাইডারের ওয়েব হোস্টিং রিসেল করে। HOSTNEIL-এর নিজস্ব কোনো ডেটা সেন্টার নেই।',
};
const ic = {
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  theme: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 13.2A8.5 8.5 0 1 1 10.8 3a6.7 6.7 0 0 0 10.2 10.2z"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.500-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
};
// H mark: two bars + slanted crossbar (brand logo, simplified)
const H = '<svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="11" height="36" rx="1.500"/><rect x="31" y="6" width="11" height="36" rx="1.500"/><path d="M17 20.500l14-4.500v11.500l-14 4.500z"/></svg>';

const S = {
  en: {
    nav: { '': 'Home', 'web-hosting': 'Web Hosting', pricing: 'Pricing', faq: 'FAQ', contact: 'Contact' },
    order: 'Order now', status: 'Check order', langLabel: 'বাংলা', home_t: 'HOSTNEIL — Web hosting set up for you',
    home_d: 'Choose a package, pay with bKash, Nagad or bank transfer, and we set up your hosting after your payment is verified.',
    h1a: 'Hosting that is', h1b: 'set up for you.',
    lead: 'Pick a package, pay by bKash, Nagad or bank transfer, and we set up your hosting once your payment is verified. Your login details reach you privately.',
    see: 'See pricing', how_h: 'How ordering works', how_p: 'Four simple steps. Nothing is activated before your payment is checked.',
    steps: [['Choose a package', 'See prices in ৳ and what each package includes.'], ['Place your order', 'Enter your name, mobile number and your domain if you already have one.'], ['Pay and send the transaction ID', 'Use bKash, Nagad or bank transfer, then send us the transaction ID.'], ['We verify, then set up', 'We check the transaction ID and amount first. Your hosting is set up only after that.']],
    why_h: 'Straight answers', why: [['Every payment is checked by a person', 'No order is marked paid until we verify the transaction ID and the amount.'], ['Login details are sent privately', 'We never ask you to type a password on this website. Your details come to you in a separate private message.'], ['We are a reseller, and we say so', DISC.en]],
    pr_h: 'Packages', pr_p: 'Prices are in BDT per year. What each package includes is confirmed with our provider and shown here.',
    faq_h: 'Common questions', all_faq: 'All questions', cta_h: 'Ready to start?', cta_p: 'Place an order, or message us if you have a question first.',
    hosting_t: 'Web Hosting', hosting_p: 'Shared web hosting for websites, set up for you.',
    hosting_b: ['<h2>What you get</h2><p>Web hosting for your website from a package you choose. What each package contains (storage, number of websites, bandwidth and so on) is listed on the Pricing page exactly as confirmed with our provider.</p><h2>What we need from you</h2><ul><li>Your name and mobile number.</li><li>Your domain name, if you already have one. We do not sell or register domains.</li></ul><h2>How setup works</h2><p>After we verify your payment we create your hosting account and send your login details to you in a private message. We do not show login details on this website.</p><h2>Who provides the hosting</h2><p>' + DISC.en + '</p>'],
    pricing_t: 'Pricing', pricing_p: 'Prices in BDT. Check the Refund Policy before you order.',
    about_t: 'About', about_b: '<p>HOSTNEIL is a small web hosting reseller in Bangladesh, run by its owner.</p><p>' + DISC.en + '</p><p>Orders are handled by hand: we verify each payment ourselves before any hosting is set up.</p>',
    faq_t: 'Frequently asked questions',
    faq: [['How do I order?', 'Open the Order page, pick a package and fill in your details. You will then see the payment instructions.'], ['How do I pay?', 'You can pay by bKash, Nagad or bank transfer. After paying, send us the transaction ID, the sender number and the amount.'], ['How will I know my payment was received?', 'Use Check order with your Order ID and the phone or email you used. The status changes after we verify your payment.'], ['How do I get my login details?', 'We send them to you privately, by WhatsApp or email, after setup. Please never share them in public.'], ['How does renewal work?', 'We remind you before your hosting expires. You pay in the same way, and we extend your hosting after we verify the payment.'], ['What is your refund policy?', 'Please read the Refund Policy page before ordering.'], ['Who provides the hosting?', DISC.en], ['How can I contact support?', 'Use the Contact page or message us on WhatsApp.']],
    contact_t: 'Contact', contact_p: 'Send us a message. We reply on the phone number or email you give.',
    f_name: 'Full name', f_phone: 'Mobile number', f_phone_h: 'Bangladesh mobile number, for example 01XXXXXXXXX', f_email: 'Email (optional)', f_domain: 'Your domain (optional)', f_domain_h: 'If you already have one, for example example.com', f_note: 'Note (optional)', f_pk: 'Package',
    f_contact: 'Phone or email', f_msg: 'Message', send: 'Send message', nopw: 'Never write passwords or login details here.',
    consent: 'I have read the <a href="{terms}" target="_blank" rel="noopener">Terms of Service</a> and <a href="{refund}" target="_blank" rel="noopener">Refund Policy</a>.',
    place: 'Place order', order_t: 'Order hosting', order_p: 'Fill in your details. You will see the payment instructions next.',
    status_t: 'Check your order', status_p: 'Enter your Order ID and the phone number or email you used for the order.', f_code: 'Order ID', f_code_h: 'Looks like HN-XXXXXXXX', check: 'Check status',
    legal_draft: 'Draft text. The owner must review it before launch.', updated: 'Terms version',
    terms_t: 'Terms of Service', privacy_t: 'Privacy Policy', refund_t: 'Refund Policy',
    terms: ['HOSTNEIL resells web hosting provided by third-party upstream providers.', 'Orders are handled manually. An order becomes active only after we verify the payment (transaction ID and amount).', 'Hosting is set up after payment verification. Login details are sent privately.', 'Each package includes what is listed on the Pricing page. Limits are set by the package.', 'Renewals are paid in the same way. We remind you before expiry but you are responsible for renewing on time.', 'Do not use hosting for illegal content or abuse. Services may be suspended or cancelled for violations.'],
    privacy: ['We collect: your name, mobile number, optional email, optional domain name, optional note, and payment details you submit (method, transaction ID, sender number, amount).', 'We use this only to process your order, verify payments, set up and renew your hosting, and reply to you.', 'We do not store hosting passwords. We do not run advertising trackers.', 'Your data is kept for as long as needed for orders, payments and legal record keeping.', 'To ask us to correct or delete your personal data, contact us. Financial records may need to be kept.'],
    refund: ['The owner will write the exact refund terms here before launch.', 'Refund decisions are recorded for each order.'],
    ph: 'Draft',
    i: { copied: 'Copied', pk_empty: 'Packages are being updated. Message us for the current offer.', pk_nofeat: 'Package details (storage, websites, bandwidth) are being confirmed with our provider. Message us for the current details.', pk_err: 'Could not load packages. Please try again.', per_year: '/ year', months: 'months', choose: 'Choose', select_pk: 'Select a package', v_req: 'This field is required.', v_phone: 'Enter a valid Bangladesh mobile number.', v_email: 'Enter a valid email.', v_consent: 'Please accept to continue.', v_trx: 'Enter the transaction ID (letters and numbers, 6 or more).', v_contact: 'Enter a valid phone number or email.', order_sent: 'Thank you.', order_wa: 'Online ordering is not connected yet. Send your order on WhatsApp:', order_closed: 'Online ordering is not open yet. Please check back soon.', wa_hello: 'Hello HOSTNEIL', wa_order: 'Hello HOSTNEIL, I want to order {pkg} {price}. Name: {name}, phone: {phone}, domain: {domain}', wa_pay: 'Order {code}: I paid by {m}. Transaction ID {trx}, amount ৳{amt}, sender {sender}.', e_INTERNAL: 'Something went wrong on our side. Please try again.', e_NET: 'Network problem. Check your connection and try again.', e_VALIDATION_FAILED: 'Please fix the highlighted fields.', e_CAPTCHA_FAILED: 'Verification failed. Please try again.', e_RATE_LIMITED: 'Too many attempts. Please try again later.', e_NOT_FOUND_OR_MISMATCH: "We couldn't find an order with these details.", e_PACKAGE_UNAVAILABLE: 'This package is no longer available.', e_DUPLICATE_PENDING_ORDER: 'You already have an unpaid order for this package.', e_DUPLICATE_TRX: 'This transaction ID was already submitted.', e_ORDER_NOT_PAYABLE: 'This order is no longer waiting for payment.', copy: 'Copy', number: 'Number', bank: 'Bank transfer', bank_name: 'Bank', acc_name: 'Account name', acc_no: 'Account number', branch: 'Branch', order_received: 'Order received', order_id: 'Order ID', total: 'Total', not_active: 'Your order is not active until we verify your payment.', pay_h: 'Payment instructions', pay_note: 'Send exactly {total}. Keep the transaction ID.', pay_none: 'Payment details are not available yet. Please message us.', paid_h: 'I have paid', method: 'Payment method', trx: 'Transaction ID', sender: 'Sender number / account', amount: 'Amount paid (৳)', submit_pay: 'Submit payment details', pay_done: 'Payment details received. We will verify the transaction ID and amount, then update your order.', check_status: 'Check order status', status_soon: 'Order status check opens when the online system is connected. Please message us for now.', domain: 'Domain', covered: 'Covered until', days_left: 'days left', msg_sent: 'Message sent. We will reply on the phone or email you gave.',
      s_pending_payment: 'Waiting for your payment', s_payment_submitted: 'Payment received — we are verifying it', s_payment_rejected: 'We could not verify your payment', s_paid: 'Payment verified — we are setting up your hosting', s_provisioned: 'Hosting created — login details are being sent to you privately', s_active: 'Active', s_expiring: 'Expiring soon', s_expired: 'Expired', s_cancelled: 'Order cancelled', s_refunded: 'Order refunded' },
  },
  bn: {
    nav: { '': 'হোম', 'web-hosting': 'ওয়েব হোস্টিং', pricing: 'প্যাকেজ ও মূল্য', faq: 'প্রশ্নোত্তর', contact: 'যোগাযোগ' },
    order: 'অর্ডার করুন', status: 'অর্ডার স্ট্যাটাস', langLabel: 'EN', home_t: 'HOSTNEIL — আপনার জন্য সেটআপ করা ওয়েব হোস্টিং',
    home_d: 'প্যাকেজ বেছে নিন, bKash, Nagad বা ব্যাংক ট্রান্সফারে পেমেন্ট করুন। পেমেন্ট যাচাইয়ের পর আমরা হোস্টিং সেটআপ করে দিই।',
    h1a: 'আপনার ওয়েবসাইটের হোস্টিং,', h1b: 'আমরাই সেটআপ করে দিই।',
    lead: 'প্যাকেজ বেছে নিন, bKash, Nagad বা ব্যাংক ট্রান্সফারে পেমেন্ট করুন। পেমেন্ট যাচাই হলে আমরা হোস্টিং সেটআপ করে আপনার লগইন তথ্য আলাদাভাবে পাঠিয়ে দেব।',
    see: 'প্যাকেজ ও মূল্য দেখুন', how_h: 'অর্ডারের ধাপ', how_p: 'চারটি সহজ ধাপ। পেমেন্ট যাচাইয়ের আগে কিছুই চালু হয় না।',
    steps: [['প্যাকেজ বেছে নিন', '৳-তে মূল্য ও প্যাকেজে কী আছে দেখুন।'], ['অর্ডার করুন', 'আপনার নাম, মোবাইল নম্বর এবং ডোমেইন (থাকলে) দিন।'], ['পেমেন্ট করে ট্রানজ্যাকশন আইডি দিন', 'bKash, Nagad বা ব্যাংক ট্রান্সফারে পেমেন্ট করে আমাদের ট্রানজ্যাকশন আইডি জানান।'], ['যাচাইয়ের পর সেটআপ', 'আগে আমরা ট্রানজ্যাকশন আইডি ও পরিমাণ যাচাই করি। তারপরই হোস্টিং সেটআপ হয়।']],
    why_h: 'সরাসরি কথা', why: [['প্রতিটি পেমেন্ট মানুষ যাচাই করে', 'ট্রানজ্যাকশন আইডি ও পরিমাণ যাচাই না হওয়া পর্যন্ত কোনো অর্ডার “পরিশোধিত” হয় না।'], ['লগইন তথ্য আলাদাভাবে পাঠানো হয়', 'এই ওয়েবসাইটে পাসওয়ার্ড লিখতে আমরা কখনো বলি না। আপনার তথ্য আলাদা ব্যক্তিগত বার্তায় আসবে।'], ['আমরা রিসেলার, এটা স্পষ্ট করেই বলছি', DISC.bn]],
    pr_h: 'প্যাকেজ', pr_p: 'মূল্য বাংলাদেশি টাকায়, প্রতি বছরের জন্য। প্যাকেজে কী আছে তা আমাদের প্রোভাইডারের সাথে নিশ্চিত করে এখানে দেখানো হয়।',
    faq_h: 'সাধারণ প্রশ্ন', all_faq: 'সব প্রশ্ন', cta_h: 'শুরু করতে প্রস্তুত?', cta_p: 'অর্ডার করুন, অথবা আগে কিছু জানার থাকলে মেসেজ করুন।',
    hosting_t: 'ওয়েব হোস্টিং', hosting_p: 'ওয়েবসাইটের জন্য শেয়ার্ড ওয়েব হোস্টিং, আপনার জন্য সেটআপ করা।',
    hosting_b: ['<h2>আপনি কী পাবেন</h2><p>আপনার বেছে নেওয়া প্যাকেজ অনুযায়ী ওয়েবসাইটের জন্য ওয়েব হোস্টিং। প্রতিটি প্যাকেজে কী আছে (স্টোরেজ, ওয়েবসাইট সংখ্যা, ব্যান্ডউইথ ইত্যাদি) আমাদের প্রোভাইডারের সাথে নিশ্চিত করে মূল্য পাতায় ঠিক সেভাবেই দেখানো হয়।</p><h2>আপনার কাছ থেকে যা লাগবে</h2><ul><li>আপনার নাম ও মোবাইল নম্বর।</li><li>আপনার ডোমেইন নাম, যদি আগে থেকে থাকে। আমরা ডোমেইন বিক্রি বা রেজিস্টার করি না।</li></ul><h2>সেটআপ কীভাবে হয়</h2><p>পেমেন্ট যাচাইয়ের পর আমরা আপনার হোস্টিং অ্যাকাউন্ট তৈরি করে লগইন তথ্য আপনাকে আলাদা ব্যক্তিগত বার্তায় পাঠাই। লগইন তথ্য এই ওয়েবসাইটে দেখানো হয় না।</p><h2>হোস্টিং কারা দেয়</h2><p>' + DISC.bn + '</p>'],
    pricing_t: 'প্যাকেজ ও মূল্য', pricing_p: 'মূল্য টাকায়। অর্ডারের আগে রিফান্ড নীতি পড়ে নিন।',
    about_t: 'আমাদের সম্পর্কে', about_b: '<p>HOSTNEIL বাংলাদেশের একটি ছোট ওয়েব হোস্টিং রিসেলার, যেটি মালিক নিজে চালান।</p><p>' + DISC.bn + '</p><p>অর্ডার হাতে হাতে সামলানো হয়: হোস্টিং সেটআপের আগে প্রতিটি পেমেন্ট আমরা নিজে যাচাই করি।</p>',
    faq_t: 'সাধারণ জিজ্ঞাসা',
    faq: [['কীভাবে অর্ডার করব?', 'অর্ডার পাতায় গিয়ে প্যাকেজ বেছে আপনার তথ্য দিন। এরপর পেমেন্টের নির্দেশনা দেখতে পাবেন।'], ['কীভাবে পেমেন্ট করব?', 'bKash, Nagad বা ব্যাংক ট্রান্সফারে পেমেন্ট করা যায়। পেমেন্টের পর ট্রানজ্যাকশন আইডি, প্রেরকের নম্বর ও পরিমাণ আমাদের জানান।'], ['পেমেন্ট পেয়েছি কিনা কীভাবে বুঝব?', 'অর্ডার আইডি এবং অর্ডারে দেওয়া ফোন বা ইমেইল দিয়ে অর্ডার স্ট্যাটাস দেখুন। পেমেন্ট যাচাইয়ের পর স্ট্যাটাস বদলায়।'], ['লগইন তথ্য কীভাবে পাব?', 'সেটআপের পর হোয়াটসঅ্যাপ বা ইমেইলে আলাদাভাবে পাঠানো হয়। এগুলো কখনো প্রকাশ্যে শেয়ার করবেন না।'], ['নবায়ন কীভাবে হয়?', 'মেয়াদ শেষের আগে আমরা মনে করিয়ে দিই। একইভাবে পেমেন্ট করলে এবং যাচাই হলে মেয়াদ বাড়ানো হয়।'], ['রিফান্ড নীতি কী?', 'অর্ডারের আগে রিফান্ড নীতি পাতাটি পড়ে নিন।'], ['হোস্টিং কারা দেয়?', DISC.bn], ['সাপোর্টে কীভাবে যোগাযোগ করব?', 'যোগাযোগ পাতা ব্যবহার করুন অথবা হোয়াটসঅ্যাপে মেসেজ করুন।']],
    contact_t: 'যোগাযোগ', contact_p: 'আমাদের মেসেজ পাঠান। আপনার দেওয়া ফোন বা ইমেইলে উত্তর দেব।',
    f_name: 'পূর্ণ নাম', f_phone: 'মোবাইল নম্বর', f_phone_h: 'বাংলাদেশি মোবাইল নম্বর, যেমন 01XXXXXXXXX', f_email: 'ইমেইল (ঐচ্ছিক)', f_domain: 'আপনার ডোমেইন (ঐচ্ছিক)', f_domain_h: 'আগে থেকে থাকলে, যেমন example.com', f_note: 'নোট (ঐচ্ছিক)', f_pk: 'প্যাকেজ',
    f_contact: 'ফোন বা ইমেইল', f_msg: 'বার্তা', send: 'বার্তা পাঠান', nopw: 'কখনো পাসওয়ার্ড বা লগইন তথ্য এখানে লিখবেন না।',
    consent: 'আমি <a href="{terms}" target="_blank" rel="noopener">সেবার শর্তাবলী</a> ও <a href="{refund}" target="_blank" rel="noopener">রিফান্ড নীতি</a> পড়েছি।',
    place: 'অর্ডার করুন', order_t: 'হোস্টিং অর্ডার', order_p: 'আপনার তথ্য দিন। এরপর পেমেন্টের নির্দেশনা দেখতে পাবেন।',
    status_t: 'আপনার অর্ডার দেখুন', status_p: 'অর্ডার আইডি এবং অর্ডারে ব্যবহৃত ফোন নম্বর বা ইমেইল দিন।', f_code: 'অর্ডার আইডি', f_code_h: 'দেখতে HN-XXXXXXXX এর মতো', check: 'স্ট্যাটাস দেখুন',
    legal_draft: 'খসড়া লেখা। চালুর আগে মালিককে যাচাই করতে হবে।', updated: 'শর্তাবলীর সংস্করণ',
    terms_t: 'সেবার শর্তাবলী', privacy_t: 'গোপনীয়তা নীতি', refund_t: 'রিফান্ড নীতি',
    terms: ['HOSTNEIL তৃতীয় পক্ষের আপস্ট্রিম প্রোভাইডারের ওয়েব হোস্টিং রিসেল করে।', 'অর্ডার হাতে সামলানো হয়। পেমেন্ট (ট্রানজ্যাকশন আইডি ও পরিমাণ) যাচাইয়ের পরই অর্ডার সক্রিয় হয়।', 'পেমেন্ট যাচাইয়ের পর হোস্টিং সেটআপ হয়। লগইন তথ্য আলাদাভাবে পাঠানো হয়।', 'প্রতিটি প্যাকেজে মূল্য পাতায় যা তালিকাভুক্ত আছে তা-ই থাকে। সীমা প্যাকেজ অনুযায়ী নির্ধারিত।', 'নবায়নের পেমেন্টও একইভাবে হয়। মেয়াদ শেষের আগে আমরা মনে করিয়ে দিই, তবে সময়মতো নবায়নের দায়িত্ব আপনার।', 'অবৈধ কনটেন্ট বা অপব্যবহারে হোস্টিং ব্যবহার করা যাবে না। লঙ্ঘনে সেবা স্থগিত বা বাতিল হতে পারে।'],
    privacy: ['আমরা যা সংগ্রহ করি: আপনার নাম, মোবাইল নম্বর, ঐচ্ছিক ইমেইল, ঐচ্ছিক ডোমেইন নাম, ঐচ্ছিক নোট এবং আপনার দেওয়া পেমেন্টের তথ্য (মাধ্যম, ট্রানজ্যাকশন আইডি, প্রেরকের নম্বর, পরিমাণ)।', 'এগুলো শুধু অর্ডার প্রসেস, পেমেন্ট যাচাই, হোস্টিং সেটআপ ও নবায়ন এবং আপনাকে উত্তর দিতে ব্যবহার করি।', 'আমরা হোস্টিংয়ের পাসওয়ার্ড সংরক্ষণ করি না। বিজ্ঞাপনের ট্র্যাকার চালাই না।', 'অর্ডার, পেমেন্ট ও আইনি রেকর্ডের প্রয়োজনে যতদিন লাগে ততদিন তথ্য রাখা হয়।', 'ব্যক্তিগত তথ্য সংশোধন বা মুছে ফেলতে চাইলে আমাদের জানান। আর্থিক রেকর্ড রাখা বাধ্যতামূলক হতে পারে।'],
    refund: ['চালুর আগে মালিক এখানে রিফান্ডের নির্দিষ্ট শর্ত লিখবেন।', 'প্রতিটি অর্ডারের রিফান্ড সিদ্ধান্ত লিপিবদ্ধ করা হয়।'],
    ph: 'খসড়া',
    i: { copied: 'কপি হয়েছে', pk_empty: 'প্যাকেজ হালনাগাদ করা হচ্ছে। বর্তমান অফারের জন্য মেসেজ করুন।', pk_nofeat: 'প্যাকেজের বিস্তারিত (স্টোরেজ, ওয়েবসাইট সংখ্যা, ব্যান্ডউইথ) প্রোভাইডারের সাথে নিশ্চিত করা হচ্ছে। বর্তমান তথ্যের জন্য মেসেজ করুন।', pk_err: 'প্যাকেজ লোড করা যায়নি। আবার চেষ্টা করুন।', per_year: '/ বছর', months: 'মাস', choose: 'বেছে নিন', select_pk: 'প্যাকেজ বেছে নিন', v_req: 'এই ঘরটি পূরণ করুন।', v_phone: 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন।', v_email: 'সঠিক ইমেইল দিন।', v_consent: 'এগিয়ে যেতে সম্মতি দিন।', v_trx: 'ট্রানজ্যাকশন আইডি দিন (অক্ষর ও সংখ্যা, কমপক্ষে ৬টি)।', v_contact: 'সঠিক ফোন নম্বর বা ইমেইল দিন।', order_sent: 'ধন্যবাদ।', order_wa: 'অনলাইন অর্ডার ব্যবস্থা এখনো যুক্ত হয়নি। আপনার অর্ডার হোয়াটসঅ্যাপে পাঠান:', order_closed: 'অনলাইন অর্ডার এখনো চালু হয়নি। একটু পরে আবার দেখুন।', wa_hello: 'হ্যালো HOSTNEIL', wa_order: 'হ্যালো HOSTNEIL, আমি {pkg} {price} অর্ডার করতে চাই। নাম: {name}, ফোন: {phone}, ডোমেইন: {domain}', wa_pay: 'অর্ডার {code}: আমি {m}-এ পেমেন্ট করেছি। ট্রানজ্যাকশন আইডি {trx}, পরিমাণ ৳{amt}, প্রেরক {sender}।', e_INTERNAL: 'আমাদের দিকে সমস্যা হয়েছে। আবার চেষ্টা করুন।', e_NET: 'নেটওয়ার্ক সমস্যা। সংযোগ দেখে আবার চেষ্টা করুন।', e_VALIDATION_FAILED: 'হাইলাইট করা ঘরগুলো ঠিক করুন।', e_CAPTCHA_FAILED: 'যাচাই ব্যর্থ হয়েছে। আবার চেষ্টা করুন।', e_RATE_LIMITED: 'অনেকবার চেষ্টা হয়েছে। একটু পরে আবার চেষ্টা করুন।', e_NOT_FOUND_OR_MISMATCH: 'এই তথ্য দিয়ে কোনো অর্ডার পাওয়া যায়নি।', e_PACKAGE_UNAVAILABLE: 'এই প্যাকেজটি আর পাওয়া যাচ্ছে না।', e_DUPLICATE_PENDING_ORDER: 'এই প্যাকেজের জন্য আপনার একটি অপরিশোধিত অর্ডার আছে।', e_DUPLICATE_TRX: 'এই ট্রানজ্যাকশন আইডি আগেই জমা দেওয়া হয়েছে।', e_ORDER_NOT_PAYABLE: 'এই অর্ডারের জন্য আর পেমেন্ট দরকার নেই।', copy: 'কপি', number: 'নম্বর', bank: 'ব্যাংক ট্রান্সফার', bank_name: 'ব্যাংক', acc_name: 'অ্যাকাউন্টের নাম', acc_no: 'অ্যাকাউন্ট নম্বর', branch: 'শাখা', order_received: 'অর্ডার পাওয়া গেছে', order_id: 'অর্ডার আইডি', total: 'মোট', not_active: 'আপনার পেমেন্ট যাচাই না হওয়া পর্যন্ত অর্ডার সক্রিয় হবে না।', pay_h: 'পেমেন্টের নির্দেশনা', pay_note: 'ঠিক {total} পাঠান। ট্রানজ্যাকশন আইডি সংরক্ষণ করুন।', pay_none: 'পেমেন্টের তথ্য এখনো পাওয়া যাচ্ছে না। অনুগ্রহ করে মেসেজ করুন।', paid_h: 'আমি পেমেন্ট করেছি', method: 'পেমেন্টের মাধ্যম', trx: 'ট্রানজ্যাকশন আইডি', sender: 'প্রেরকের নম্বর / অ্যাকাউন্ট', amount: 'পরিশোধিত পরিমাণ (৳)', submit_pay: 'পেমেন্টের তথ্য জমা দিন', pay_done: 'পেমেন্টের তথ্য পেয়েছি। আমরা ট্রানজ্যাকশন আইডি ও পরিমাণ যাচাই করে আপনার অর্ডার হালনাগাদ করব।', check_status: 'অর্ডার স্ট্যাটাস দেখুন', status_soon: 'অনলাইন সিস্টেম যুক্ত হলে অর্ডার স্ট্যাটাস দেখা যাবে। আপাতত মেসেজ করুন।', domain: 'ডোমেইন', covered: 'মেয়াদ পর্যন্ত', days_left: 'দিন বাকি', msg_sent: 'বার্তা পাঠানো হয়েছে। আপনার দেওয়া ফোন বা ইমেইলে উত্তর দেব।',
      s_pending_payment: 'আপনার পেমেন্টের অপেক্ষায়', s_payment_submitted: 'পেমেন্ট পাওয়া গেছে — যাচাই চলছে', s_payment_rejected: 'পেমেন্ট যাচাই করা যায়নি', s_paid: 'পেমেন্ট যাচাই হয়েছে — হোস্টিং সেটআপ চলছে', s_provisioned: 'হোস্টিং তৈরি হয়েছে — লগইন তথ্য আলাদাভাবে পাঠানো হচ্ছে', s_active: 'সক্রিয়', s_expiring: 'শিগগিরই মেয়াদ শেষ', s_expired: 'মেয়াদ শেষ', s_cancelled: 'অর্ডার বাতিল', s_refunded: 'অর্ডার রিফান্ড হয়েছে' },
  },
};

const PAGES = ['', 'web-hosting', 'pricing', 'order', 'order/status', 'contact', 'faq', 'about', 'terms', 'privacy', 'refund-policy'];

function build(lang, slug) {
  const d = S[lang], other = lang === 'en' ? 'bn' : 'en';
  const depth = (slug ? slug.split('/').length : 0) + (lang === 'en' ? 1 : 0);
  const base = '../'.repeat(depth);
  const href = (l, s) => (base || './') + (l === 'en' ? 'en/' : '') + (s ? s + '/' : '') ;
  const hrefFix = (l, s) => { const h = href(l, s); return h === './' + '' ? './' : h; };
  const cur = (s) => (s === slug ? ' aria-current="page"' : '');
  const nav = Object.entries(d.nav).map(([s, l]) => `<a href="${hrefFix(lang, s)}"${cur(s)}>${l}</a>`).join('');
  const title = { '': d.home_t, 'web-hosting': d.hosting_t, pricing: d.pricing_t, order: d.order_t, 'order/status': d.status_t, contact: d.contact_t, faq: d.faq_t, about: d.about_t, terms: d.terms_t, privacy: d.privacy_t, 'refund-policy': d.refund_t }[slug];
  const pageHead = (t, p) => `<div class="pagehead"><div class="wrap"><h1>${t}</h1>${p ? `<p>${p}</p>` : ''}</div></div>`;
  const pk = (mode) => `<div class="cards" data-packages data-mode="${mode}"><div class="skel"></div><div class="skel"></div><div class="skel"></div></div>`;
  const faq = (items) => `<div class="faq">${items.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>`;
  const legal = (list) => `<div class="wrap prose" style="padding-top:32px;padding-bottom:56px"><div class="alert a-warn" role="note">${d.legal_draft}</div><ul>${list.map((x) => `<li>${x}</li>`).join('')}</ul><p class="note">${d.updated}: <span class="mono">2026-10-31</span></p></div>`;
  const field = (id, label, extra = '', hint = '', type = 'text', req = '') => `<div><label for="${id}">${label}</label><input id="${id}" name="${id}" type="${type}" ${extra}>${hint ? `<div class="hint">${hint}</div>` : ''}<div class="err" data-err="${id}"></div></div>`;
  let body = '';
  if (slug === '') {
    body = `<section class="hero"><div class="mesh"></div><div class="grid"></div><div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>
<div class="wrap"><div><span class="chip"><i></i>${TAG}</span><h1>${d.h1a} <em>${d.h1b}</em></h1><p class="lead">${d.lead}</p><div class="cta"><a class="btn btn-p" href="${hrefFix(lang, 'order')}">${d.order}</a><a class="btn btn-g" href="${hrefFix(lang, 'pricing')}">${d.see}</a></div></div>
<div class="scene" aria-hidden="true"><div class="sway"><div class="stack"><div class="ring"></div>
<div class="c3d c1"><div class="dots"><i></i><i></i><i></i></div><span class="pill">yourdomain.com</span><div class="ln m"></div><div class="ln s"></div><div class="ln m"></div></div>
<div class="c3d c2"><div class="ok"><b>${ic.check}</b><span>Payment verified</span></div><div class="bar"><span></span></div></div>
<div class="c3d c3"><div class="ok"><b>${ic.check}</b><span>Hosting setup</span></div></div></div></div></div></div></section>
<section><div class="wrap"><div class="sec-h rv"><h2>${d.how_h}</h2><p>${d.how_p}</p></div><div class="cards">${d.steps.map(([h, p], i) => `<div class="card tilt rv"><div class="num">${i + 1}</div><h3>${h}</h3><p>${p}</p></div>`).join('')}</div></div></section>
<section class="alt"><div class="wrap"><div class="sec-h rv"><h2>${d.pr_h}</h2><p>${d.pr_p}</p></div>${pk('compact')}</div></section>
<section><div class="wrap"><div class="sec-h rv"><h2>${d.why_h}</h2></div><div class="cards">${d.why.map(([h, p], i) => `<div class="card tilt rv"><div class="ico">${[ic.shield, ic.lock, ic.info][i]}</div><h3>${h}</h3><p>${p}</p></div>`).join('')}</div></div></section>
<section class="alt"><div class="wrap"><div class="sec-h rv"><h2>${d.faq_h}</h2></div>${faq(d.faq.slice(0, 3))}<p><a href="${hrefFix(lang, 'faq')}">${d.all_faq} →</a></p></div></section>
<section><div class="wrap"><div class="band rv"><div><h2>${d.cta_h}</h2><p style="margin:0;opacity:.92">${d.cta_p}</p></div><div class="cta" style="margin:0"><a class="btn btn-p" href="${hrefFix(lang, 'order')}">${d.order}</a><a class="btn btn-g" href="${hrefFix(lang, 'contact')}">${d.nav.contact}</a></div></div></div></section>`;
  } else if (slug === 'web-hosting') {
    body = pageHead(d.hosting_t, d.hosting_p) + `<section><div class="wrap prose">${d.hosting_b[0]}<p><a class="btn btn-p" href="${hrefFix(lang, 'order')}">${d.order}</a></p></div></section><section class="alt"><div class="wrap">${pk('compact')}</div></section>`;
  } else if (slug === 'pricing') {
    body = pageHead(d.pricing_t, d.pricing_p) + `<section><div class="wrap">${pk('full')}<p class="note" style="margin-top:20px">${DISC[lang]}</p></div></section>`;
  } else if (slug === 'order') {
    const cons = d.consent.replace('{terms}', hrefFix(lang, 'terms')).replace('{refund}', hrefFix(lang, 'refund-policy'));
    body = pageHead(d.order_t, d.order_p) + `<section><div class="wrap"><form id="order-form" class="form" novalidate>
<div><label for="package">${d.f_pk}</label><select id="package" name="package"><option value="">…</option></select><div class="err" data-err="package"></div></div>
${field('name', d.f_name, 'autocomplete="name"')}${field('phone', d.f_phone, 'inputmode="tel" autocomplete="tel"', d.f_phone_h, 'tel')}${field('email', d.f_email, 'autocomplete="email" inputmode="email"', '', 'email')}${field('domain', d.f_domain, 'autocapitalize="none" autocorrect="off"', d.f_domain_h)}
<div><label for="note">${d.f_note}</label><textarea id="note" name="note" maxlength="300"></textarea><div class="hint">${d.nopw}</div></div>
<div class="hp" aria-hidden="true"><input name="website" tabindex="-1" autocomplete="off"></div>
<div><div class="chk"><input id="consent" name="consent" type="checkbox"><label for="consent">${cons}</label></div><div class="err" data-err="consent"></div></div>
<button class="btn btn-p" type="submit">${d.place}</button><div id="order-out"></div></form><div id="pay" hidden></div></div></section>`;
  } else if (slug === 'order/status') {
    body = pageHead(d.status_t, d.status_p) + `<section><div class="wrap"><form id="status-form" class="form" novalidate>${field('code', d.f_code, 'autocapitalize="characters" autocomplete="off"', d.f_code_h)}${field('contact', d.f_contact, 'autocomplete="off"')}<button class="btn btn-p" type="submit">${d.check}</button></form><div id="status-out" style="max-width:560px;margin-top:20px"></div></div></section>`;
  } else if (slug === 'contact') {
    body = pageHead(d.contact_t, d.contact_p) + `<section><div class="wrap"><form id="contact-form" class="form" novalidate>${field('name', d.f_name, 'autocomplete="name"')}${field('contact', d.f_contact)}<div><label for="message">${d.f_msg}</label><textarea id="message" name="message" maxlength="1500"></textarea><div class="hint">${d.nopw}</div><div class="err" data-err="message"></div></div><div class="hp" aria-hidden="true"><input name="website" tabindex="-1" autocomplete="off"></div><button class="btn btn-p" type="submit">${d.send}</button><div id="contact-out"></div></form></div></section>`;
  } else if (slug === 'faq') {
    body = pageHead(d.faq_t) + `<section><div class="wrap" style="max-width:820px">${faq(d.faq)}</div></section>`;
  } else if (slug === 'about') {
    body = pageHead(d.about_t) + `<section><div class="wrap prose">${d.about_b}</div></section>`;
  } else {
    body = pageHead(title) + legal(d[{ terms: 'terms', privacy: 'privacy', 'refund-policy': 'refund' }[slug]]);
  }

  const i18n = JSON.stringify(d.i).replace(/</g, '\\u003c');
  const lnks = [['terms', d.terms_t], ['privacy', d.privacy_t], ['refund-policy', d.refund_t]];
  const html = `<!doctype html>
<html lang="${lang}" data-base="${base}" class="">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}${slug ? ' — HOSTNEIL' : ''}</title><meta name="description" content="${(slug === '' ? d.home_d : title).replace(/"/g, '&quot;')}"><meta name="theme-color" content="#0B1B4D"><link rel="icon" href="${base}assets/favicon.svg" type="image/svg+xml"><link rel="alternate" hreflang="${other}" href="${hrefFix(other, slug)}">
<script src="${base}assets/theme-init.js"></script><link rel="stylesheet" href="${base}assets/site.css"></head>
<body><a class="skip" href="#main">Skip to content</a>
<header class="hdr"><div class="wrap"><a class="logo" href="${hrefFix(lang, '')}" aria-label="HOSTNEIL"><span class="mark">${H}</span><b>HOSTNEIL</b></a><nav class="nav" aria-label="Main">${nav}<a href="${hrefFix(lang, 'order/status')}"${cur('order/status')}>${d.status}</a></nav>
<div class="tools"><a class="btn btn-p" style="min-height:44px;padding:8px 16px" href="${hrefFix(lang, 'order')}">${d.order}</a><a class="ib" href="${hrefFix(other, slug)}" hreflang="${other}" lang="${other}" aria-label="${other === 'en' ? 'English' : 'বাংলা'}">${d.langLabel}</a><button class="ib" id="theme" type="button" aria-label="Theme">${ic.theme}</button><button class="ib mbtn" id="mbtn" type="button" aria-label="Menu" aria-expanded="false" aria-controls="menu">${ic.menu}</button></div></div>
<div class="menu" id="menu">${nav}<a href="${hrefFix(lang, 'order/status')}">${d.status}</a></div></header>
<main id="main">${body}</main>
<footer class="ftr"><div class="wrap"><div class="cols"><div><div class="logo" style="margin-bottom:10px"><span class="mark">${H}</span><b>HOSTNEIL</b></div><div style="color:var(--muted)">${TAG}</div></div><div><h4>${lang === 'en' ? 'Pages' : 'পাতা'}</h4>${Object.entries(d.nav).map(([s, l]) => `<a href="${hrefFix(lang, s)}">${l}</a>`).join('')}<a href="${hrefFix(lang, 'about')}">${d.about_t}</a></div><div><h4>${lang === 'en' ? 'Legal' : 'আইনি'}</h4>${lnks.map(([s, l]) => `<a href="${hrefFix(lang, s)}">${l}</a>`).join('')}</div></div><div class="disc">${DISC[lang]}<br>© <span data-year>2026</span> HOSTNEIL</div></div></footer>
<script type="application/json" id="i18n">${i18n}</script><script src="${base}assets/config.js"></script><script src="${base}assets/site.js" defer></script></body></html>`;
  const out = (lang === 'en' ? 'en/' : '') + (slug ? slug + '/' : '') + 'index.html';
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  return out;
}

let n = 0;
for (const lang of ['bn', 'en']) for (const s of PAGES) { build(lang, s); n++; }
// 404 (bilingual, absolute-safe via relative root guess)
writeFileSync('404.html', `<!doctype html><html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>404 — HOSTNEIL</title><style>body{font:16px/1.6 system-ui,"Noto Sans Bengali",sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#0A0F1C;color:#E8EDF7;text-align:center;padding:24px}a{color:#8AA2FF}</style></head><body><div><h1>404</h1><p>পাতাটি পাওয়া যায়নি। / Page not found.</p><p><a href="./">HOSTNEIL</a></p></div></body></html>`);
writeFileSync('.nojekyll', '');
writeFileSync('assets/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0B1B4D"/><stop offset=".62" stop-color="#2F4BF2"/><stop offset="1" stop-color="#0E7490"/></linearGradient></defs><rect width="48" height="48" rx="11" fill="url(#g)"/><g fill="#fff" transform="translate(8 8) scale(.67)"><rect x="6" y="6" width="11" height="36" rx="1.5"/><rect x="31" y="6" width="11" height="36" rx="1.5"/><path d="M17 20.5l14-4.5v11.5l-14 4.5z"/></g></svg>`);
console.log('built', n, 'pages');
