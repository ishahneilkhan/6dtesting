/* HOSTNEIL site.js — no dependencies. Config in assets/config.js, data in assets/packages.json */
(function () {
  'use strict';
  var D = document, H = D.documentElement, CFG = window.HN_CONFIG || {}, LANG = H.lang === 'en' ? 'en' : 'bn';
  var I = {}; try { I = JSON.parse(D.getElementById('i18n').textContent); } catch (e) {}
  var BASE = H.getAttribute('data-base') || '';
  function $(s, r) { return (r || D).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || D).querySelectorAll(s)); }
  function esc(s) { var d = D.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function money(n) { return '৳' + Number(n).toLocaleString('en-US'); }
  function t(k) { return I[k] || k; }
  function digits(s) { return String(s || '').replace(/[০-৯]/g, function (c) { return c.charCodeAt(0) - 0x09E6; }); }
  function normPhone(s) { s = digits(s).replace(/[\s\-()]/g, ''); var m = /^(?:\+?88)?(01[3-9]\d{8})$/.exec(s); return m ? '+88' + m[1] : ''; }
  function ok(s) { return s; }
  H.classList.remove('js-off');

  /* theme */
  function applyTheme(v) { if (v === 'light' || v === 'dark') H.setAttribute('data-theme', v); else H.removeAttribute('data-theme'); }
  var tb = $('#theme'); if (tb) tb.addEventListener('click', function () {
    var cur = H.getAttribute('data-theme'); var sysDark = matchMedia('(prefers-color-scheme: dark)').matches;
    var next = cur ? (cur === 'dark' ? 'light' : 'dark') : (sysDark ? 'light' : 'dark'); applyTheme(next);
    try { localStorage.setItem('hn-theme', next); } catch (e) {}
  });
  /* menu */
  var mb = $('#mbtn'), mn = $('#menu'); if (mb && mn) mb.addEventListener('click', function () { var o = mn.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
  /* year */
  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });
  /* reveal */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12 });
    $$('.rv').forEach(function (e) { io.observe(e); });
  } else $$('.rv').forEach(function (e) { e.classList.add('in'); });
  /* 3D tilt */
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) {
    function bindTilt() {
      $$('.tilt:not([data-b])').forEach(function (el) {
        el.setAttribute('data-b', 1);
        el.addEventListener('pointermove', function (e) { if (e.pointerType === 'touch') return; var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.transform = 'perspective(800px) rotateX(' + (-y * 10) + 'deg) rotateY(' + (x * 12) + 'deg) translateY(-4px)'; });
        el.addEventListener('pointerleave', function () { el.style.transform = ''; });
      });
    }
    window.hnTilt = bindTilt; bindTilt();
    var sc = $('.scene'), st = sc && $('.stack', sc);
    if (sc) { sc.addEventListener('pointermove', function (e) { var r = sc.getBoundingClientRect(); st.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 24 + 'deg'); st.style.setProperty('--rx', -((e.clientY - r.top) / r.height - .5) * 18 + 'deg'); }); sc.addEventListener('pointerleave', function () { st.style.setProperty('--ry', '0deg'); st.style.setProperty('--rx', '0deg'); }); }
  }
  /* alerts */
  function alertBox(el, kind, msg) { el.innerHTML = '<div class="alert a-' + kind + '" role="' + (kind === 'err' ? 'alert' : 'status') + '">' + esc(msg) + '</div>'; }
  function waLink(text) { var n = String(CFG.WHATSAPP || '').replace(/\D/g, ''); return n ? 'https://wa.me/' + n + '?text=' + encodeURIComponent(text) : ''; }
  function api(path, body) {
    var c = new AbortController(), to = setTimeout(function () { c.abort(); }, 15000);
    return fetch(CFG.API_BASE.replace(/\/$/, '') + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: c.signal })
      .then(function (r) { clearTimeout(to); return r.json().catch(function () { return {}; }).then(function (j) { return { s: r.status, j: j }; }); });
  }
  function errMsg(res) { var c = res && res.j && res.j.error && res.j.error.code; return I['e_' + c] || t('e_INTERNAL'); }
  function support(el) { var w = waLink(t('wa_hello')); return w ? ' <a href="' + w + '" target="_blank" rel="noopener">WhatsApp</a>' : ''; }

  /* packages */
  var PK = null;
  function loadPk() { return PK || (PK = fetch(BASE + 'assets/packages.json', { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw 0; return r.json(); })); }
  function pName(p) { return LANG === 'en' ? p.name_en : p.name_bn; }
  function renderPk(box) {
    var compact = box.getAttribute('data-mode') === 'compact';
    loadPk().then(function (d) {
      var list = (d.packages || []).filter(function (p) { return p.published !== false; });
      if (!list.length) { box.innerHTML = '<div class="card"><p>' + esc(t('pk_empty')) + '</p></div>'; return; }
      box.innerHTML = list.map(function (p) {
        var f = (p.features || []).map(function (x) { return '<li><span>' + esc(LANG === 'en' ? x.label_en : x.label_bn) + '</span><b>' + esc(LANG === 'en' ? x.value_en : x.value_bn) + '</b></li>'; }).join('');
        var term = p.term_months === 12 ? t('per_year') : p.term_months + ' ' + t('months');
        return '<div class="card price tilt rv in"><h3>' + esc(pName(p)) + '</h3><div class="note">' + esc(LANG === 'en' ? p.tagline_en : p.tagline_bn) + '</div><div class="amt">' + money(p.price_bdt) + ' <small>' + esc(term) + '</small></div>' +
          (f ? '<ul class="feat">' + f + '</ul>' : '<p class="note">' + esc(t('pk_nofeat')) + '</p>') +
          '<a class="btn btn-p" href="' + BASE + (LANG === 'en' ? 'en/' : '') + 'order/?package=' + encodeURIComponent(p.slug) + '">' + esc(t('choose')) + '</a></div>';
      }).join('');
      if (window.hnTilt) window.hnTilt();
    }).catch(function () { box.innerHTML = '<div class="alert a-err" role="alert">' + esc(t('pk_err')) + '</div>'; });
  }
  $$('[data-packages]').forEach(renderPk);

  /* copy buttons */
  D.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy]'); if (!b) return;
    var v = b.getAttribute('data-copy'); (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).catch(function () {}).then(function () { var o = b.textContent; b.textContent = t('copied'); setTimeout(function () { b.textContent = o; }, 2000); });
  });

  function setErrs(form, fields) {
    $$('.err', form).forEach(function (e) { e.textContent = ''; }); $$('[aria-invalid]', form).forEach(function (e) { e.removeAttribute('aria-invalid'); });
    var first; Object.keys(fields || {}).forEach(function (k) { var inp = form.elements[k]; var er = $('[data-err=' + k + ']', form); if (er) er.textContent = fields[k]; if (inp) { inp.setAttribute('aria-invalid', 'true'); first = first || inp; } });
    if (first) first.focus();
  }
  function busy(btn, on) { btn.disabled = on; btn.classList.toggle('load', on); }
  var born = Date.now();

  /* order form */
  var of = $('#order-form');
  if (of) {
    var sel = of.elements.package, qp = new URLSearchParams(location.search).get('package');
    loadPk().then(function (d) {
      var list = (d.packages || []).filter(function (p) { return p.published !== false; });
      sel.innerHTML = '<option value="">' + esc(t('select_pk')) + '</option>' + list.map(function (p) { return '<option value="' + esc(p.slug) + '">' + esc(pName(p)) + ' — ' + money(p.price_bdt) + '</option>'; }).join('');
      if (qp) sel.value = qp;
      window.__pk = list;
    });
    of.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = of.elements, er = {}, ph = normPhone(f.phone.value), em = f.email.value.trim().toLowerCase();
      if (!f.package.value) er.package = t('v_req');
      if (f.name.value.trim().length < 2) er.name = t('v_req');
      if (!ph) er.phone = t('v_phone');
      if (em && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) er.email = t('v_email');
      if (!f.consent.checked) er.consent = t('v_consent');
      setErrs(of, er); var out = $('#order-out'); out.innerHTML = '';
      if (Object.keys(er).length) return;
      if (f.website.value) { alertBox(out, 'ok', t('order_sent')); return; }
      var pk = (window.__pk || []).filter(function (p) { return p.slug === f.package.value; })[0] || {};
      var domain = f.domain.value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
      var payload = { package_slug: f.package.value, name: f.name.value.trim(), phone: ph, email: em || undefined, domain: domain || undefined, note: f.note.value.trim() || undefined, lang: LANG, consent: true, terms_version: CFG.TERMS_VERSION || '', turnstile_token: '', website: '', elapsed_ms: Date.now() - born };
      var btn = $('button[type=submit]', of);
      if (CFG.API_BASE) {
        busy(btn, true);
        api('/api/public/orders', payload).then(function (r) {
          busy(btn, false);
          if (r.s === 201) { showPay(r.j.order_code, r.j.total_bdt, pk, ph); }
          else if (r.j && r.j.error && r.j.error.fields) setErrs(of, r.j.error.fields); else alertBox(out, 'err', errMsg(r));
        }).catch(function () { busy(btn, false); alertBox(out, 'err', t('e_NET')); });
      } else {
        var txt = t('wa_order').replace('{pkg}', pName(pk) || f.package.value).replace('{price}', pk.price_bdt ? money(pk.price_bdt) : '').replace('{name}', payload.name).replace('{phone}', ph).replace('{domain}', domain || '-');
        var w = waLink(txt);
        if (w) { alertBox(out, 'info', t('order_wa')); out.firstChild.insertAdjacentHTML('beforeend', ' <a class="btn btn-p" style="margin-left:8px" target="_blank" rel="noopener" href="' + w + '">WhatsApp</a>'); }
        else alertBox(out, 'warn', t('order_closed'));
      }
    });
  }
  function showPay(code, total, pk, ph) {
    try { sessionStorage.setItem('hn-order', JSON.stringify({ code: code, contact: ph })); } catch (e) {}
    var P = CFG.PAYMENT || {}, tabs = [], panes = [];
    function add(id, label, html) { tabs.push([id, label]); panes.push([id, html]); }
    function row(k, v) { return v ? '<div class="copy"><span>' + esc(k) + ':</span> <code class="mono">' + esc(v) + '</code> <button type="button" class="btn btn-s" style="min-height:36px;padding:4px 12px" data-copy="' + esc(v) + '">' + esc(t('copy')) + '</button></div>' : ''; }
    if (P.bkash && P.bkash.number) add('bkash', 'bKash', row(t('number'), P.bkash.number) + '<p class="note">' + esc(P.bkash.type || '') + '</p>');
    if (P.nagad && P.nagad.number) add('nagad', 'Nagad', row(t('number'), P.nagad.number) + '<p class="note">' + esc(P.nagad.type || '') + '</p>');
    if (P.bank && P.bank.number) add('bank', t('bank'), row(t('bank_name'), P.bank.name) + row(t('acc_name'), P.bank.accountName) + row(t('acc_no'), P.bank.number) + row(t('branch'), P.bank.branch));
    var box = $('#pay'); of.hidden = true; box.hidden = false;
    box.innerHTML = '<div class="alert a-ok" role="status"><div><b>' + esc(t('order_received')) + '</b><br>' + esc(t('order_id')) + ': <code class="mono">' + esc(code) + '</code> <button type="button" class="btn btn-s" style="min-height:36px;padding:4px 12px" data-copy="' + esc(code) + '">' + esc(t('copy')) + '</button><br>' + esc(t('total')) + ': <b>' + money(total) + '</b><br>' + esc(t('not_active')) + '</div></div>' +
      '<h2>' + esc(t('pay_h')) + '</h2>' + (tabs.length ? '<div class="tabs" role="tablist">' + tabs.map(function (x, i) { return '<button class="tab" role="tab" aria-selected="' + (i === 0) + '" data-tab="' + x[0] + '">' + esc(x[1]) + '</button>'; }).join('') + '</div>' + panes.map(function (x, i) { return '<div class="card" data-pane="' + x[0] + '"' + (i ? ' hidden' : '') + '>' + x[1] + '<p class="note">' + esc(t('pay_note').replace('{total}', money(total))) + '</p></div>'; }).join('') : '<div class="alert a-warn">' + esc(t('pay_none')) + support() + '</div>') +
      '<h2 style="margin-top:32px">' + esc(t('paid_h')) + '</h2><form id="pay-form" class="form" novalidate><input type="hidden" name="code" value="' + esc(code) + '"><div><label for="pm">' + esc(t('method')) + '</label><select id="pm" name="method"><option value="bkash">bKash</option><option value="nagad">Nagad</option><option value="bank">' + esc(t('bank')) + '</option></select></div><div><label for="tx">' + esc(t('trx')) + '</label><input id="tx" name="trx" autocomplete="off"><div class="err" data-err="trx"></div></div><div><label for="sd">' + esc(t('sender')) + '</label><input id="sd" name="sender" autocomplete="off"><div class="err" data-err="sender"></div></div><div><label for="am">' + esc(t('amount')) + '</label><input id="am" name="amount" inputmode="numeric" value="' + total + '"><div class="err" data-err="amount"></div></div><button class="btn btn-p" type="submit">' + esc(t('submit_pay')) + '</button><div id="pay-out"></div></form>';
    $$('[data-tab]', box).forEach(function (b) { b.addEventListener('click', function () { $$('[data-tab]', box).forEach(function (x) { x.setAttribute('aria-selected', x === b); }); $$('[data-pane]', box).forEach(function (p) { p.hidden = p.getAttribute('data-pane') !== b.getAttribute('data-tab'); }); }); });
    var pf = $('#pay-form', box); pf.addEventListener('submit', function (e) {
      e.preventDefault(); var f = pf.elements, er = {}; var trx = f.trx.value.replace(/\s/g, ''), amt = parseInt(digits(f.amount.value), 10);
      if (!/^[A-Za-z0-9]{6,40}$/.test(trx)) er.trx = t('v_trx'); if (f.sender.value.trim().length < 3) er.sender = t('v_req'); if (!(amt > 0)) er.amount = t('v_req');
      setErrs(pf, er); var out = $('#pay-out', box); out.innerHTML = ''; if (Object.keys(er).length) return;
      var b = $('button[type=submit]', pf);
      if (CFG.API_BASE) {
        busy(b, true); api('/api/public/orders/' + encodeURIComponent(code) + '/payments', { contact: ph, method: f.method.value, trx_id: trx, sender_account: f.sender.value.trim(), amount_bdt: amt, turnstile_token: '' }).then(function (r) {
          busy(b, false); if (r.s === 201) { pf.hidden = true; alertBox(out, 'ok', t('pay_done')); $('#pay-out', box).insertAdjacentHTML('beforeend', '<p><a class="btn btn-s" href="' + BASE + (LANG === 'en' ? 'en/' : '') + 'order/status/">' + esc(t('check_status')) + '</a></p>'); } else alertBox(out, 'err', errMsg(r));
        }).catch(function () { busy(b, false); alertBox(out, 'err', t('e_NET')); });
      } else { var w = waLink(t('wa_pay').replace('{code}', code).replace('{m}', f.method.value).replace('{trx}', trx).replace('{amt}', amt).replace('{sender}', f.sender.value.trim())); if (w) window.open(w, '_blank', 'noopener'); else alertBox(out, 'warn', t('order_closed')); }
    });
  }

  /* status */
  var sf = $('#status-form');
  if (sf) {
    var qo = new URLSearchParams(location.search).get('o'); if (qo) sf.elements.code.value = qo;
    try { var so = JSON.parse(sessionStorage.getItem('hn-order') || 'null'); if (so) { if (!qo) sf.elements.code.value = so.code; sf.elements.contact.value = so.contact; } } catch (e) {}
    sf.addEventListener('submit', function (e) {
      e.preventDefault(); var out = $('#status-out'), f = sf.elements, er = {}; out.innerHTML = '';
      var code = f.code.value.trim().toUpperCase(); if (code && code.indexOf('HN-') !== 0) code = 'HN-' + code; if (code.length !== 11) er.code = t('v_req');
      var c = f.contact.value.trim(); var contact = c.indexOf('@') > -1 ? c.toLowerCase() : normPhone(c); if (!contact) er.contact = t('v_contact');
      setErrs(sf, er); if (Object.keys(er).length) return;
      if (!CFG.API_BASE) { alertBox(out, 'info', t('status_soon')); return; }
      var b = $('button[type=submit]', sf); busy(b, true);
      api('/api/public/orders/lookup', { order_code: code, contact: contact, turnstile_token: '' }).then(function (r) {
        busy(b, false);
        if (r.s !== 200) { alertBox(out, 'err', errMsg(r)); return; }
        var o = r.j, k = o.display_status; if (k === 'pending_payment' && o.payment) { if (o.payment.state === 'submitted') k = 'payment_submitted'; if (o.payment.state === 'rejected') k = 'payment_rejected'; }
        var idx = { pending_payment: 0, payment_submitted: 0, payment_rejected: 0, paid: 1, provisioned: 2, active: 3, expiring: 3, expired: 3 }[k];
        var sv = o.service ? '<p>' + esc(t('domain')) + ': <b>' + esc(o.service.domain_name || '-') + '</b><br>' + esc(t('covered')) + ': <b>' + esc(o.service.expires_on) + '</b> (' + esc(o.service.days_left) + ' ' + esc(t('days_left')) + ')</p>' : '';
        out.innerHTML = '<div class="card"><span class="badge">' + esc(t('s_' + k)) + '</span><h3 class="mono" style="margin-top:12px">' + esc(o.order_code) + '</h3><p>' + esc(o.package_name) + ' — ' + money(o.total_bdt) + '</p>' + (idx != null ? '<div class="stepper" aria-hidden="true">' + [0, 1, 2, 3].map(function (i) { return '<i class="' + (i <= idx ? 'on' : '') + '"></i>'; }).join('') + '</div>' : '') + sv + '</div>';
      }).catch(function () { busy(b, false); alertBox(out, 'err', t('e_NET')); });
    });
  }

  /* contact */
  var cf = $('#contact-form');
  if (cf) cf.addEventListener('submit', function (e) {
    e.preventDefault(); var f = cf.elements, er = {}, out = $('#contact-out'); out.innerHTML = '';
    var c = f.contact.value.trim(), ph = normPhone(c), em = c.indexOf('@') > -1 ? c.toLowerCase() : '';
    if (f.name.value.trim().length < 2) er.name = t('v_req'); if (!ph && !em) er.contact = t('v_contact'); if (f.message.value.trim().length < 5) er.message = t('v_req');
    setErrs(cf, er); if (Object.keys(er).length) return; if (f.website.value) { alertBox(out, 'ok', t('msg_sent')); return; }
    var b = $('button[type=submit]', cf);
    if (CFG.API_BASE) { busy(b, true); api('/api/public/contact', { name: f.name.value.trim(), phone: ph || undefined, email: em || undefined, message: f.message.value.trim(), lang: LANG, turnstile_token: '', website: '', elapsed_ms: Date.now() - born }).then(function (r) { busy(b, false); if (r.s === 201) { cf.reset(); alertBox(out, 'ok', t('msg_sent')); } else alertBox(out, 'err', errMsg(r)); }).catch(function () { busy(b, false); alertBox(out, 'err', t('e_NET')); }); }
    else { var w = waLink(f.name.value.trim() + ': ' + f.message.value.trim()); if (w) { window.open(w, '_blank', 'noopener'); alertBox(out, 'info', t('order_wa')); } else if (CFG.EMAIL) { location.href = 'mailto:' + CFG.EMAIL + '?subject=HOSTNEIL&body=' + encodeURIComponent(f.message.value); } else alertBox(out, 'warn', t('order_closed')); }
  });
})();
