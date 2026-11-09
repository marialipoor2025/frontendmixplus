/**
 * Damoon Customer Panel — shell interactions
 * Nav → content swap · active states · collapse · mobile drawer
 * Pages: … · support · reports (live) · account placeholder
 */
(function () {
  "use strict";

  var STORAGE_KEY = "damoon.ui.sidebarCollapsed";

  var ROUTES = {
    dashboard: {
      title: "پیشخوان",
      purpose: "نمای کلی وضعیت درخواست‌ها، اسناد در انتظار و خلاصه مالی حساب شما.",
      docTitle: "پیشخوان — پنل دامون",
    },
    products: {
      title: "محصولات",
      purpose: "مرور سلسله‌مراتب محصولات برودتی صنعتی، مشخصات فنی و انتخاب برای ثبت درخواست.",
      docTitle: "محصولات — پنل دامون",
    },
    requests: {
      title: "درخواست‌ها",
      purpose: "پیگیری درخواست‌های خرید، وضعیت بررسی و تاریخچه مکاتبات.",
      docTitle: "درخواست‌ها — پنل دامون",
    },
    documents: {
      title: "اسناد",
      purpose: "دسترسی به پیش‌فاکتور، فاکتور و رسیدهای مرتبط با معاملات.",
      docTitle: "اسناد — پنل دامون",
    },
    proforma: {
      title: "صدور پیش فاکتور",
      purpose: "افزودن کالا به لیست پیش‌فاکتور و دریافت فایل PDF پس از تکمیل فرم.",
      docTitle: "صدور پیش فاکتور — پنل دامون",
    },
    compare: {
      title: "مقایسه کالاها",
      purpose: "مقایسه مشخصات و قیمت کالاهای انتخاب‌شده.",
      docTitle: "مقایسه کالاها — پنل دامون",
    },
    finance: {
      title: "مالی",
      purpose: "وضعیت پرداخت‌ها، اعتبار حساب و صورتحساب‌های باز.",
      docTitle: "مالی — پنل دامون",
    },
    support: {
      title: "پشتیبانی",
      purpose: "ثبت تیکت فنی یا مالی و پیگیری پاسخ تیم دامون.",
      docTitle: "پشتیبانی — پنل دامون",
    },
    reports: {
      title: "گزارش‌ها",
      purpose: "گزارش‌های خلاصه خرید، زمان پاسخ و عملکرد حساب در بازه‌های زمانی.",
      docTitle: "گزارش‌ها — پنل دامون",
    },
    account: {
      title: "حساب کاربری",
      purpose: "مدیریت پروفایل، شرکت، آدرس‌ها و امنیت حساب.",
      docTitle: "حساب کاربری — پنل دامون",
    },
  };

  var shell = document.getElementById("app-shell");
  var stage = document.getElementById("content-stage");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-nav]"));
  var collapseBtn = document.getElementById("collapse-btn");
  var menuToggle = document.getElementById("menu-toggle");
  var backdrop = document.getElementById("sidebar-backdrop");
  var fadeTimer = null;

  function getRoute(id) {
    return ROUTES[id] || ROUTES.dashboard;
  }

  function buildDashboard() {
    return (
      '<article class="content-panel page-dashboard" data-panel="dashboard" aria-live="polite">' +
        '<header class="dash-header">' +
          "<div>" +
            '<p class="dash-kicker">باشگاه مشتریان دامون</p>' +
            "<h1 class=\"dash-title\">سلام، احمدرضا</h1>" +
            '<p class="dash-sub">یک‌شنبه ۱۸ آبان ۱۴۰۴ · خلاصه وضعیت خرید و مالی شما</p>' +
          "</div>" +
          '<div class="dash-header-actions">' +
            '<button type="button" class="btn btn-secondary" data-goto="requests">همه درخواست‌ها</button>' +
            '<button type="button" class="btn btn-primary" data-goto="products">ثبت درخواست از محصولات</button>' +
          "</div>" +
        "</header>" +

        '<section class="kpi-grid" aria-label="شاخص‌های کلیدی">' +
          '<button type="button" class="kpi" data-goto="requests">' +
            '<span class="kpi-label">معاملات باز</span>' +
            '<span class="kpi-value">۴</span>' +
            '<span class="kpi-meta">نیاز به پیگیری</span>' +
          "</button>" +
          '<button type="button" class="kpi" data-goto="documents">' +
            '<span class="kpi-label">پیش‌فاکتور جدید</span>' +
            '<span class="kpi-value">۲</span>' +
            '<span class="kpi-meta">آماده بررسی</span>' +
          "</button>" +
          '<button type="button" class="kpi" data-goto="documents">' +
            '<span class="kpi-label">فاکتور باز</span>' +
            '<span class="kpi-value">۱</span>' +
            '<span class="kpi-meta kpi-meta--warn">پرداخت نشده</span>' +
          "</button>" +
          '<button type="button" class="kpi" data-goto="finance">' +
            '<span class="kpi-label">مانده بدهی</span>' +
            '<span class="kpi-value num">۱۸٫۴۰۰٫۰۰۰</span>' +
            '<span class="kpi-meta">ریال</span>' +
          "</button>" +
        "</section>" +

        '<div class="dash-layout">' +
          '<section class="dash-card" aria-labelledby="attn-title">' +
            '<div class="dash-card-head">' +
              '<h2 id="attn-title">نیازمند توجه شما</h2>' +
              '<span class="chip chip-warn">۳ مورد</span>' +
            "</div>" +
            '<ul class="attn-list">' +
              '<li class="attn-item">' +
                "<div>" +
                  '<div class="attn-title">پیش‌فاکتور معامله ۲۵۴۸۹ آماده است</div>' +
                  '<div class="attn-desc">شیرآلات دانفوس GBC · ۲ قلم</div>' +
                "</div>" +
                '<button type="button" class="btn btn-secondary btn-sm" data-goto="documents">مشاهده</button>' +
              "</li>" +
              '<li class="attn-item">' +
                "<div>" +
                  '<div class="attn-title">فاکتور I-94 در انتظار پرداخت</div>' +
                  '<div class="attn-desc">معامله ۲۴۳۰۵ · ۱۸٫۴۰۰٫۰۰۰ ریال</div>' +
                "</div>" +
                '<button type="button" class="btn btn-primary btn-sm" data-goto="finance">پرداخت / اعلام</button>' +
              "</li>" +
              '<li class="attn-item">' +
                "<div>" +
                  '<div class="attn-title">کارشناس دامون پاسخ جدید گذاشته</div>' +
                  '<div class="attn-desc">معامله ۲۵۴۳۰ · پیگیری اول</div>' +
                "</div>" +
                '<button type="button" class="btn btn-secondary btn-sm" data-goto="requests">باز کردن</button>' +
              "</li>" +
            "</ul>" +
          "</section>" +

          '<section class="dash-card" aria-labelledby="pipe-title">' +
            '<div class="dash-card-head">' +
              '<h2 id="pipe-title">مسیر معامله</h2>' +
            "</div>" +
            '<ol class="pipeline" aria-label="مراحل خرید">' +
              '<li class="pipe-step is-done"><span class="pipe-dot"></span><span>ارتباط اولیه</span></li>' +
              '<li class="pipe-step is-done"><span class="pipe-dot"></span><span>پیگیری</span></li>' +
              '<li class="pipe-step is-current"><span class="pipe-dot"></span><span>پیش‌فاکتور</span></li>' +
              '<li class="pipe-step"><span class="pipe-dot"></span><span>فاکتور</span></li>' +
              '<li class="pipe-step"><span class="pipe-dot"></span><span>تسویه</span></li>' +
            "</ol>" +
            '<p class="pipeline-hint">وضعیت غالب معاملات باز شما روی <strong>پیش‌فاکتور</strong> است — مرحله بعد: تأیید یا پرداخت.</p>' +
          "</section>" +
        "</div>" +

        '<section class="dash-card dash-card--table" aria-labelledby="deals-title">' +
          '<div class="dash-card-head">' +
            '<h2 id="deals-title">معاملات اخیر</h2>' +
            '<button type="button" class="link-btn" data-goto="requests">مشاهده همه</button>' +
          "</div>" +
          '<div class="table-wrap">' +
            "<table class=\"data-table\">" +
              "<thead>" +
                "<tr>" +
                  "<th>شماره</th>" +
                  "<th>تاریخ</th>" +
                  "<th>اقلام</th>" +
                  "<th>وضعیت</th>" +
                  "<th>اقدام بعدی</th>" +
                "</tr>" +
              "</thead>" +
              "<tbody>" +
                "<tr>" +
                  '<td class="num">25489</td>' +
                  "<td>۱۴۰۴/۰۸/۱۵</td>" +
                  "<td>۳ قلم</td>" +
                  '<td><span class="status status-quote">پیش‌فاکتور</span></td>' +
                  '<td><button type="button" class="link-btn" data-goto="documents">بررسی پیش‌فاکتور</button></td>' +
                "</tr>" +
                "<tr>" +
                  '<td class="num">25430</td>' +
                  "<td>۱۴۰۴/۰۸/۱۲</td>" +
                  "<td>۱ قلم</td>" +
                  '<td><span class="status status-follow">پیگیری اول</span></td>' +
                  '<td><button type="button" class="link-btn" data-goto="requests">پاسخ به کارشناس</button></td>' +
                "</tr>" +
                "<tr>" +
                  '<td class="num">24305</td>' +
                  "<td>۱۴۰۴/۰۶/۲۰</td>" +
                  "<td>۵ قلم</td>" +
                  '<td><span class="status status-pay">فاکتور / بدهی</span></td>' +
                  '<td><button type="button" class="link-btn" data-goto="finance">اعلام پرداخت</button></td>' +
                "</tr>" +
                "<tr>" +
                  '<td class="num">25167</td>' +
                  "<td>۱۴۰۴/۰۷/۲۸</td>" +
                  "<td>۲ قلم</td>" +
                  '<td><span class="status status-ok">تسویه</span></td>' +
                  '<td><span class="muted">—</span></td>' +
                "</tr>" +
              "</tbody>" +
            "</table>" +
          "</div>" +
        "</section>" +
      "</article>"
    );
  }

  function buildProducts() {
    return (
      '<article class="content-panel page-products" id="view-products" data-panel="products" aria-live="polite">' +
        window.DamoonProducts.buildHTML() +
      "</article>"
    );
  }

  function buildPlaceholder(id) {
    var route = getRoute(id);
    return (
      '<article class="content-panel" data-panel="' + id + '" aria-live="polite">' +
        '<div class="panel-eyebrow">در صف بازطراحی</div>' +
        '<h1 class="panel-title">' + route.title + "</h1>" +
        '<p class="panel-purpose">' + route.purpose + "</p>" +
        '<p class="panel-note" role="status">پس از تأیید پشتیبانی، این صفحه را بازطراحی می‌کنیم.</p>' +
        '<div class="skeleton-grid" aria-hidden="true">' +
          '<div class="skeleton-block wide"><span class="skeleton-label">محتوا در مرحله بعد</span><div class="skeleton-bar mid"></div><div class="skeleton-bar short"></div></div>' +
          '<div class="skeleton-block"><span class="skeleton-label">محتوا در مرحله بعد</span><div class="skeleton-bar"></div><div class="skeleton-bar mid"></div></div>' +
          '<div class="skeleton-block"><span class="skeleton-label">محتوا در مرحله بعد</span><div class="skeleton-bar mid"></div><div class="skeleton-bar short"></div></div>' +
        "</div>" +
      "</article>"
    );
  }

  function escHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function money(n) {
    if (window.DamoonProducts && typeof window.DamoonProducts.formatMoney === "function") {
      return window.DamoonProducts.formatMoney(n);
    }
    var s = String(Math.round(Number(n) || 0));
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
  }

  function unitPrice(sku) {
    if (!sku || sku.price == null || sku.price === "" || sku.price === "توافقی") return null;
    return Number(sku.price) || 0;
  }

  function buildProforma() {
    var lines =
      window.DamoonProducts && typeof window.DamoonProducts.quoteLines === "function"
        ? window.DamoonProducts.quoteLines()
        : [];
    var total = 0;
    var rows = lines
      .map(function (line, i) {
        var sku = line.sku;
        var qty = line.qty || 1;
        var price = unitPrice(sku);
        var lineTotal = price == null ? 0 : price * qty;
        total += lineTotal;
        var priceTxt = price == null ? "توافقی" : money(price);
        var totalTxt = price == null ? "—" : money(lineTotal);
        var zebra = i % 2 ? " is-alt" : "";
        return (
          '<tr class="inv-row' + zebra + '" data-inv-code="' + escHtml(sku.code) + '">' +
            '<td class="inv-desk inv-idx">' + (i + 1) + "</td>" +
            '<td class="inv-name">' +
              '<a href="#products" data-goto="products">' + escHtml(sku.name) + "</a>" +
              '<div class="inv-code">' + escHtml(sku.code) + "</div>" +
            "</td>" +
            '<td class="inv-desk inv-qty">' +
              '<div class="inv-qty-wrap">' +
                '<input class="inv-qty-input" type="text" inputmode="numeric" data-inv-qty="' +
                escHtml(sku.code) +
                '" value="' +
                qty +
                '" aria-label="تعداد" />' +
                '<span class="inv-qty-label">عدد</span>' +
              "</div>" +
            "</td>" +
            '<td class="inv-unit"><div class="inv-num">' + priceTxt + "</div></td>" +
            '<td class="inv-line"><div class="inv-num">' + totalTxt + "</div></td>" +
            '<td class="inv-desk inv-del">' +
              '<button type="button" class="inv-del-btn" data-inv-remove="' +
              escHtml(sku.code) +
              '" aria-label="حذف">' +
                '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#FC2254" viewBox="0 0 18 18" aria-hidden="true"><path fill="#FC2254" d="M8.005 0a2.51 2.51 0 0 0-2.5 2.5H1.13a.625.625 0 1 0 0 1.25h1.042v10.625a2.294 2.294 0 0 0 2.291 2.292h4.222c-.356-.37-.659-.79-.899-1.25H4.463a1.043 1.043 0 0 1-1.041-1.042V3.75h9.166V7.5c.431 0 .848.056 1.25.15v-3.9h1.042a.625.625 0 1 0 0-1.25h-4.375a2.51 2.51 0 0 0-2.5-2.5m0 1.25c.698 0 1.25.552 1.25 1.25h-2.5c0-.698.552-1.25 1.25-1.25M6.537 5.824a.625.625 0 0 0-.615.634v6.25a.625.625 0 1 0 1.25 0v-6.25a.625.625 0 0 0-.635-.634m2.926.01a.625.625 0 0 0-.625.624v2.556c.37-.357.79-.66 1.25-.9V6.458a.625.625 0 0 0-.625-.625m3.125 2.5a4.583 4.583 0 1 0 0 9.166 4.583 4.583 0 0 0 0-9.167m-2.083 2.083c.107 0 .213.04.295.122l1.788 1.789 1.79-1.79a.416.416 0 1 1 .588.59l-1.788 1.789 1.788 1.788a.416.416 0 1 1-.589.59l-1.789-1.79-1.788 1.79a.416.416 0 1 1-.59-.59L12 12.917l-1.79-1.79a.416.416 0 0 1 .295-.71"/></svg>' +
              "</button>" +
            "</td>" +
          "</tr>" +
          '<tr class="inv-mobile-extra' + zebra + '">' +
            '<td colspan="4">' +
              '<div class="inv-mobile-bar">' +
                '<div class="inv-qty-wrap">' +
                  '<input class="inv-qty-input" type="text" inputmode="numeric" data-inv-qty="' +
                  escHtml(sku.code) +
                  '" value="' +
                  qty +
                  '" aria-label="تعداد" />' +
                  '<span class="inv-qty-label">عدد</span>' +
                "</div>" +
                '<button type="button" class="inv-del-btn" data-inv-remove="' +
                escHtml(sku.code) +
                '" aria-label="حذف">' +
                  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#FC2254" viewBox="0 0 18 18" aria-hidden="true"><path fill="#FC2254" d="M8.005 0a2.51 2.51 0 0 0-2.5 2.5H1.13a.625.625 0 1 0 0 1.25h1.042v10.625a2.294 2.294 0 0 0 2.291 2.292h4.222c-.356-.37-.659-.79-.899-1.25H4.463a1.043 1.043 0 0 1-1.041-1.042V3.75h9.166V7.5c.431 0 .848.056 1.25.15v-3.9h1.042a.625.625 0 1 0 0-1.25h-4.375a2.51 2.51 0 0 0-2.5-2.5m0 1.25c.698 0 1.25.552 1.25 1.25h-2.5c0-.698.552-1.25 1.25-1.25M6.537 5.824a.625.625 0 0 0-.615.634v6.25a.625.625 0 1 0 1.25 0v-6.25a.625.625 0 0 0-.635-.634m2.926.01a.625.625 0 0 0-.625.624v2.556c.37-.357.79-.66 1.25-.9V6.458a.625.625 0 0 0-.625-.625m3.125 2.5a4.583 4.583 0 1 0 0 9.166 4.583 4.583 0 0 0 0-9.167m-2.083 2.083c.107 0 .213.04.295.122l1.788 1.789 1.79-1.79a.416.416 0 1 1 .588.59l-1.788 1.789 1.788 1.788a.416.416 0 1 1-.589.59l-1.789-1.79-1.788 1.79a.416.416 0 1 1-.59-.59L12 12.917l-1.79-1.79a.416.416 0 0 1 .295-.71"/></svg>' +
                "</button>" +
              "</div>" +
            "</td>" +
          "</tr>"
        );
      })
      .join("");

    if (!lines.length) {
      rows =
        '<tr class="inv-empty-row"><td colspan="6" class="inv-empty">هنوز کالایی به پیش‌فاکتور اضافه نشده است. از لیست قیمت یا کارت محصول، «پیش فاکتور» را بزنید.</td></tr>';
    }

    return (
      '<article class="content-panel page-proforma" data-panel="proforma" aria-live="polite">' +
        '<div class="inv-container">' +
          "<div>" +
            '<h1 class="inv-title">صدور پیش فاکتور</h1>' +
            '<p class="inv-lead">در این بخش، می‌توانید محصولات مورد نظر خود را به لیست پیش‌فاکتور اضافه کرده و پس از تکمیل فرم، پیش‌فاکتور خود را به صورت PDF دریافت کنید. همچنین، در صورت آماده بودن لیست محصولات، می‌توانید فایل خود را از طریق بخش ' +
            '<a class="inv-lead-link" href="#documents" data-goto="documents">درخواست پیش‌فاکتور</a> برای ما ارسال کنید.</p>' +
          "</div>" +
          '<div class="inv-layout">' +
            '<aside class="inv-sidebar">' +
              '<div class="inv-card">' +
                '<div class="inv-card-head">اطلاعات مشتری</div>' +
                '<form id="invoiceForm" class="inv-form" novalidate>' +
                  '<div class="inv-field">' +
                    '<label class="inv-label" for="inv-fullName">' +
                      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" fill="none" viewBox="0 0 16 18" aria-hidden="true"><path fill="#fff" d="M8.334 9a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5"/><path stroke="#717888" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 16.5c0-1.163 0-1.745-.143-2.218a3.33 3.33 0 0 0-2.222-2.222c-.474-.143-1.055-.143-2.218-.143H6.25c-1.163 0-1.744 0-2.217.143a3.33 3.33 0 0 0-2.222 2.222c-.144.473-.144 1.055-.144 2.218M12.084 5.25a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0"/></svg>' +
                      'نام و نام خانوادگی<span class="inv-req">*</span>' +
                    "</label>" +
                    '<div class="inv-input-row">' +
                      '<input id="inv-fullName" name="fullName" type="text" class="inv-input" placeholder="نام و نام خانوادگی" required />' +
                      '<button type="button" class="inv-edit-btn" aria-label="ویرایش نام" tabindex="-1">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#00A7E7" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M12.916.085c-.748 0-1.495.284-2.062.85L9.262 2.529a.6.6 0 0 0-.147.146L1.63 10.158a1.46 1.46 0 0 0-.371.631L.024 15.118a.625.625 0 0 0 .772.772l4.33-1.236a1.46 1.46 0 0 0 .63-.371l7.469-7.469a.6.6 0 0 0 .175-.176l1.578-1.578a2.926 2.926 0 0 0 0-4.124 2.9 2.9 0 0 0-2.062-.85m0 1.243c.425 0 .85.164 1.178.492.657.656.657 1.7 0 2.356L12.87 5.401l-2.357-2.357 1.225-1.224a1.66 1.66 0 0 1 1.178-.492m-3.287 2.6 2.357 2.357-7.114 7.114a.2.2 0 0 1-.09.053l-.41.117-2.027-2.026.117-.411a.2.2 0 0 1 .053-.09zm-7.677 8.99 1.045 1.044-1.463.418z"/></svg>' +
                      "</button>" +
                    "</div>" +
                  "</div>" +
                  '<div class="inv-field">' +
                    '<label class="inv-label" for="inv-mobile">' +
                      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18" aria-hidden="true"><path stroke="#717888" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6.037 6.325c.58 1.208 1.37 2.34 2.372 3.342a12.2 12.2 0 0 0 3.342 2.372c.104.05.156.074.221.094.234.068.52.019.719-.123.055-.04.103-.087.198-.183.292-.291.437-.437.584-.532a1.67 1.67 0 0 1 1.817 0c.146.095.292.241.583.532l.163.163c.442.443.664.664.784.902.24.473.24 1.031 0 1.504-.12.238-.341.46-.784.902l-.132.132c-.441.441-.662.662-.962.83-.333.187-.85.322-1.232.32-.344 0-.579-.067-1.05-.2a15.87 15.87 0 0 1-6.902-4.062 15.87 15.87 0 0 1-4.062-6.903c-.133-.47-.2-.705-.2-1.05a2.8 2.8 0 0 1 .32-1.231c.168-.3.389-.521.83-.962l.131-.132c.443-.443.665-.664.903-.784a1.67 1.67 0 0 1 1.504 0c.238.12.46.341.902.784l.163.163c.29.29.437.437.532.583.359.552.359 1.265 0 1.817-.095.147-.241.292-.532.584-.096.095-.143.142-.183.198a.87.87 0 0 0-.123.718c.02.066.044.118.094.222"/></svg>' +
                      'تلفن همراه<span class="inv-req">*</span>' +
                    "</label>" +
                    '<div class="inv-input-row">' +
                      '<input id="inv-mobile" name="mobile" type="text" class="inv-input" placeholder="09121234567" required />' +
                      '<button type="button" class="inv-edit-btn" aria-label="ویرایش موبایل" tabindex="-1">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#00A7E7" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M12.916.085c-.748 0-1.495.284-2.062.85L9.262 2.529a.6.6 0 0 0-.147.146L1.63 10.158a1.46 1.46 0 0 0-.371.631L.024 15.118a.625.625 0 0 0 .772.772l4.33-1.236a1.46 1.46 0 0 0 .63-.371l7.469-7.469a.6.6 0 0 0 .175-.176l1.578-1.578a2.926 2.926 0 0 0 0-4.124 2.9 2.9 0 0 0-2.062-.85m0 1.243c.425 0 .85.164 1.178.492.657.656.657 1.7 0 2.356L12.87 5.401l-2.357-2.357 1.225-1.224a1.66 1.66 0 0 1 1.178-.492m-3.287 2.6 2.357 2.357-7.114 7.114a.2.2 0 0 1-.09.053l-.41.117-2.027-2.026.117-.411a.2.2 0 0 1 .053-.09zm-7.677 8.99 1.045 1.044-1.463.418z"/></svg>' +
                      "</button>" +
                    "</div>" +
                  "</div>" +
                  '<div class="inv-field is-last">' +
                    '<label class="inv-label" for="inv-company">' +
                      '<svg xmlns="http://www.w3.org/2000/svg" width="19" height="18" fill="none" viewBox="0 0 19 18" aria-hidden="true"><path stroke="#717888" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5.916 8.167H3.5c-.467 0-.7 0-.879.09a.83.83 0 0 0-.364.365c-.09.178-.09.411-.09.878v7m3.75-8.333V16.5m0-8.333v-4c0-.934 0-1.4.181-1.757.16-.314.415-.569.728-.728.357-.182.824-.182 1.757-.182h2.167c.933 0 1.4 0 1.756.182.314.16.569.414.729.728.181.357.181.823.181 1.757v4M2.166 16.5h3.75m-3.75 0h-.833m12.083-8.333h2.417c.467 0 .7 0 .878.09.157.08.285.208.365.365.09.178.09.411.09.878v7m-3.75-8.333V16.5m3.75 0H18m-.834 0h-3.75m0 0h-7.5M8.833 4.833H10.5M8.833 8.167H10.5M8.833 11.5H10.5"/></svg>' +
                      "نام شرکت" +
                    "</label>" +
                    '<div class="inv-input-row">' +
                      '<input id="inv-company" name="company" type="text" class="inv-input" placeholder="شرکت ..." />' +
                      '<button type="button" class="inv-edit-btn" aria-label="ویرایش شرکت" tabindex="-1">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#00A7E7" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M12.916.085c-.748 0-1.495.284-2.062.85L9.262 2.529a.6.6 0 0 0-.147.146L1.63 10.158a1.46 1.46 0 0 0-.371.631L.024 15.118a.625.625 0 0 0 .772.772l4.33-1.236a1.46 1.46 0 0 0 .63-.371l7.469-7.469a.6.6 0 0 0 .175-.176l1.578-1.578a2.926 2.926 0 0 0 0-4.124 2.9 2.9 0 0 0-2.062-.85m0 1.243c.425 0 .85.164 1.178.492.657.656.657 1.7 0 2.356L12.87 5.401l-2.357-2.357 1.225-1.224a1.66 1.66 0 0 1 1.178-.492m-3.287 2.6 2.357 2.357-7.114 7.114a.2.2 0 0 1-.09.053l-.41.117-2.027-2.026.117-.411a.2.2 0 0 1 .053-.09zm-7.677 8.99 1.045 1.044-1.463.418z"/></svg>' +
                      "</button>" +
                    "</div>" +
                  "</div>" +
                "</form>" +
                '<div class="inv-address">' +
                  '<label class="inv-label" for="inv-address">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="none" viewBox="0 0 19 19" aria-hidden="true"><path stroke="#717888" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.833 11.562c-1.543.681-2.5 1.63-2.5 2.678 0 2.071 3.731 3.75 8.333 3.75S18 16.312 18 14.24c0-1.049-.957-1.997-2.5-2.678m-.834-5.238c0 3.386-3.75 5-5 7.5-1.25-2.5-5-4.114-5-7.5a5 5 0 0 1 10 0m-4.166 0a.833.833 0 1 1-1.667 0 .833.833 0 0 1 1.667 0"/></svg>' +
                    'آدرس<span class="inv-req">*</span>' +
                  "</label>" +
                  '<div class="inv-input-row">' +
                    '<input id="inv-address" name="address" type="text" class="inv-input is-readonly" placeholder="آدرس ..." readonly />' +
                    '<button type="button" class="inv-edit-btn is-muted" aria-label="ویرایش آدرس">' +
                      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#717888" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M12.916.085c-.748 0-1.495.284-2.062.85L9.262 2.529a.6.6 0 0 0-.147.146L1.63 10.158a1.46 1.46 0 0 0-.371.631L.024 15.118a.625.625 0 0 0 .772.772l4.33-1.236a1.46 1.46 0 0 0 .63-.371l7.469-7.469a.6.6 0 0 0 .175-.176l1.578-1.578a2.926 2.926 0 0 0 0-4.124 2.9 2.9 0 0 0-2.062-.85m0 1.243c.425 0 .85.164 1.178.492.657.656.657 1.7 0 2.356L12.87 5.401l-2.357-2.357 1.225-1.224a1.66 1.66 0 0 1 1.178-.492m-3.287 2.6 2.357 2.357-7.114 7.114a.2.2 0 0 1-.09.053l-.41.117-2.027-2.026.117-.411a.2.2 0 0 1 .053-.09zm-7.677 8.99 1.045 1.044-1.463.418z"/></svg>' +
                    "</button>" +
                  "</div>" +
                "</div>" +
              "</div>" +
              '<div class="inv-card">' +
                '<div class="inv-card-head">جمع هزینه‌ها</div>' +
                '<div class="inv-cost-row">' +
                  '<div class="inv-cost-label"><span>واحد پول:</span></div>' +
                  '<div class="inv-cost-value"><span class="inv-currency">تومان</span></div>' +
                "</div>" +
                '<div class="inv-cost-block">' +
                  '<div class="inv-cost-label"><span>هزینه‌ها به عدد:</span></div>' +
                  '<div class="inv-total-num">' + money(total) + " تومان</div>" +
                "</div>" +
              "</div>" +
              '<div class="inv-actions">' +
                '<button class="inv-submit" type="submit" form="invoiceForm"' +
                (lines.length ? "" : " disabled") +
                ">" +
                  '<svg xmlns="http://www.w3.org/2000/svg" width="19" height="20" fill="#fff" viewBox="0 0 19 20" aria-hidden="true"><path fill="currentColor" d="M3.947 0A2.38 2.38 0 0 0 1.58 2.368v12.369h-.79a.79.79 0 0 0-.789.79v1.052A3.424 3.424 0 0 0 3.421 20H15a3.424 3.424 0 0 0 3.421-3.421V2.369A2.383 2.383 0 0 0 16.053 0zm0 1.579h12.106c.492 0 .79.297.79.79v14.21c0 1.06-.783 1.842-1.843 1.842s-1.842-.782-1.842-1.842v-1.053a.79.79 0 0 0-.79-.79h-9.21V2.369c0-.492.297-.789.79-.789M1.58 16.316h10v.263c0 .694.259 1.302.615 1.842H3.42c-1.06 0-1.842-.782-1.842-1.842z"/><path fill="currentColor" d="M5.263 4.912c0-.387.314-.701.702-.701h7.895a.702.702 0 1 1 0 1.403H5.965a.7.7 0 0 1-.702-.702M7.544 8.246c0-.388.314-.702.702-.702h5.614a.702.702 0 1 1 0 1.403H8.246a.7.7 0 0 1-.702-.701"/></svg>' +
                  "<span>صدور پیش فاکتور</span>" +
                "</button>" +
                '<button class="inv-online" type="button" disabled>' +
                  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.2" d="M6.07 4a4 4 0 0 1 7.85 0h1.68a1.91 1.91 0 0 1 1.64 1.65c.51 3.2 1 6.41 1.52 9.61a3.3 3.3 0 0 1-2.6 3.86h0a3 3 0 0 1-.68.07H4.54A3.27 3.27 0 0 1 1.2 16a1 1 0 0 1 0-.25 13.6 13.6 0 0 1 .29-2c.31-2 .63-3.94.94-5.9.11-.71.21-1.43.34-2.14A2 2 0 0 1 4.71 4Z"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.2" d="M14 7.43a4 4 0 0 1-8 0M6.07 4.04h7.85"/></svg>' +
                  "<span>خرید آنلاین</span>" +
                "</button>" +
              "</div>" +
            "</aside>" +
            '<div class="inv-main">' +
              '<div class="inv-items-head">اقلام پیش فاکتور</div>' +
              '<div class="inv-table-wrap">' +
                '<table class="inv-table">' +
                  "<thead>" +
                    "<tr>" +
                      '<td class="inv-desk">ردیف</td>' +
                      "<td>نام محصول</td>" +
                      '<td class="inv-desk inv-center">تعداد</td>' +
                      '<td class="inv-center">قیمت واحد (تومان)</td>' +
                      '<td class="inv-center">قیمت کل (تومان)</td>' +
                      '<td class="inv-desk inv-center">حذف</td>' +
                    "</tr>" +
                  "</thead>" +
                  "<tbody>" + rows + "</tbody>" +
                "</table>" +
                '<div class="inv-add-row">' +
                  '<button type="button" class="inv-add-btn" data-goto="products" aria-label="افزودن کالا">' +
                    '<span class="inv-add-icon" aria-hidden="true">+</span>' +
                  "</button>" +
                  '<input type="search" class="inv-search" placeholder="محصول مورد نظر خود را جستجو کنید" readonly data-goto="products" />' +
                "</div>" +
                '<div class="inv-summary">' +
                  "<div>جمع اقلام: <strong>" + lines.length + " مورد</strong></div>" +
                  "<div>جمع کل (تومان): <strong>" + money(total) + "</strong></div>" +
                "</div>" +
              "</div>" +
              '<div class="inv-note">' +
                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#F17603" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12S6.07 1.25 12 1.25 22.75 6.07 22.75 12 17.93 22.75 12 22.75m0-20C6.9 2.75 2.75 6.9 2.75 12S6.9 21.25 12 21.25s9.25-4.15 9.25-9.25S17.1 2.75 12 2.75"/><path fill="currentColor" d="M12 13.75c-.41 0-.75-.34-.75-.75V8c0-.41.34-.75.75-.75s.75.34.75.75v5c0 .41-.34.75-.75.75M12 17c-.13 0-.26-.03-.38-.08q-.18-.075-.33-.21c-.09-.1-.16-.2-.21-.33A1 1 0 0 1 11 16c0-.13.03-.26.08-.38q.075-.18.21-.33.15-.135.33-.21a1 1 0 0 1 .76 0q.18.075.33.21.135.15.21.33c.05.12.08.25.08.38s-.03.26-.08.38c-.05.13-.12.23-.21.33q-.15.135-.33.21c-.12.05-.25.08-.38.08"/></svg>' +
                "<p>توجه: این قسمت مخصوص صدور پیش‌فاکتور خریدهای عمده و شرکتی است. برای خرید آنلاین، لطفاً محصولات را به سبد خرید اضافه کرده و مراحل خرید را تکمیل کنید.</p>" +
              "</div>" +
            "</div>" +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function bindProforma(root) {
    var panel = root.querySelector(".page-proforma") || root;
    var form = panel.querySelector("#invoiceForm");

    function remountProforma() {
      navigate("proforma");
    }

    panel.addEventListener("click", function (e) {
      var gotoEl = e.target.closest("[data-goto]");
      if (gotoEl) {
        e.preventDefault();
        var target = gotoEl.getAttribute("data-goto");
        if (target) navigate(target);
        return;
      }

      var removeBtn = e.target.closest("[data-inv-remove]");
      if (removeBtn && window.DamoonProducts) {
        window.DamoonProducts.removeQuote(removeBtn.getAttribute("data-inv-remove") || "");
        remountProforma();
      }
    });

    panel.addEventListener("change", function (e) {
      var qtyInput = e.target.closest("[data-inv-qty]");
      if (!qtyInput || !window.DamoonProducts) return;
      var code = qtyInput.getAttribute("data-inv-qty") || "";
      var n = parseInt(String(qtyInput.value).replace(/[^\d]/g, ""), 10);
      if (!n || n < 1) n = 1;
      window.DamoonProducts.setQuoteQty(code, n);
      remountProforma();
    });

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = (form.fullName && form.fullName.value) || "";
        var mobile = (form.mobile && form.mobile.value) || "";
        var address = panel.querySelector("#inv-address");
        if (!String(name).trim() || !String(mobile).trim()) {
          alert("نام و تلفن همراه الزامی است.");
          return;
        }
        if (address && !String(address.value || "").trim()) {
          address.readOnly = false;
          address.focus();
          alert("لطفاً آدرس را تکمیل کنید.");
          return;
        }
        var lines =
          window.DamoonProducts && window.DamoonProducts.quoteLines
            ? window.DamoonProducts.quoteLines()
            : [];
        if (!lines.length) {
          alert("حداقل یک کالا به پیش‌فاکتور اضافه کنید.");
          return;
        }
        alert("پیش‌فاکتور برای " + lines.length + " قلم آماده شد.\nنسخه PDF به‌زودی از بخش اسناد قابل دریافت است.");
        navigate("documents");
      });
    }

    var addr = panel.querySelector("#inv-address");
    var addrEdit = panel.querySelector(".inv-address .inv-edit-btn");
    if (addr && addrEdit) {
      addrEdit.addEventListener("click", function () {
        addr.readOnly = false;
        addr.classList.remove("is-readonly");
        addr.focus();
      });
    }
  }

  function buildCompare() {
    var skus =
      window.DamoonProducts && typeof window.DamoonProducts.compareLines === "function"
        ? window.DamoonProducts.compareLines()
        : [];
    var gridCols = "160px repeat(4, minmax(260px, 1fr))";
    var star =
      '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="#b2b2b2" aria-hidden="true"><path fill="currentColor" d="M7.5.25 9.375 6H15l-4.625 3.25 1.875 5.625-4.75-3.5-4.75 3.5L4.625 9.25 0 6h5.625Z"/></svg>';
    var stars = '<div class="cmp-stars" aria-hidden="true">' + star + star + star + star + star + "</div>";
    var tomanSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="13" fill="none" viewBox="0 0 18 13" aria-hidden="true"><path fill="#707EAE" d="M5.292 6.296q-1.56 0-2.412-.9-.84-.888-.84-2.496V.512h1.524v2.352q0 .936.42 1.392t1.32.456h.48q.864 0 1.356-.456.492-.444.492-1.26V.512h1.524v2.352q0 1.08-.432 1.848-.42.78-1.188 1.176-.756.408-1.752.408zM2.472 10.916q.06 0 .084.156.036.156.036.66 0 .48-.036.624-.024.144-.084.144H2.04q-1.008 0-1.524-.576Q0 11.336 0 10.256V4.76h1.512v5.4q0 .396.144.576.156.18.492.18z"/><path fill="#707EAE" d="M5.87 7.484q1.128 0 1.74.648.624.648.624 1.836v.06q0 1.164-.648 1.824-.636.648-1.776.648-.588 0-.996-.156t-.6-.432a1.35 1.35 0 0 1-.564.456q-.336.132-.864.132h-.312q-.12 0-.12-.768 0-.816.12-.816h.312q.336 0 .48-.132t.144-.432v-.336q0-1.164.66-1.848.672-.684 1.8-.684m-.06 1.512q-.9 0-.9.96v.06q0 .444.216.684.228.228.684.228.468 0 .684-.216.228-.228.228-.696v-.06q0-.96-.912-.96"/><path fill="#707EAE" d="M14.065 7.916q.12 0 .12.816 0 .768-.12.768h-.96q-.133 1.356-.96 2.112-.816.756-2.148.756l-1.981-.024 1.088-1.548h.989q.708 0 1.116-.348.408-.336.408-.888V9.5h-.84q-1.2 0-1.812-.576t-.612-1.68v-.06q0-.78.3-1.392.312-.612.852-.96a2.3 2.3 0 0 1 1.26-.348q1.092 0 1.727.732.636.72.636 1.98v.72zm-4.2-.78q0 .432.204.612t.708.18h.84v-.744q0-.588-.24-.888-.228-.3-.66-.3-.42 0-.636.3-.216.288-.216.78z"/><path fill="#707EAE" d="M17.436 7.208q0 1.104-.576 1.704-.576.588-1.596.588h-1.2q-.12 0-.12-.768 0-.816.12-.816h1.188q.3 0 .48-.18.192-.192.192-.552v-1.8h1.512zm-3.084-3.096V2.756h3.384v1.356zM4.748.5v1.356H6.38V.5z"/></svg>';
    var trashSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#FC2254" viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M17.5 5.608h-.067C13.025 5.167 8.625 5 4.267 5.442l-1.7.166a.63.63 0 0 1-.134-1.25l1.7-.166c4.434-.45 8.925-.275 13.425.166a.626.626 0 0 1 .559.684.617.617 0 0 1-.617.566"/><path fill="currentColor" d="M7.083 4.767c-.033 0-.066 0-.108-.009a.627.627 0 0 1-.508-.716L6.65 2.95c.133-.8.317-1.908 2.258-1.908h2.184c1.95 0 2.133 1.15 2.258 1.916l.183 1.084a.62.62 0 0 1-.508.716.62.62 0 0 1-.717-.508l-.183-1.083c-.117-.725-.142-.867-1.025-.867H8.917c-.884 0-.9.117-1.025.858L7.7 4.242a.625.625 0 0 1-.617.525m5.592 14.191h-5.35c-2.908 0-3.025-1.608-3.117-2.908l-.541-8.392a.63.63 0 0 1 .583-.666.63.63 0 0 1 .667.583l.541 8.392c.092 1.266.125 1.741 1.867 1.741h5.35c1.75 0 1.783-.475 1.867-1.741l.541-8.392a.637.637 0 0 1 .667-.583.626.626 0 0 1 .583.666l-.541 8.392c-.092 1.3-.209 2.908-3.117 2.908"/><path fill="currentColor" d="M11.383 14.375H8.608a.63.63 0 0 1-.625-.625.63.63 0 0 1 .625-.625h2.775a.63.63 0 0 1 .625.625.63.63 0 0 1-.625.625m.7-3.333H7.917a.63.63 0 0 1-.625-.625.63.63 0 0 1 .625-.625h4.166a.63.63 0 0 1 .625.625.63.63 0 0 1-.625.625"/></svg>';

    function priceCell(sku) {
      if (!sku || sku.price == null || sku.price === "" || sku.price === "توافقی") {
        return '<div class="cmp-price">توافقی</div>';
      }
      return (
        '<div class="cmp-price"><span class="pl-1">' +
        money(sku.price) +
        "</span>" +
        tomanSvg +
        "</div>"
      );
    }

    function productCol(sku) {
      var img = sku.image
        ? '<img src="' +
          escHtml(sku.image) +
          '" alt="' +
          escHtml(sku.name) +
          '" width="170" height="170" loading="lazy" decoding="async" />'
        : '<div class="cmp-img-fallback">' + escHtml((sku.brand || "?").charAt(0)) + "</div>";
      return (
        '<div class="comparison-col">' +
          '<div class="cmp-remove-wrap">' +
            '<button type="button" class="cmp-remove" data-compare-remove="' +
            escHtml(sku.code) +
            '" aria-label="حذف از مقایسه">' +
            trashSvg +
            "</button>" +
          "</div>" +
          '<div class="comparison-cell">' +
            '<div class="cmp-img">' + img + "</div>" +
            '<div class="cmp-stars-wrap">' + stars + "</div>" +
            '<div class="cmp-name">' + escHtml(sku.name) + "</div>" +
            '<div class="cmp-price-wrap">' + priceCell(sku) + "</div>" +
          "</div>" +
        "</div>"
      );
    }

    var productCols = skus.map(productCol).join("");
    var emptyPads = "";
    for (var p = skus.length; p < 4; p++) {
      emptyPads += '<div class="comparison-col is-empty"></div>';
    }

    var specs =
      window.DamoonProducts && typeof window.DamoonProducts.getCompareSpecs === "function"
        ? window.DamoonProducts.getCompareSpecs(skus)
        : [];

    var headerCells = specs
      .map(function (row) {
        return '<div class="comparison-header-cell">' + escHtml(row.label) + "</div>";
      })
      .join("");

    var valueCols = skus
      .map(function (_sku, idx) {
        var cells = specs
          .map(function (row) {
            return (
              '<div class="comparison-value-cell">' +
              escHtml(row.values[idx] || "-") +
              "</div>"
            );
          })
          .join("");
        return '<div class="comparison-col comparison-values">' + cells + "</div>";
      })
      .join("");

    var valuePads = "";
    for (var q = skus.length; q < 4; q++) {
      valuePads += '<div class="comparison-col is-empty comparison-values"></div>';
    }

    var tableBody = !skus.length
      ? '<div class="cmp-empty">هنوز کالایی برای مقایسه انتخاب نشده است. از کارت محصول، آیکون مقایسه را بزنید.</div>'
      : '<div class="comparison-table">' +
          '<div class="comparison-row" style="grid-template-columns:' + gridCols + '">' +
            '<div class="comparison-col comparison-spacer"></div>' +
            productCols +
            emptyPads +
          "</div>" +
          '<div class="comparison-row comparison-specs" style="grid-template-columns:' + gridCols + '">' +
            '<div class="comparison-header">' + headerCells + "</div>" +
            valueCols +
            valuePads +
          "</div>" +
        "</div>";

    return (
      '<article class="content-panel page-compare" data-panel="compare" aria-live="polite">' +
        '<div class="cmp-container">' +
          '<div class="cmp-top">' +
            '<h1 class="cmp-title">مقایسه کالاها</h1>' +
            '<button type="button" class="btn btn-secondary btn-sm" data-goto="products">بازگشت به محصولات</button>' +
          "</div>" +
          tableBody +
        "</div>" +
      "</article>"
    );
  }

  function bindCompare(root) {
    var panel = root.querySelector(".page-compare") || root;
    panel.addEventListener("click", function (e) {
      var gotoEl = e.target.closest("[data-goto]");
      if (gotoEl) {
        e.preventDefault();
        var target = gotoEl.getAttribute("data-goto");
        if (target) navigate(target);
      }
    });
  }

  function buildRequests() {
    return (
      '<article class="content-panel page-requests" data-panel="requests" aria-live="polite">' +
        '<header class="req-header">' +
          "<div>" +
            '<p class="dash-kicker">خرید · درخواست‌ها</p>' +
            '<h1 class="dash-title">درخواست‌ها و معاملات</h1>' +
            '<p class="dash-sub">پیگیری وضعیت، اقدام بعدی، و جزئیات هر معامله در یک نگاه</p>' +
          "</div>" +
          '<div class="dash-header-actions">' +
            '<button type="button" class="btn btn-secondary" data-goto="products">از محصولات</button>' +
            '<button type="button" class="btn btn-primary" id="req-new-blank">ثبت درخواست جدید</button>' +
          "</div>" +
        "</header>" +

        '<div class="req-pipeline" role="tablist" aria-label="فیلتر وضعیت">' +
          '<button type="button" class="req-pipe is-active" data-status="all" role="tab" aria-selected="true">همه <span class="req-pipe-count">۵</span></button>' +
          '<button type="button" class="req-pipe" data-status="contact" role="tab" aria-selected="false">ارتباط اولیه <span class="req-pipe-count">۱</span></button>' +
          '<button type="button" class="req-pipe" data-status="follow" role="tab" aria-selected="false">پیگیری <span class="req-pipe-count">۱</span></button>' +
          '<button type="button" class="req-pipe" data-status="quote" role="tab" aria-selected="false">پیش‌فاکتور <span class="req-pipe-count">۱</span></button>' +
          '<button type="button" class="req-pipe" data-status="invoice" role="tab" aria-selected="false">فاکتور <span class="req-pipe-count">۱</span></button>' +
          '<button type="button" class="req-pipe" data-status="paid" role="tab" aria-selected="false">تسویه <span class="req-pipe-count">۱</span></button>' +
        "</div>" +

        '<div class="req-toolbar">' +
          '<div class="cat-search req-search">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4" stroke-linecap="round"/></svg>' +
            '<input id="req-search" type="search" placeholder="شماره معامله، کالا، کارشناس…" aria-label="جستجوی درخواست" />' +
          "</div>" +
          '<p class="cat-result-meta" id="req-result-meta">۵ معامله</p>' +
        "</div>" +

        '<div class="req-layout">' +
          '<section class="dash-card dash-card--table req-table-card" aria-labelledby="req-table-title">' +
            '<div class="dash-card-head">' +
              '<h2 id="req-table-title">فهرست معاملات</h2>' +
            "</div>" +
            '<div class="table-wrap">' +
              '<table class="data-table">' +
                "<thead>" +
                  "<tr>" +
                    "<th>شماره</th>" +
                    "<th>تاریخ</th>" +
                    "<th>خلاصه</th>" +
                    "<th>وضعیت</th>" +
                    "<th>اقدام بعدی</th>" +
                  "</tr>" +
                "</thead>" +
                '<tbody id="req-tbody"></tbody>' +
              "</table>" +
            "</div>" +
          "</section>" +

          '<aside class="dash-card req-detail" id="req-detail" aria-labelledby="req-detail-title">' +
            '<div class="dash-card-head">' +
              '<h2 id="req-detail-title">جزئیات معامله</h2>' +
              '<span class="chip" id="req-detail-status">—</span>' +
            "</div>" +
            '<div id="req-detail-body" class="req-detail-body">' +
              '<p class="muted">یک ردیف را انتخاب کنید.</p>' +
            "</div>" +
          "</aside>" +
        "</div>" +
      "</article>"
    );
  }

  function buildDocuments() {
    return (
      '<article class="content-panel page-documents" data-panel="documents" aria-live="polite">' +
        '<header class="doc-header">' +
          "<div>" +
            '<p class="dash-kicker">مالی و اسناد</p>' +
            '<h1 class="dash-title">اسناد</h1>' +
            '<p class="dash-sub">پیش‌فاکتور، فاکتور و رسید — همه داخل پنل دامون (بدون خروج به سیستم خارجی)</p>' +
          "</div>" +
          '<div class="doc-banner" role="status">' +
            '<span class="doc-banner-dot" aria-hidden="true"></span>' +
            "مشاهده و دانلود داخل پنل · بدون هدایت به Didar" +
          "</div>" +
        "</header>" +

        '<div class="doc-tabs" role="tablist" aria-label="نوع سند">' +
          '<button type="button" class="doc-tab is-active" data-doc-type="all" role="tab" aria-selected="true">همه <span class="req-pipe-count">۴</span></button>' +
          '<button type="button" class="doc-tab" data-doc-type="proforma" role="tab" aria-selected="false">پیش‌فاکتور <span class="req-pipe-count">۲</span></button>' +
          '<button type="button" class="doc-tab" data-doc-type="invoice" role="tab" aria-selected="false">فاکتور <span class="req-pipe-count">۱</span></button>' +
          '<button type="button" class="doc-tab" data-doc-type="receipt" role="tab" aria-selected="false">رسید <span class="req-pipe-count">۱</span></button>' +
        "</div>" +

        '<div class="req-toolbar">' +
          '<div class="cat-search req-search">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4" stroke-linecap="round"/></svg>' +
            '<input id="doc-search" type="search" placeholder="شماره سند یا معامله…" aria-label="جستجوی سند" />' +
          "</div>" +
          '<p class="cat-result-meta" id="doc-result-meta">۴ سند</p>' +
        "</div>" +

        '<div class="doc-layout">' +
          '<section class="dash-card dash-card--table doc-list-card" aria-labelledby="doc-list-title">' +
            '<div class="dash-card-head">' +
              '<h2 id="doc-list-title">فهرست اسناد</h2>' +
            "</div>" +
            '<div class="table-wrap">' +
              '<table class="data-table">' +
                "<thead>" +
                  "<tr>" +
                    "<th>شماره</th>" +
                    "<th>نوع</th>" +
                    "<th>معامله</th>" +
                    "<th>تاریخ</th>" +
                    "<th>مبلغ</th>" +
                    "<th>وضعیت</th>" +
                  "</tr>" +
                "</thead>" +
                '<tbody id="doc-tbody"></tbody>' +
              "</table>" +
            "</div>" +
          "</section>" +

          '<aside class="dash-card doc-preview" id="doc-preview" aria-labelledby="doc-preview-title">' +
            '<div class="dash-card-head">' +
              '<h2 id="doc-preview-title">پیش‌نمایش سند</h2>' +
              '<span class="chip" id="doc-preview-type">—</span>' +
            "</div>" +
            '<div id="doc-preview-body" class="doc-preview-body">' +
              '<p class="muted">یک سند را انتخاب کنید.</p>' +
            "</div>" +
          "</aside>" +
        "</div>" +
      "</article>"
    );
  }

  function buildFinance() {
    return (
      '<article class="content-panel page-finance" data-panel="finance" aria-live="polite">' +
        '<header class="fin-header">' +
          "<div>" +
            '<p class="dash-kicker">مالی و اسناد</p>' +
            '<h1 class="dash-title">مالی</h1>' +
            '<p class="dash-sub">یک دفترکل ساده: مانده، فاکتورهای باز، اعلام پرداخت</p>' +
          "</div>" +
          '<button type="button" class="btn btn-primary" id="fin-focus-pay">اعلام پرداخت</button>' +
        "</header>" +

        '<section class="kpi-grid fin-kpi" aria-label="خلاصه مالی">' +
          '<div class="kpi kpi-static">' +
            '<span class="kpi-label">مانده بدهی</span>' +
            '<span class="kpi-value num">۱۸٫۴۰۰٫۰۰۰</span>' +
            '<span class="kpi-meta kpi-meta--warn">۱ فاکتور باز</span>' +
          "</div>" +
          '<div class="kpi kpi-static">' +
            '<span class="kpi-label">در انتظار تأیید</span>' +
            '<span class="kpi-value">۱</span>' +
            '<span class="kpi-meta">اعلام پرداخت ثبت‌شده</span>' +
          "</div>" +
          '<div class="kpi kpi-static">' +
            '<span class="kpi-label">تسویه‌شده این ماه</span>' +
            '<span class="kpi-value num">۷٫۶۰۰٫۰۰۰</span>' +
            '<span class="kpi-meta">ریال</span>' +
          "</div>" +
          '<div class="kpi kpi-static">' +
            '<span class="kpi-label">اعتبار / سقف</span>' +
            '<span class="kpi-value">فعال</span>' +
            '<span class="kpi-meta">حساب شرکتی تأییدشده</span>' +
          "</div>" +
        "</section>" +

        '<div class="fin-tabs" role="tablist" aria-label="بخش مالی">' +
          '<button type="button" class="fin-tab is-active" data-fin-tab="open" role="tab" aria-selected="true">بدهی‌های باز</button>' +
          '<button type="button" class="fin-tab" data-fin-tab="history" role="tab" aria-selected="false">تاریخچه پرداخت</button>' +
          '<button type="button" class="fin-tab" data-fin-tab="pay" role="tab" aria-selected="false">اعلام پرداخت</button>' +
        "</div>" +

        '<div class="fin-layout">' +
          '<section class="dash-card dash-card--table fin-main" id="fin-main" aria-live="polite"></section>' +
          '<aside class="dash-card fin-side" id="fin-side" aria-live="polite"></aside>' +
        "</div>" +
      "</article>"
    );
  }

  function buildSupport() {
    return (
      '<article class="content-panel page-support" data-panel="support" aria-live="polite">' +
        '<header class="sup-header">' +
          "<div>" +
            '<p class="dash-kicker">پشتیبانی و حساب</p>' +
            '<h1 class="dash-title">پشتیبانی</h1>' +
            '<p class="dash-sub">تیکت فنی، مالی و پیگیری سفارش — گفتگو با کارشناس دامون</p>' +
          "</div>" +
          '<button type="button" class="btn btn-primary" id="sup-new-btn">تیکت جدید</button>' +
        "</header>" +

        '<div class="sup-filters" role="tablist" aria-label="فیلتر تیکت">' +
          '<button type="button" class="sup-filter is-active" data-sup-filter="all" role="tab" aria-selected="true">همه <span class="req-pipe-count">۳</span></button>' +
          '<button type="button" class="sup-filter" data-sup-filter="open" role="tab" aria-selected="false">باز</button>' +
          '<button type="button" class="sup-filter" data-sup-filter="answered" role="tab" aria-selected="false">پاسخ داده‌شده</button>' +
          '<button type="button" class="sup-filter" data-sup-filter="closed" role="tab" aria-selected="false">بسته</button>' +
        "</div>" +

        '<div class="sup-layout" id="sup-layout">' +
          '<section class="dash-card dash-card--table sup-list-card" aria-labelledby="sup-list-title">' +
            '<div class="dash-card-head"><h2 id="sup-list-title">تیکت‌ها</h2></div>' +
            '<div class="table-wrap">' +
              '<table class="data-table">' +
                "<thead><tr><th>کد</th><th>موضوع</th><th>دسته</th><th>معامله</th><th>وضعیت</th><th>بروزرسانی</th></tr></thead>" +
                '<tbody id="sup-tbody"></tbody>' +
              "</table>" +
            "</div>" +
          "</section>" +
          '<aside class="dash-card sup-thread" id="sup-thread" aria-labelledby="sup-thread-title"></aside>' +
        "</div>" +

        '<section class="dash-card sup-compose" id="sup-compose" hidden>' +
          '<div class="dash-card-head"><h2>تیکت جدید</h2><button type="button" class="link-btn" id="sup-compose-cancel">انصراف</button></div>' +
          '<form class="sup-form" id="sup-form">' +
            '<div class="fin-field-row">' +
              '<label class="fin-field">دسته' +
                '<select id="sup-cat">' +
                  '<option value="order">پیگیری سفارش</option>' +
                  '<option value="tech">فنی</option>' +
                  '<option value="finance">مالی</option>' +
                "</select>" +
              "</label>" +
              '<label class="fin-field">معامله مرتبط (اختیاری)' +
                '<select id="sup-deal">' +
                  '<option value="">— بدون معامله —</option>' +
                  '<option value="25489">25489</option>' +
                  '<option value="25430">25430</option>' +
                  '<option value="24305">24305</option>' +
                "</select>" +
              "</label>" +
            "</div>" +
            '<label class="fin-field">موضوع<input id="sup-subject" type="text" placeholder="خلاصه مشکل یا درخواست" required /></label>' +
            '<label class="fin-field">پیام<textarea id="sup-message" rows="4" placeholder="جزئیات را بنویسید…" required></textarea></label>' +
            '<div class="fin-pay-actions">' +
              '<button type="submit" class="btn btn-primary">ارسال تیکت</button>' +
            "</div>" +
            '<p class="fin-form-hint" id="sup-form-hint">پاسخ کارشناس معمولاً در ساعات کاری اعلام می‌شود.</p>' +
          "</form>" +
        "</section>" +
      "</article>"
    );
  }

  function buildPanel(id) {
    if (id === "dashboard") return buildDashboard();
    if (id === "products") return buildProducts();
    if (id === "requests") return buildRequests();
    if (id === "documents") return buildDocuments();
    if (id === "proforma") return buildProforma();
    if (id === "compare") return buildCompare();
    if (id === "finance") return buildFinance();
    if (id === "support") return buildSupport();
    return buildPlaceholder(id);
  }

  var TICKETS = [
    {
      id: "T-1204",
      subject: "سؤال فشار کاری پرشر سوئیچ",
      category: "فنی",
      categoryKey: "tech",
      deal: "25430",
      status: "answered",
      statusLabel: "پاسخ داده‌شده",
      statusClass: "status-follow",
      updated: "۱۴۰۴/۰۸/۱۷",
      messages: [
        { from: "you", name: "شما", text: "سلام، حداکثر فشار قابل تنظیم برای KP چقدر است؟", time: "۱۴۰۴/۰۸/۱۶ · ۱۴:۲۰" },
        { from: "agent", name: "مهندس نوری", text: "سلام، مدل KP تا حدود ۱۶ bar قابل تنظیم است. اگر مشخصات خط را بفرستید دقیق‌تر راهنمایی می‌کنم.", time: "۱۴۰۴/۰۸/۱۷ · ۱۰:۰۵" },
      ],
    },
    {
      id: "T-1198",
      subject: "تأخیر در صدور پیش‌فاکتور ۲۵۴۸۹",
      category: "پیگیری سفارش",
      categoryKey: "order",
      deal: "25489",
      status: "open",
      statusLabel: "باز",
      statusClass: "status-pay",
      updated: "۱۴۰۴/۰۸/۱۸",
      messages: [
        { from: "you", name: "شما", text: "پیش‌فاکتور هنوز نهایی نشده؛ لطفاً وضعیت را اعلام کنید.", time: "۱۴۰۴/۰۸/۱۸ · ۰۹:۱۵" },
      ],
    },
    {
      id: "T-1180",
      subject: "رسید پرداخت I-94",
      category: "مالی",
      categoryKey: "finance",
      deal: "24305",
      status: "closed",
      statusLabel: "بسته",
      statusClass: "status-ok",
      updated: "۱۴۰۴/۰۸/۱۰",
      messages: [
        { from: "you", name: "شما", text: "رسید واریز را ارسال کردم؛ لطفاً تأیید کنید.", time: "۱۴۰۴/۰۸/۰۸ · ۱۶:۴۰" },
        { from: "agent", name: "واحد مالی", text: "رسید دریافت شد. پس از تأیید نهایی وضعیت فاکتور به‌روز می‌شود.", time: "۱۴۰۴/۰۸/۰۹ · ۱۱:۲۰" },
        { from: "agent", name: "واحد مالی", text: "تأیید شد و تیکت بسته شد.", time: "۱۴۰۴/۰۸/۱۰ · ۱۲:۰۰" },
      ],
    },
  ];

  var supFilter = "all";
  var supSelected = "T-1204";

  function filteredTickets() {
    return TICKETS.filter(function (t) {
      if (supFilter === "all") return true;
      return t.status === supFilter;
    });
  }

  function renderSupportThread(id) {
    var thread = document.getElementById("sup-thread");
    if (!thread) return;

    var t = null;
    for (var i = 0; i < TICKETS.length; i++) {
      if (TICKETS[i].id === id) {
        t = TICKETS[i];
        break;
      }
    }
    if (!t) {
      thread.innerHTML = '<p class="muted">تیکتی انتخاب نشده است.</p>';
      return;
    }

    var msgs = t.messages
      .map(function (m) {
        var cls = m.from === "you" ? "sup-msg is-you" : "sup-msg is-agent";
        return (
          '<div class="' + cls + '">' +
            '<div class="sup-msg-head"><strong>' + m.name + "</strong><span>" + m.time + "</span></div>" +
            "<p>" + m.text + "</p>" +
          "</div>"
        );
      })
      .join("");

    thread.innerHTML =
      '<div class="dash-card-head">' +
        '<h2 id="sup-thread-title">' + t.subject + "</h2>" +
        '<span class="status ' + t.statusClass + '">' + t.statusLabel + "</span>" +
      "</div>" +
      '<div class="sup-thread-meta">' +
        '<span class="num">' + t.id + "</span>" +
        "<span>" + t.category + "</span>" +
        (t.deal ? '<button type="button" class="link-btn" data-goto="requests">معامله ' + t.deal + "</button>" : "") +
      "</div>" +
      '<div class="sup-messages">' + msgs + "</div>" +
      (t.status === "closed"
        ? '<p class="muted">این تیکت بسته شده است.</p>'
        : '<form class="sup-reply" id="sup-reply-form">' +
            '<label class="fin-field">پاسخ شما<textarea id="sup-reply-text" rows="3" placeholder="پیام خود را بنویسید…" required></textarea></label>' +
            '<button type="submit" class="btn btn-primary btn-sm">ارسال پاسخ</button>' +
          "</form>");

    var reply = document.getElementById("sup-reply-form");
    if (reply) {
      reply.addEventListener("submit", function (e) {
        e.preventDefault();
        var box = document.getElementById("sup-reply-text");
        var text = (box && box.value || "").trim();
        if (!text) return;
        t.messages.push({
          from: "you",
          name: "شما",
          text: text,
          time: "الان",
        });
        t.updated = "الان";
        t.status = "open";
        t.statusLabel = "باز";
        t.statusClass = "status-pay";
        renderSupportRows();
      });
    }
  }

  function renderSupportRows() {
    var tbody = document.getElementById("sup-tbody");
    if (!tbody) return;

    var rows = filteredTickets();
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="muted" style="padding:20px;text-align:center">تیکتی نیست.</td></tr>';
      document.getElementById("sup-thread").innerHTML = '<p class="muted">موردی برای نمایش نیست.</p>';
      return;
    }

    var visible = false;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].id === supSelected) visible = true;
    }
    if (!visible) supSelected = rows[0].id;

    tbody.innerHTML = rows
      .map(function (t) {
        var selected = t.id === supSelected ? " is-selected" : "";
        return (
          '<tr class="sup-row' + selected + '" data-ticket="' + t.id + '" tabindex="0">' +
            '<td class="num">' + t.id + "</td>" +
            "<td>" + t.subject + "</td>" +
            "<td>" + t.category + "</td>" +
            '<td class="num">' + (t.deal || "—") + "</td>" +
            '<td><span class="status ' + t.statusClass + '">' + t.statusLabel + "</span></td>" +
            "<td>" + t.updated + "</td>" +
          "</tr>"
        );
      })
      .join("");

    renderSupportThread(supSelected);
  }

  function showSupportCompose(show) {
    var compose = document.getElementById("sup-compose");
    var layout = document.getElementById("sup-layout");
    if (!compose || !layout) return;
    compose.hidden = !show;
    layout.hidden = !!show;
  }

  function bindSupport(root) {
    var panel = root.querySelector(".page-support") || root;

    Array.prototype.forEach.call(panel.querySelectorAll(".sup-filter"), function (btn) {
      btn.addEventListener("click", function () {
        Array.prototype.forEach.call(panel.querySelectorAll(".sup-filter"), function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        supFilter = btn.getAttribute("data-sup-filter") || "all";
        showSupportCompose(false);
        renderSupportRows();
      });
    });

    var newBtn = document.getElementById("sup-new-btn");
    if (newBtn) {
      newBtn.addEventListener("click", function () {
        showSupportCompose(true);
      });
    }

    var cancel = document.getElementById("sup-compose-cancel");
    if (cancel) {
      cancel.addEventListener("click", function () {
        showSupportCompose(false);
      });
    }

    var form = document.getElementById("sup-form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var subject = (document.getElementById("sup-subject").value || "").trim();
        var message = (document.getElementById("sup-message").value || "").trim();
        var catSel = document.getElementById("sup-cat");
        var dealSel = document.getElementById("sup-deal");
        var catMap = { order: "پیگیری سفارش", tech: "فنی", finance: "مالی" };
        var id = "T-" + String(1300 + TICKETS.length);
        TICKETS.unshift({
          id: id,
          subject: subject,
          category: catMap[catSel.value] || "فنی",
          categoryKey: catSel.value,
          deal: dealSel.value || "",
          status: "open",
          statusLabel: "باز",
          statusClass: "status-pay",
          updated: "الان",
          messages: [{ from: "you", name: "شما", text: message, time: "الان" }],
        });
        supSelected = id;
        supFilter = "all";
        Array.prototype.forEach.call(panel.querySelectorAll(".sup-filter"), function (b) {
          var on = b.getAttribute("data-sup-filter") === "all";
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-selected", on ? "true" : "false");
        });
        form.reset();
        showSupportCompose(false);
        renderSupportRows();
      });
    }

    panel.addEventListener("click", function (e) {
      var gotoEl = e.target.closest("[data-goto]");
      if (gotoEl) {
        e.preventDefault();
        var target = gotoEl.getAttribute("data-goto");
        if (target) navigate(target);
        return;
      }

      var row = e.target.closest(".sup-row");
      if (!row) return;
      showSupportCompose(false);
      supSelected = row.getAttribute("data-ticket");
      renderSupportRows();
    });

    panel.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var row = e.target.closest(".sup-row");
      if (!row) return;
      e.preventDefault();
      supSelected = row.getAttribute("data-ticket");
      renderSupportRows();
    });

    showSupportCompose(false);
    renderSupportRows();
  }

  var FIN_OPEN = [
    {
      invoice: "I-94",
      deal: "24305",
      date: "۱۴۰۴/۰۶/۲۲",
      due: "۱۴۰۴/۰۷/۰۵",
      amount: "۱۸٫۴۰۰٫۰۰۰",
      status: "پرداخت نشده",
      summary: "اواپراتور و شیرآلات",
    },
  ];

  var FIN_HISTORY = [
    {
      id: "PAY-882",
      deal: "25167",
      date: "۱۴۰۴/۰۸/۰۱",
      amount: "۷٫۶۰۰٫۰۰۰",
      method: "واریز بانکی",
      status: "تأیید شده",
      statusClass: "status-ok",
    },
    {
      id: "PAY-871",
      deal: "24845",
      date: "۱۴۰۴/۰۷/۱۸",
      amount: "۳٫۱۰۰٫۰۰۰",
      method: "چک",
      status: "در انتظار تأیید",
      statusClass: "status-pay",
    },
  ];

  var finTab = "open";

  function renderFinanceOpen() {
    var main = document.getElementById("fin-main");
    var side = document.getElementById("fin-side");
    if (!main || !side) return;

    var rows = FIN_OPEN.map(function (r) {
      return (
        "<tr>" +
          '<td class="num">' + r.invoice + "</td>" +
          '<td class="num">' + r.deal + "</td>" +
          "<td>" + r.summary + "</td>" +
          "<td>" + r.due + "</td>" +
          '<td class="num">' + r.amount + "</td>" +
          '<td><span class="status status-pay">' + r.status + "</span></td>" +
          '<td><button type="button" class="btn btn-primary btn-sm" data-fin-pay="' + r.invoice + '">اعلام پرداخت</button></td>' +
        "</tr>"
      );
    }).join("");

    main.innerHTML =
      '<div class="dash-card-head"><h2>بدهی‌های باز</h2><button type="button" class="link-btn" data-goto="documents">مشاهده فاکتورها</button></div>' +
      '<div class="table-wrap"><table class="data-table">' +
        "<thead><tr><th>فاکتور</th><th>معامله</th><th>شرح</th><th>سررسید</th><th>مبلغ</th><th>وضعیت</th><th></th></tr></thead>" +
        "<tbody>" + rows + "</tbody>" +
      "</table></div>";

    side.innerHTML =
      '<div class="dash-card-head"><h2>راهنمای تسویه</h2></div>' +
      '<ol class="fin-guide">' +
        "<li>فاکتور باز را انتخاب کنید</li>" +
        "<li>مبلغ و روش پرداخت را وارد کنید</li>" +
        "<li>رسید را پیوست و ارسال کنید</li>" +
        "<li>وضعیت «در انتظار تأیید» را در تاریخچه ببینید</li>" +
      "</ol>" +
      '<div class="fin-side-box">' +
        "<strong>بانک مقصد دامون</strong>" +
        '<p class="num">IR12 0560 0000 0000 1234 5678 01</p>' +
        "<span>بانک سامان · به نام هایپرصنعت دامون</span>" +
      "</div>" +
      '<button type="button" class="btn btn-secondary" data-goto="documents">باز کردن فاکتور I-94</button>';
  }

  function renderFinanceHistory() {
    var main = document.getElementById("fin-main");
    var side = document.getElementById("fin-side");
    if (!main || !side) return;

    var rows = FIN_HISTORY.map(function (r) {
      return (
        "<tr>" +
          '<td class="num">' + r.id + "</td>" +
          '<td class="num">' + r.deal + "</td>" +
          "<td>" + r.date + "</td>" +
          '<td class="num">' + r.amount + "</td>" +
          "<td>" + r.method + "</td>" +
          '<td><span class="status ' + r.statusClass + '">' + r.status + "</span></td>" +
        "</tr>"
      );
    }).join("");

    main.innerHTML =
      '<div class="dash-card-head"><h2>تاریخچه پرداخت</h2></div>' +
      '<div class="table-wrap"><table class="data-table">' +
        "<thead><tr><th>کد</th><th>معامله</th><th>تاریخ</th><th>مبلغ</th><th>روش</th><th>وضعیت</th></tr></thead>" +
        "<tbody>" + rows + "</tbody>" +
      "</table></div>";

    side.innerHTML =
      '<div class="dash-card-head"><h2>وضعیت‌ها</h2></div>' +
      '<ul class="fin-status-legend">' +
        '<li><span class="status status-ok">تأیید شده</span> پرداخت در حساب اعمال شده</li>' +
        '<li><span class="status status-pay">در انتظار تأیید</span> رسید دریافت شده، بررسی مالی</li>' +
      "</ul>";
  }

  function renderFinancePay(prefillInvoice) {
    var main = document.getElementById("fin-main");
    var side = document.getElementById("fin-side");
    if (!main || !side) return;

    var inv = prefillInvoice || "I-94";

    main.innerHTML =
      '<div class="dash-card-head"><h2>اعلام پرداخت</h2><span class="chip chip-warn">۳ مرحله</span></div>' +
      '<form class="fin-pay-form" id="fin-pay-form">' +
        '<div class="fin-steps" aria-hidden="true">' +
          '<span class="fin-step is-on">۱ فاکتور</span>' +
          '<span class="fin-step is-on">۲ مبلغ و روش</span>' +
          '<span class="fin-step is-on">۳ رسید</span>' +
        "</div>" +
        '<label class="fin-field">فاکتور / معامله' +
          '<select id="fin-invoice" name="invoice">' +
            '<option value="I-94"' + (inv === "I-94" ? " selected" : "") + '>I-94 · معامله 24305 · ۱۸٫۴۰۰٫۰۰۰ ریال</option>' +
          "</select>" +
        "</label>" +
        '<div class="fin-field-row">' +
          '<label class="fin-field">مبلغ (ریال)<input id="fin-amount" type="text" class="num" value="18400000" inputmode="numeric" /></label>' +
          '<label class="fin-field">تاریخ پرداخت<input id="fin-date" type="text" value="۱۴۰۴/۰۸/۱۸" /></label>' +
        "</div>" +
        '<label class="fin-field">روش پرداخت' +
          '<select id="fin-method">' +
            '<option value="transfer">واریز بانکی</option>' +
            '<option value="cheque">چک</option>' +
          "</select>" +
        "</label>" +
        '<label class="fin-field">شماره پیگیری / سریال چک<input id="fin-ref" type="text" placeholder="مثال: ۱۲۳۴۵۶۷۸۹" /></label>' +
        '<label class="fin-field">پیوست رسید' +
          '<div class="fin-upload">' +
            '<input id="fin-file" type="file" accept=".pdf,.jpg,.png" />' +
            "<span>PDF یا تصویر رسید را انتخاب کنید</span>" +
          "</div>" +
        "</label>" +
        '<div class="fin-pay-actions">' +
          '<button type="submit" class="btn btn-primary">ثبت اعلام پرداخت</button>' +
          '<button type="button" class="btn btn-secondary" data-fin-tab-jump="open">بازگشت به بدهی‌ها</button>' +
        "</div>" +
        '<p class="fin-form-hint" id="fin-form-hint">پس از ثبت، وضعیت در «تاریخچه پرداخت» به صورت در انتظار تأیید دیده می‌شود.</p>' +
      "</form>";

    side.innerHTML =
      '<div class="dash-card-head"><h2>خلاصه انتخاب</h2></div>' +
      '<div class="fin-side-box">' +
        "<strong>فاکتور " + inv + "</strong>" +
        '<p class="num">۱۸٫۴۰۰٫۰۰۰ ریال</p>' +
        "<span>معامله ۲۴۳۰۵ · سررسید ۱۴۰۴/۰۷/۰۵</span>" +
      "</div>" +
      '<div class="fin-side-box">' +
        "<strong>حساب واریز</strong>" +
        '<p class="num">IR12 0560 0000 0000 1234 5678 01</p>' +
        "<span>حتماً شماره فاکتور را در توضیحات واریز بنویسید</span>" +
      "</div>";

    var form = document.getElementById("fin-pay-form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var hint = document.getElementById("fin-form-hint");
        if (hint) {
          hint.textContent = "اعلام پرداخت ثبت شد (موکاپ). وضعیت: در انتظار تأیید مالی دامون.";
          hint.classList.add("is-success");
        }
        FIN_HISTORY.unshift({
          id: "PAY-900",
          deal: "24305",
          date: "۱۴۰۴/۰۸/۱۸",
          amount: "۱۸٫۴۰۰٫۰۰۰",
          method: "واریز بانکی",
          status: "در انتظار تأیید",
          statusClass: "status-pay",
        });
      });
    }
  }

  function renderFinanceTab() {
    if (finTab === "history") renderFinanceHistory();
    else if (finTab === "pay") renderFinancePay();
    else renderFinanceOpen();
  }

  function setFinanceTab(tab) {
    finTab = tab || "open";
    var panel = document.querySelector(".page-finance");
    if (panel) {
      Array.prototype.forEach.call(panel.querySelectorAll(".fin-tab"), function (b) {
        var on = b.getAttribute("data-fin-tab") === finTab;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
    }
    renderFinanceTab();
  }

  function bindFinance(root) {
    var panel = root.querySelector(".page-finance") || root;

    Array.prototype.forEach.call(panel.querySelectorAll(".fin-tab"), function (btn) {
      btn.addEventListener("click", function () {
        setFinanceTab(btn.getAttribute("data-fin-tab") || "open");
      });
    });

    var focusPay = document.getElementById("fin-focus-pay");
    if (focusPay) {
      focusPay.addEventListener("click", function () {
        setFinanceTab("pay");
      });
    }

    panel.addEventListener("click", function (e) {
      var gotoEl = e.target.closest("[data-goto]");
      if (gotoEl) {
        e.preventDefault();
        var target = gotoEl.getAttribute("data-goto");
        if (target) navigate(target);
        return;
      }

      var payBtn = e.target.closest("[data-fin-pay]");
      if (payBtn) {
        setFinanceTab("pay");
        renderFinancePay(payBtn.getAttribute("data-fin-pay"));
        return;
      }

      var jump = e.target.closest("[data-fin-tab-jump]");
      if (jump) {
        setFinanceTab(jump.getAttribute("data-fin-tab-jump") || "open");
      }
    });

    setFinanceTab("open");
  }

  var DOCUMENTS = [
    {
      id: "PF-25489",
      type: "proforma",
      typeLabel: "پیش‌فاکتور",
      deal: "25489",
      date: "۱۴۰۴/۰۸/۱۶",
      amount: "۱۲٫۸۵۰٫۰۰۰",
      status: "آماده بررسی",
      statusClass: "status-quote",
      lines: [
        { name: "بال ولو GBC 6s", qty: "۲", price: "۳٫۲۰۰٫۰۰۰" },
        { name: "بال ولو GBC 12s", qty: "۱", price: "۴٫۱۰۰٫۰۰۰" },
      ],
      note: "معتبر تا ۷ روز · قیمت توافقی پس از تأیید نهایی",
    },
    {
      id: "PF-25430",
      type: "proforma",
      typeLabel: "پیش‌فاکتور",
      deal: "25430",
      date: "۱۴۰۴/۰۸/۱۳",
      amount: "۴٫۲۰۰٫۰۰۰",
      status: "پیش‌نویس",
      statusClass: "status-follow",
      lines: [{ name: "پرشر سوئیچ دانفوس KP", qty: "۱", price: "۴٫۲۰۰٫۰۰۰" }],
      note: "در انتظار تکمیل اطلاعات فنی از سمت مشتری",
    },
    {
      id: "I-94",
      type: "invoice",
      typeLabel: "فاکتور",
      deal: "24305",
      date: "۱۴۰۴/۰۶/۲۲",
      amount: "۱۸٫۴۰۰٫۰۰۰",
      status: "پرداخت نشده",
      statusClass: "status-pay",
      lines: [
        { name: "اواپراتور آسه", qty: "۱", price: "۹٫۵۰۰٫۰۰۰" },
        { name: "بال ولو دانفوس", qty: "۳", price: "۶٫۹۰۰٫۰۰۰" },
        { name: "روغن بیتزر", qty: "۱", price: "۲٫۰۰۰٫۰۰۰" },
      ],
      note: "سررسید پرداخت: ۱۴۰۴/۰۷/۰۵ · قابل اعلام پرداخت از بخش مالی",
      payGoto: "finance",
    },
    {
      id: "R-5512",
      type: "receipt",
      typeLabel: "رسید",
      deal: "25167",
      date: "۱۴۰۴/۰۸/۰۱",
      amount: "۷٫۶۰۰٫۰۰۰",
      status: "تأیید شده",
      statusClass: "status-ok",
      lines: [{ name: "واریز بانکی · معامله ۲۵۱۶۷", qty: "—", price: "۷٫۶۰۰٫۰۰۰" }],
      note: "رسید توسط واحد مالی دامون تأیید شده است",
    },
  ];

  var docFilter = "all";
  var docSelected = "I-94";

  function filteredDocuments() {
    var q = ((document.getElementById("doc-search") || {}).value || "").trim().toLowerCase();
    return DOCUMENTS.filter(function (d) {
      if (docFilter !== "all" && d.type !== docFilter) return false;
      if (!q) return true;
      var hay = (d.id + " " + d.deal + " " + d.typeLabel + " " + d.status).toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  function renderDocPreview(id) {
    var body = document.getElementById("doc-preview-body");
    var typeChip = document.getElementById("doc-preview-type");
    if (!body) return;

    var d = null;
    for (var i = 0; i < DOCUMENTS.length; i++) {
      if (DOCUMENTS[i].id === id) {
        d = DOCUMENTS[i];
        break;
      }
    }
    if (!d) {
      body.innerHTML = '<p class="muted">سندی انتخاب نشده است.</p>';
      if (typeChip) typeChip.textContent = "—";
      return;
    }

    if (typeChip) typeChip.textContent = d.typeLabel;

    var linesHtml = d.lines
      .map(function (l) {
        return (
          "<tr>" +
            "<td>" + l.name + "</td>" +
            '<td class="num">' + l.qty + "</td>" +
            '<td class="num">' + l.price + "</td>" +
          "</tr>"
        );
      })
      .join("");

    var actions =
      '<div class="doc-preview-actions">' +
        '<button type="button" class="btn btn-secondary btn-sm">دانلود PDF</button>' +
        '<button type="button" class="btn btn-secondary btn-sm" data-goto="requests">معامله ' + d.deal + "</button>" +
        (d.payGoto
          ? '<button type="button" class="btn btn-primary btn-sm" data-goto="' + d.payGoto + '">پرداخت / اعلام</button>'
          : "") +
      "</div>";

    body.innerHTML =
      '<div class="doc-sheet">' +
        '<div class="doc-sheet-brand">' +
          "<strong>هایپرصنعت دامون</strong>" +
          "<span>" + d.typeLabel + " · داخل پنل</span>" +
        "</div>" +
        '<div class="doc-sheet-meta">' +
          '<div><span>شماره</span><strong class="num">' + d.id + "</strong></div>" +
          "<div><span>معامله</span><strong class=\"num\">" + d.deal + "</strong></div>" +
          "<div><span>تاریخ</span><strong>" + d.date + "</strong></div>" +
          '<div><span>وضعیت</span><strong><span class="status ' + d.statusClass + '">' + d.status + "</span></strong></div>" +
        "</div>" +
        '<table class="data-table doc-sheet-table">' +
          "<thead><tr><th>شرح</th><th>تعداد</th><th>مبلغ (ریال)</th></tr></thead>" +
          "<tbody>" + linesHtml + "</tbody>" +
        "</table>" +
        '<div class="doc-sheet-total"><span>جمع</span><strong class="num">' + d.amount + " ریال</strong></div>" +
        '<p class="doc-sheet-note">' + d.note + "</p>" +
      "</div>" +
      actions;
  }

  function renderDocRows() {
    var tbody = document.getElementById("doc-tbody");
    var meta = document.getElementById("doc-result-meta");
    if (!tbody) return;

    var rows = filteredDocuments();
    if (meta) meta.textContent = rows.length + " سند";

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="muted" style="padding:20px;text-align:center">سندی یافت نشد.</td></tr>';
      return;
    }

    var visible = false;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].id === docSelected) visible = true;
    }
    if (!visible) docSelected = rows[0].id;

    tbody.innerHTML = rows
      .map(function (d) {
        var selected = d.id === docSelected ? " is-selected" : "";
        return (
          '<tr class="doc-row' + selected + '" data-doc="' + d.id + '" tabindex="0">' +
            '<td class="num">' + d.id + "</td>" +
            "<td>" + d.typeLabel + "</td>" +
            '<td class="num">' + d.deal + "</td>" +
            "<td>" + d.date + "</td>" +
            '<td class="num">' + d.amount + "</td>" +
            '<td><span class="status ' + d.statusClass + '">' + d.status + "</span></td>" +
          "</tr>"
        );
      })
      .join("");

    renderDocPreview(docSelected);
  }

  function bindDocuments(root) {
    var panel = root.querySelector(".page-documents") || root;

    Array.prototype.forEach.call(panel.querySelectorAll(".doc-tab"), function (btn) {
      btn.addEventListener("click", function () {
        Array.prototype.forEach.call(panel.querySelectorAll(".doc-tab"), function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        docFilter = btn.getAttribute("data-doc-type") || "all";
        renderDocRows();
      });
    });

    var search = document.getElementById("doc-search");
    if (search) search.addEventListener("input", renderDocRows);

    panel.addEventListener("click", function (e) {
      var gotoEl = e.target.closest("[data-goto]");
      if (gotoEl) {
        e.preventDefault();
        var target = gotoEl.getAttribute("data-goto");
        if (target) navigate(target);
        return;
      }

      var row = e.target.closest(".doc-row");
      if (!row) return;
      docSelected = row.getAttribute("data-doc");
      renderDocRows();
    });

    panel.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var row = e.target.closest(".doc-row");
      if (!row) return;
      e.preventDefault();
      docSelected = row.getAttribute("data-doc");
      renderDocRows();
    });

    renderDocRows();
  }

  var REQUESTS = [
    {
      id: "25489",
      date: "۱۴۰۴/۰۸/۱۵",
      summary: "شیرآلات دانفوس GBC · ۳ قلم",
      status: "quote",
      statusLabel: "پیش‌فاکتور",
      statusClass: "status-quote",
      next: "بررسی پیش‌فاکتور",
      nextGoto: "documents",
      expert: "مهندس کریمی",
      note: "پیش‌فاکتور صادر شده؛ در انتظار تأیید شما.",
      items: ["GBC 6s ×۲", "GBC 12s ×۱"],
      steps: ["contact", "follow", "quote"],
    },
    {
      id: "25430",
      date: "۱۴۰۴/۰۸/۱۲",
      summary: "پرشر سوئیچ KP · ۱ قلم",
      status: "follow",
      statusLabel: "پیگیری اول",
      statusClass: "status-follow",
      next: "پاسخ به کارشناس",
      nextGoto: null,
      expert: "مهندس نوری",
      note: "کارشناس سؤال فنی درباره فشار کاری پرسیده است.",
      items: ["پرشر سوئیچ دانفوس KP ×۱"],
      steps: ["contact", "follow"],
    },
    {
      id: "24305",
      date: "۱۴۰۴/۰۶/۲۰",
      summary: "اواپراتور و شیرآلات · ۵ قلم",
      status: "invoice",
      statusLabel: "فاکتور / بدهی",
      statusClass: "status-pay",
      next: "اعلام پرداخت",
      nextGoto: "finance",
      expert: "واحد مالی",
      note: "فاکتور I-94 صادر شده · مانده ۱۸٫۴۰۰٫۰۰۰ ریال.",
      items: ["اواپراتور آسه", "بال ولو ×۳", "روغن بیتزر"],
      steps: ["contact", "follow", "quote", "invoice"],
    },
    {
      id: "24874",
      date: "۱۴۰۴/۰۷/۰۴",
      summary: "گاز R404A · ۲ سیلندر",
      status: "contact",
      statusLabel: "ارتباط اولیه",
      statusClass: "status-follow",
      next: "منتظر بررسی دامون",
      nextGoto: null,
      expert: "مهندس کریمی",
      note: "درخواست ثبت شد؛ تخصیص کارشناس در جریان است.",
      items: ["گاز R404A ×۲"],
      steps: ["contact"],
    },
    {
      id: "25167",
      date: "۱۴۰۴/۰۷/۲۸",
      summary: "کندانسور آرشه · ۲ قلم",
      status: "paid",
      statusLabel: "تسویه",
      statusClass: "status-ok",
      next: "—",
      nextGoto: null,
      expert: "واحد مالی",
      note: "تسویه کامل انجام شده است.",
      items: ["کندانسور آرشه هوایی ×۲"],
      steps: ["contact", "follow", "quote", "invoice", "paid"],
    },
  ];

  var reqFilter = "all";
  var reqSelected = "25489";

  var STEP_LABELS = {
    contact: "ارتباط اولیه",
    follow: "پیگیری",
    quote: "پیش‌فاکتور",
    invoice: "فاکتور",
    paid: "تسویه",
  };

  function filteredRequests() {
    var q = ((document.getElementById("req-search") || {}).value || "").trim().toLowerCase();
    return REQUESTS.filter(function (r) {
      if (reqFilter !== "all" && r.status !== reqFilter) return false;
      if (!q) return true;
      var hay = (r.id + " " + r.summary + " " + r.expert + " " + r.statusLabel).toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  function renderRequestDetail(id) {
    var body = document.getElementById("req-detail-body");
    var statusChip = document.getElementById("req-detail-status");
    if (!body) return;

    var r = null;
    for (var i = 0; i < REQUESTS.length; i++) {
      if (REQUESTS[i].id === id) {
        r = REQUESTS[i];
        break;
      }
    }
    if (!r) {
      body.innerHTML = '<p class="muted">معامله‌ای انتخاب نشده است.</p>';
      if (statusChip) statusChip.textContent = "—";
      return;
    }

    if (statusChip) {
      statusChip.textContent = r.statusLabel;
      statusChip.className = "chip " + (r.status === "invoice" ? "chip-warn" : "");
    }

    var stepOrder = ["contact", "follow", "quote", "invoice", "paid"];
    var stepsHtml = stepOrder
      .map(function (s) {
        var done = r.steps.indexOf(s) !== -1 && s !== r.status;
        var current = s === r.status;
        var cls = "pipe-step" + (done ? " is-done" : "") + (current ? " is-current" : "");
        return '<li class="' + cls + '"><span class="pipe-dot"></span><span>' + STEP_LABELS[s] + "</span></li>";
      })
      .join("");

    var actionBtn =
      r.nextGoto
        ? '<button type="button" class="btn btn-primary btn-sm" data-goto="' + r.nextGoto + '">' + r.next + "</button>"
        : r.next !== "—"
          ? '<span class="req-wait">' + r.next + "</span>"
          : '<span class="muted">اقدام باز ندارد</span>';

    body.innerHTML =
      '<div class="req-detail-id num">#' + r.id + "</div>" +
      '<p class="req-detail-summary">' + r.summary + "</p>" +
      '<p class="req-detail-note">' + r.note + "</p>" +
      '<div class="req-detail-meta">' +
        "<div><span>تاریخ</span><strong>" + r.date + "</strong></div>" +
        "<div><span>کارشناس</span><strong>" + r.expert + "</strong></div>" +
      "</div>" +
      '<h3 class="req-detail-h">اقلام</h3>' +
      "<ul class=\"req-items\">" +
        r.items.map(function (it) { return "<li>" + it + "</li>"; }).join("") +
      "</ul>" +
      '<h3 class="req-detail-h">مسیر وضعیت</h3>' +
      '<ol class="pipeline req-mini-pipe">' + stepsHtml + "</ol>" +
      '<div class="req-detail-actions">' + actionBtn +
        '<button type="button" class="btn btn-secondary btn-sm" data-goto="documents">اسناد معامله</button>' +
      "</div>";

    bindPanelActions(body);
  }

  function renderRequestRows() {
    var tbody = document.getElementById("req-tbody");
    var meta = document.getElementById("req-result-meta");
    if (!tbody) return;

    var rows = filteredRequests();
    if (meta) meta.textContent = rows.length + " معامله";

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="muted" style="padding:20px;text-align:center">موردی یافت نشد.</td></tr>';
      return;
    }

    var stillVisible = false;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].id === reqSelected) stillVisible = true;
    }
    if (!stillVisible) reqSelected = rows[0].id;

    tbody.innerHTML = rows
      .map(function (r) {
        var selected = r.id === reqSelected ? " is-selected" : "";
        var nextCell =
          r.nextGoto
            ? '<button type="button" class="link-btn" data-goto="' + r.nextGoto + '">' + r.next + "</button>"
            : '<span class="muted">' + r.next + "</span>";
        return (
          '<tr class="req-row' + selected + '" data-req="' + r.id + '" tabindex="0">' +
            '<td class="num">' + r.id + "</td>" +
            "<td>" + r.date + "</td>" +
            "<td>" + r.summary + "</td>" +
            '<td><span class="status ' + r.statusClass + '">' + r.statusLabel + "</span></td>" +
            "<td>" + nextCell + "</td>" +
          "</tr>"
        );
      })
      .join("");

    renderRequestDetail(reqSelected);
  }

  function bindRequests(root) {
    var panel = root.querySelector(".page-requests") || root;

    Array.prototype.forEach.call(panel.querySelectorAll(".req-pipe"), function (btn) {
      btn.addEventListener("click", function () {
        Array.prototype.forEach.call(panel.querySelectorAll(".req-pipe"), function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        reqFilter = btn.getAttribute("data-status") || "all";
        renderRequestRows();
      });
    });

    var search = document.getElementById("req-search");
    if (search) {
      search.addEventListener("input", renderRequestRows);
    }

    var newBtn = document.getElementById("req-new-blank");
    if (newBtn) {
      newBtn.addEventListener("click", function () {
        navigate("products");
      });
    }

    panel.addEventListener("click", function (e) {
      var gotoEl = e.target.closest("[data-goto]");
      if (gotoEl) {
        e.preventDefault();
        var target = gotoEl.getAttribute("data-goto");
        if (target) navigate(target);
        return;
      }

      var row = e.target.closest(".req-row");
      if (!row) return;
      reqSelected = row.getAttribute("data-req");
      renderRequestRows();
    });

    panel.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var row = e.target.closest(".req-row");
      if (!row) return;
      e.preventDefault();
      reqSelected = row.getAttribute("data-req");
      renderRequestRows();
    });

    renderRequestRows();
  }

  /* Products hierarchy + cart (Damoon nested products UX) */
  function sku(code, name, brand, stockKey) {
    return {
      code: code,
      name: name,
      brand: brand,
      stock: stockKey === "in" ? "موجود" : "کمبود",
      stockKey: stockKey || "in",
      price: "توافقی",
    };
  }

  function bindProducts(root) {
    window.DamoonProducts.bind(root, navigate);
  }

  function setActiveNav(id) {
    navLinks.forEach(function (link) {
      if (link.getAttribute("data-nav") === id) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function bindPanelActions(root) {
    Array.prototype.forEach.call(root.querySelectorAll("[data-goto]"), function (el) {
      el.addEventListener("click", function () {
        var target = el.getAttribute("data-goto");
        if (target) navigate(target);
      });
    });
  }

  function navigate(id) {
    var route = getRoute(id);
    var current = stage.querySelector(".content-panel");

    setActiveNav(id);
    document.title = route.docTitle;
    try {
      history.replaceState(null, "", "#" + id);
    } catch (e) {
      /* ignore */
    }

    if (fadeTimer) {
      clearTimeout(fadeTimer);
      fadeTimer = null;
    }

    function mount() {
      try {
        stage.innerHTML = buildPanel(id);
        bindPanelActions(stage);
        if (id === "products") bindProducts(stage);
        if (id === "requests") bindRequests(stage);
        if (id === "documents") bindDocuments(stage);
        if (id === "proforma") bindProforma(stage);
        if (id === "compare") bindCompare(stage);
        if (id === "finance") bindFinance(stage);
        if (id === "support") bindSupport(stage);
        if (window.DamoonProducts && typeof window.DamoonProducts.syncCompareDock === "function") {
          window.DamoonProducts.syncCompareDock();
        }
      } catch (err) {
        console.error("Failed to mount panel:", id, err);
        stage.innerHTML = buildPlaceholder(id);
      }
    }

    if (current) {
      current.classList.add("is-leaving");
      fadeTimer = setTimeout(function () {
        mount();
        fadeTimer = null;
      }, 120);
    } else {
      mount();
    }

    closeDrawer();
  }

  function setCollapsed(collapsed) {
    shell.classList.toggle("is-collapsed", collapsed);
    if (collapseBtn) {
      collapseBtn.setAttribute("aria-expanded", collapsed ? "false" : "true");
      collapseBtn.setAttribute(
        "aria-label",
        collapsed ? "باز کردن نوار کناری" : "جمع کردن نوار کناری"
      );
      collapseBtn.title = collapsed ? "باز کردن نوار کناری" : "جمع کردن نوار کناری";
    }
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch (e) {
      /* ignore */
    }
  }

  function readCollapsed() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function openDrawer() {
    shell.classList.add("is-drawer-open");
    if (backdrop) {
      backdrop.classList.add("is-visible");
      backdrop.hidden = false;
    }
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "true");
  }

  function closeDrawer() {
    shell.classList.remove("is-drawer-open");
    if (backdrop) {
      backdrop.classList.remove("is-visible");
      backdrop.hidden = true;
    }
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
  }

  function toggleDrawer() {
    if (shell.classList.contains("is-drawer-open")) closeDrawer();
    else openDrawer();
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var id = link.getAttribute("data-nav");
      if (!id) return;
      if (id === "support") {
        if (window.DamoonChatbot && typeof window.DamoonChatbot.open === "function") {
          window.DamoonChatbot.open();
        }
        navigate("support");
        return;
      }
      navigate(id);
    });
  });

  if (collapseBtn) {
    collapseBtn.addEventListener("click", function () {
      setCollapsed(!shell.classList.contains("is-collapsed"));
    });
  }

  if (menuToggle) menuToggle.addEventListener("click", toggleDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDrawer();
  });

  /* ── Products mega-menu (sidebar hover) ── */

  function megaImgIcon(src) {
    return (
      '<img src="' +
      src +
      '" alt="" width="22" height="22" loading="lazy" decoding="async" />'
    );
  }

  var MEGA_ICONS = {
    valves: megaImgIcon("assets/menu-icons/valves.png"),
    coldroom: megaImgIcon("assets/menu-icons/coldroom.png"),
    compressor: megaImgIcon("assets/menu-icons/compressor.png"),
    control: megaImgIcon("assets/menu-icons/control.png"),
    condenser: megaImgIcon("assets/menu-icons/condenser.png"),
    consumables: megaImgIcon("assets/menu-icons/consumables.png"),
  };

  var MEGA_GROUP_ICONS = {
    ball: "assets/menu-icons/ball-valve.png",
    check: "assets/menu-icons/check-valve.png",
    solenoid: "assets/menu-icons/solenoid.png",
    hand: "assets/menu-icons/hand-valve.png",
    exp: "assets/menu-icons/exp-valve.png",
    evap: "assets/menu-icons/evaporator.png",
    cond: "assets/menu-icons/condenser-unit.png",
    "cr-cu": "assets/menu-icons/condenser-unit.png",
    gas: "assets/menu-icons/gas.png",
    oil: "assets/menu-icons/oil.png",
    pressure: "assets/menu-icons/pressure.png",
    thermo: "assets/menu-icons/thermo.png",
    gauge: "assets/menu-icons/pressure.png",
    bitzer: "assets/menu-icons/bitzer.png",
    "danfoss-c": "assets/menu-icons/danfoss.png",
    copeland: "assets/menu-icons/copeland.png",
  };

  function initProductsMegaMenu() {
    var mega = document.getElementById("prod-mega");
    var catsEl = document.getElementById("prod-mega-cats");
    var subEl = document.getElementById("prod-mega-sub");
    var brandsEl = document.getElementById("prod-mega-brands");
    var trigger = document.getElementById("nav-products-trigger");
    var host = document.getElementById("nav-products-mega");
    if (!mega || !catsEl || !subEl || !brandsEl || !trigger || !host) return;
    if (!window.DamoonProducts || !window.DamoonProducts.getMegaMenuData) return;

    var data = window.DamoonProducts.getMegaMenuData();
    var activeCat = data[0] && data[0].id;
    var activeBrands = null;
    var hideTimer = null;
    var open = false;

    function findCat(id) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].id === id) return data[i];
      }
      return null;
    }

    function renderCats() {
      catsEl.innerHTML = data
        .map(function (cat) {
          var icon = MEGA_ICONS[cat.id] || MEGA_ICONS.valves;
          return (
            '<li class="prod-mega-cat' + (cat.id === activeCat ? " is-active" : "") + '">' +
              '<button type="button" class="prod-mega-cat-btn" data-mega-cat="' + cat.id + '" role="menuitem">' +
                '<span class="prod-mega-cat-ico" aria-hidden="true">' + icon + "</span>" +
                "<span>" + cat.name + "</span>" +
              "</button>" +
            "</li>"
          );
        })
        .join("");
    }

    function renderBrands(brands) {
      var list = brands || [];
      if (!list.length) {
        brandsEl.innerHTML = "";
        brandsEl.hidden = true;
        return;
      }
      brandsEl.hidden = false;
      brandsEl.innerHTML =
        '<div class="prod-mega-brands-list">' +
        list
          .map(function (b) {
            if (b.logo) {
              return (
                '<button type="button" class="prod-mega-brand" title="' +
                b.name +
                '" aria-label="' +
                b.name +
                '">' +
                '<img src="' +
                b.logo +
                '" alt="' +
                b.name +
                '" width="64" height="32" loading="lazy" decoding="async" />' +
                "</button>"
              );
            }
            return (
              '<button type="button" class="prod-mega-brand is-text" title="' +
              b.name +
              '">' +
              b.name +
              "</button>"
            );
          })
          .join("") +
        "</div>" +
        '<div class="prod-mega-brands-label">برندها</div>';
    }

    function syncBrandsForCat(cat) {
      activeBrands = (cat && cat.brands) || [];
      renderBrands(activeBrands);
    }

    function renderCategoryBranch(node, depth) {
      var gIcon = depth === 0 ? MEGA_GROUP_ICONS[node.id] : "";
      var kids = node.children || [];
      var html = "";

      if (depth === 0) {
        html +=
          '<section class="prod-mega-col' +
          (kids.length ? "" : " is-leaf") +
          '">';
        html +=
          '<a href="#products" class="prod-mega-col-title' +
          (gIcon ? " has-icon" : "") +
          '" data-mega-node="' +
          node.id +
          '" data-mega-brands="' +
          node.id +
          '">' +
          (gIcon
            ? '<img class="prod-mega-link-ico" src="' +
              gIcon +
              '" alt="" width="28" height="28" loading="lazy" decoding="async" />'
            : "") +
          "<span>" +
          node.name +
          "</span>" +
          "</a>";

        if (kids.length) {
          html += '<ul class="prod-mega-col-list">';
          kids.forEach(function (child) {
            html += renderCategoryBranch(child, depth + 1);
          });
          html += "</ul>";
        }
        html += "</section>";
        return html;
      }

      var childIcon = MEGA_GROUP_ICONS[node.id];
      html +=
        '<li class="prod-mega-level' +
        (kids.length ? " has-children" : "") +
        '">' +
        '<a href="#products" class="prod-mega-link' +
        (childIcon ? " has-icon" : "") +
        '" data-mega-node="' +
        node.id +
        '" data-mega-brands="' +
        node.id +
        '">' +
        (childIcon
          ? '<img class="prod-mega-link-ico" src="' +
            childIcon +
            '" alt="" width="22" height="22" loading="lazy" decoding="async" />'
          : "") +
        "<span>" +
        node.name +
        "</span>" +
        "</a>";

      if (kids.length) {
        html += '<ul class="prod-mega-nested">';
        kids.forEach(function (child) {
          html += renderCategoryBranch(child, depth + 1);
        });
        html += "</ul>";
      }

      html += "</li>";
      return html;
    }

    function renderSub() {
      var cat = findCat(activeCat);
      if (!cat) {
        subEl.innerHTML = "";
        renderBrands([]);
        return;
      }

      var groups = cat.groups || [];
      if (!groups.length) {
        subEl.innerHTML =
          '<section class="prod-mega-col">' +
            '<a href="#products" class="prod-mega-col-title" data-mega-node="' +
            cat.id +
            '">مشاهده همهٔ ' +
            cat.name +
            "</a>" +
          "</section>";
        syncBrandsForCat(cat);
        return;
      }

      subEl.innerHTML = groups
        .map(function (group) {
          return renderCategoryBranch(group, 0);
        })
        .join("");
      syncBrandsForCat(cat);
    }

    function positionMega() {
      var rect = host.getBoundingClientRect();
      var panel = mega.querySelector(".prod-mega-panel");
      var top = Math.max(12, Math.min(rect.top, window.innerHeight - 380));
      mega.style.top = top + "px";
      mega.style.right = Math.max(8, window.innerWidth - rect.left + 6) + "px";
      mega.style.left = "auto";
      if (panel) {
        var maxW = Math.min(880, Math.max(420, rect.left - 24));
        panel.style.width = maxW + "px";
      }
    }

    function showMega() {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      open = true;
      renderCats();
      renderSub();
      positionMega();
      mega.hidden = false;
      mega.setAttribute("aria-hidden", "false");
      mega.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      host.classList.add("is-mega-open");
    }

    function hideMega() {
      open = false;
      mega.classList.remove("is-open");
      mega.hidden = true;
      mega.setAttribute("aria-hidden", "true");
      trigger.setAttribute("aria-expanded", "false");
      host.classList.remove("is-mega-open");
    }

    function scheduleHide() {
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(hideMega, 180);
    }

    function goToNode(nodeId) {
      if (window.DamoonProducts && window.DamoonProducts.openCategory) {
        window.DamoonProducts.openCategory(nodeId);
      }
      hideMega();
      navigate("products");
    }

    host.addEventListener("mouseenter", showMega);
    host.addEventListener("mouseleave", scheduleHide);
    mega.addEventListener("mouseenter", function () {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
    });
    mega.addEventListener("mouseleave", scheduleHide);

    trigger.addEventListener("focus", showMega);
    trigger.addEventListener("keydown", function (e) {
      if (e.key === "Escape") hideMega();
      if ((e.key === "ArrowLeft" || e.key === "ArrowDown") && !open) {
        e.preventDefault();
        showMega();
      }
    });

    catsEl.addEventListener("mouseover", function (e) {
      var btn = e.target.closest("[data-mega-cat]");
      if (!btn) return;
      var id = btn.getAttribute("data-mega-cat");
      if (id && id !== activeCat) {
        activeCat = id;
        renderCats();
        renderSub();
      }
    });

    subEl.addEventListener("mouseover", function (e) {
      var link = e.target.closest("[data-mega-brands]");
      var cat = findCat(activeCat);
      if (!cat) return;
      if (link) {
        var gid = link.getAttribute("data-mega-brands");
        var group = null;
        for (var i = 0; i < (cat.groups || []).length; i++) {
          if (cat.groups[i].id === gid) {
            group = cat.groups[i];
            break;
          }
        }
        renderBrands((group && group.brands && group.brands.length ? group.brands : cat.brands) || []);
      } else if (!e.target.closest("[data-mega-node]")) {
        syncBrandsForCat(cat);
      }
    });

    subEl.addEventListener("mouseleave", function () {
      syncBrandsForCat(findCat(activeCat));
    });

    catsEl.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-mega-cat]");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      goToNode(btn.getAttribute("data-mega-cat"));
    });

    subEl.addEventListener("click", function (e) {
      var link = e.target.closest("[data-mega-node]");
      if (!link) return;
      e.preventDefault();
      e.stopPropagation();
      goToNode(link.getAttribute("data-mega-node"));
    });

    window.addEventListener("resize", function () {
      if (open) positionMega();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && open) hideMega();
    });
  }

  function initHeadMenus() {
    var cart = document.getElementById("head-cart");
    var account = document.getElementById("head-account");
    if (!cart && !account) return;

    function closeAll(except) {
      if (cart && except !== cart) {
        cart.classList.remove("is-open");
        var cartDrop = cart.querySelector(".head-cart-dropdown");
        if (cartDrop) cartDrop.hidden = true;
      }
      if (account && except !== account) {
        account.classList.remove("is-open");
        var menu = account.querySelector(".head-account-menu");
        var btn = account.querySelector(".head-account-btn");
        if (menu) menu.hidden = true;
        if (btn) btn.setAttribute("aria-expanded", "false");
      }
    }

    if (cart) {
      var cartBtn = cart.querySelector(".head-cart-btn");
      var cartDrop = cart.querySelector(".head-cart-dropdown");
      if (cartBtn && cartDrop) {
        cartBtn.addEventListener("click", function (e) {
          e.preventDefault();
          var open = !cart.classList.contains("is-open");
          closeAll(cart);
          cart.classList.toggle("is-open", open);
          cartDrop.hidden = !open;
        });
      }
    }

    if (account) {
      var accountBtn = account.querySelector(".head-account-btn");
      var accountMenu = account.querySelector(".head-account-menu");
      if (accountBtn && accountMenu) {
        accountBtn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          var open = accountMenu.hidden;
          closeAll(account);
          account.classList.toggle("is-open", open);
          accountMenu.hidden = !open;
          accountBtn.setAttribute("aria-expanded", open ? "true" : "false");
        });
      }
    }

    document.addEventListener("click", function (e) {
      if (e.target.closest("#head-cart") || e.target.closest("#head-account")) return;
      closeAll(null);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAll(null);
    });
  }

  function initChatbot() {
    var root = document.getElementById("damoon-chatbot");
    if (!root) return;

    var fab = document.getElementById("chatbot-fab");
    var panel = root.querySelector(".chatbot-panel");
    var closeBtn = document.getElementById("chatbot-close");
    var form = document.getElementById("chatbot-form");
    var input = document.getElementById("chatbot-input");
    var messages = document.getElementById("chatbot-messages");
    var replyTimer = null;

    function isOpen() {
      return root.getAttribute("data-open") === "true";
    }

    function setOpen(open) {
      root.setAttribute("data-open", open ? "true" : "false");
      if (panel) panel.hidden = !open;
      if (fab) fab.setAttribute("aria-expanded", open ? "true" : "false");
      if (open && input) {
        setTimeout(function () {
          try {
            if (typeof input.focus === "function") {
              input.focus({ preventScroll: true });
            }
          } catch (err) {
            try { input.focus(); } catch (err2) {}
          }
        }, 40);
      }
    }

    function appendMsg(text, fromYou) {
      if (!messages) return;
      var div = document.createElement("div");
      div.className = "chatbot-msg " + (fromYou ? "is-you" : "is-bot");
      var p = document.createElement("p");
      p.textContent = text;
      div.appendChild(p);
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    function botReply(userText) {
      var lower = (userText || "").toLowerCase();
      var reply =
        "پیام شما ثبت شد. تیم فروش دامون به‌زودی پاسخ می‌دهد. برای پیگیری تیکت‌ها به بخش پشتیبانی مراجعه کنید.";
      if (/قیمت|استعلام|پیش.?فاکتور|فاکتور/.test(lower)) {
        reply = "برای استعلام قیمت یا صدور پیش‌فاکتور، کد کالا یا لیست محصولات را بفرستید تا کارشناس فروش دامون پیگیری کند.";
      } else if (/سفارش|وضعیت|پیگیری/.test(lower)) {
        reply = "وضعیت سفارش‌ها را از «درخواست‌ها» و اسناد را از بخش «اسناد» ببینید. اگر کد درخواست دارید همین‌جا ارسال کنید.";
      } else if (/سلام|درود|hi|hello/.test(lower)) {
        reply = "سلام! چطور می‌توانم کمکتان کنم؟ استعلام قیمت، پیش‌فاکتور یا پیگیری سفارش.";
      }
      appendMsg(reply, false);
    }

    if (fab) {
      fab.addEventListener("click", function () {
        setOpen(!isOpen());
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        setOpen(false);
      });
    }

    if (form && input) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var text = (input.value || "").trim();
        if (!text) return;
        appendMsg(text, true);
        input.value = "";
        if (replyTimer) clearTimeout(replyTimer);
        replyTimer = setTimeout(function () {
          botReply(text);
        }, 650);
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) setOpen(false);
    });

    window.DamoonChatbot = {
      open: function (seedText) {
        setOpen(true);
        if (seedText && input) {
          input.value = String(seedText);
          setTimeout(function () {
            try {
              if (typeof input.focus === "function") {
                input.focus({ preventScroll: true });
              }
              if (typeof input.setSelectionRange === "function") {
                var len = input.value.length;
                input.setSelectionRange(len, len);
              }
            } catch (err) {}
          }, 50);
        }
      },
      close: function () { setOpen(false); },
      toggle: function () { setOpen(!isOpen()); },
    };
  }

  setCollapsed(readCollapsed());
  initProductsMegaMenu();
  initHeadMenus();
  initChatbot();
  if (window.DamoonProducts && typeof window.DamoonProducts.setNavigate === "function") {
    window.DamoonProducts.setNavigate(navigate);
  }
  if (window.DamoonProducts && typeof window.DamoonProducts.syncCompareDock === "function") {
    window.DamoonProducts.syncCompareDock();
  }
  var start =
    (location.hash || "").replace(/^#/, "") ||
    "products";
  if (!ROUTES[start]) start = "products";
  if (start === "support" && window.DamoonChatbot) {
    window.DamoonChatbot.open();
  }
  navigate(start);
})();
