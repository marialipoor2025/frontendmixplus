/**
 * Damoon Products — Barghchi-style category archive
 * Breadcrumb + filters sidebar + product grid / price list + request basket
 */
(function (global) {
  "use strict";

  var TREE = [
    {
      id: "valves",
      name: "شیرآلات",
      count: 20,
      desc: "قبل از ثبت درخواست، با تیم فروش دامون هماهنگ کنید. استعلام قیمت پروژه‌ای، اصالت کالا و آماده‌سازی پیش‌فاکتور برای شیرآلات برودتی.",
      children: [
        { id: "ball", name: "بال ولو", count: 12, skus: [
            { code: "1456901", name: "بال ولو 1/2 جوشی دانفوس سری GBC 12s", brand: "دانفوس", stock: "in", price: 61735000, hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/danfoss-shut-off-ball-valve-gbc-12s-solder-1-2-2.jpg" },
            { code: "1456102", name: "بال ولو 7/8 جوشی دانفوس سری  GBC 22s", brand: "دانفوس", stock: "in", price: "توافقی", hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/danfoss-shut-off-ball-valve-gbc-22s-solder-7-8-2.jpg" },
            { code: "1455703", name: "بال ولو 5/8 جوشی دانفوس سری GBC 16s", brand: "دانفوس", stock: "in", price: "توافقی", hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/danfoss-shut-off-ball-valve-gbc-16s-solder-5-8-2.jpg" },
            { code: "1455304", name: "بال ولو 5/8 2 جوشی دانفوس سری GBC 67s", brand: "دانفوس", stock: "in", price: 25471000, hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/danfoss-shut-off-ball-valve-gbc-67s-solder-2-5-8-2.jpg" },
            { code: "1453405", name: "بال ولو 5/8 1 جوشی دانفوس سری GBC 42s", brand: "دانفوس", stock: "in", price: 699000, discount: 20, hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/danfoss-shut-off-ball-valve-gbc-42s-solder-1-5-8-2.jpg" },
            { code: "1452406", name: "بال ولو 3/8 جوشی دانفوس سری GBC 10s", brand: "دانفوس", stock: "in", price: 1788000, hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/danfoss-shut-off-ball-valve-gbc-10s-solder-3-8-2.jpg" },
            { code: "1447707", name: "بال ولو 3/8 1 جوشی دانفوس سری GBC 35s", brand: "دانفوس", stock: "in", price: "توافقی", hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/danfoss-shut-off-ball-valve-gbc-35s-solder-1-3-8-2.jpg" },
            { code: "1447108", name: "بال ولو 3/4 جوشی دانفوس سری GBC 18s", brand: "دانفوس", stock: "in", price: "توافقی", hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/danfoss-shut-off-ball-valve-gbc-18s-solder-3-4-3.jpg" },
            { code: "1446409", name: "بال ولو 1/8 3 جوشی دانفوس سری GBC 79s", brand: "دانفوس", stock: "in", price: "توافقی", hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/danfoss-shut-off-ball-valve-gbc-79s-solder-3-1-8-3.jpg" },
            { code: "1445410", name: "بال ولو 1/8 2 جوشی دانفوس سری GBC 54s", brand: "دانفوس", stock: "in", price: "توافقی", hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/danfoss-shut-off-ball-valve-gbc-54s-solder-2-1-8-2.jpg" },
            { code: "1442011", name: "بال ولو 1/4 جوشی دانفوس سری GBC 6s", brand: "دانفوس", stock: "in", price: "توافقی", hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/danfoss-shut-off-ball-valve-gbc-6s-solder-1-4-2.jpg" },
            { code: "1442412", name: "بال ولو 1/8 1 جوشی دانفوس سری GBC 28s", brand: "دانفوس", stock: "in", price: 2142000, discount: 25, hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/danfoss-shut-off-ball-valve-gbc-28s-solder-1-1-8-2.jpg" }
        ]},
        { id: "solenoid", name: "شیر برقی", count: 8, skus: [
            { code: "4245813", name: "بوبین کابلی ۲۲۰ ولت دانفوس دانمارک", brand: "دانفوس", stock: "in", price: 6668000, discount: 15, hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/danfoss-220v-solenoidcoil-cable-main.png" },
            { code: "4245314", name: "بوبین شیر برقی ۲۴ ولت DC دانفوس", brand: "دانفوس", stock: "in", price: 1720000, discount: 20, hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/danfoss-24v-solenoidcoil-terminalbox-dc.jpg" },
            { code: "4244915", name: "بوبین شیر برقی ۲۴ ولت AC دانفوس", brand: "دانفوس", stock: "in", price: 6569000, hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/danfoss-24v-solenoidcoil-terminalbox-ac-main.png" },
            { code: "4244016", name: "بوبین سوکتی ۲۲۰ ولت دانفوس دانمارک", brand: "دانفوس", stock: "in", price: 63856000, hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/danfoss-220v-solenoidcoil-terminalbox-main.png" },
            { code: "4244517", name: "بوبین شیر برقی ۱۲ ولت DC دانفوس", brand: "دانفوس", stock: "in", price: "توافقی", hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/danfoss-220v-solenoidcoil-terminalbox-main-1.png" },
            { code: "1414918", name: "شیر برقی 7/8 جوشی دانفوس سری EVR20", brand: "دانفوس", stock: "in", price: 30726000, hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/danfoss-solenoid-valve-evr20-solder-7-8.jpg" },
            { code: "1414419", name: "شیر برقی 7/8 جوشی دانفوس سری EVR15", brand: "دانفوس", stock: "in", price: 9075000, discount: 15, hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/danfoss-solenoid-valve-evr15-solder-7-8-1.jpg" },
            { code: "1414020", name: "شیر برقی 5/8 مهره ای دانفوس سری EVR15", brand: "دانفوس", stock: "in", price: 1353000, hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/danfoss-solenoid-valve-evr15-flare-5-8.jpg" }
        ]}
      ],
    },
    {
      id: "coldroom",
      name: "سردخانه",
      count: 20,
      desc: "تجهیزات سردخانه پروژه‌ای؛ استعلام قیمت برای کارفرمایان و پیمانکاران از تیم فروش دامون.",
      children: [
        { id: "cr-cu", name: "کندانسینگ یونیت", count: 20, skus: [
            { code: "4351301", name: "کندانسینگ یونیت 6FE-50-40P/ACS-663B آسه", brand: "آسه", stock: "in", price: 23655000, hue: 175, image: "https://www.damoon-co.com/wp-content/uploads/6FE-50Y-40P-ACS-663B-1.webp" },
            { code: "4347302", name: "کندانسینگ یونیت 4NE-20-40P/ACS-450B آسه", brand: "آسه", stock: "in", price: "توافقی", hue: 175, image: "https://www.damoon-co.com/wp-content/uploads/4NE-20-40P-ACS-450B.webp" },
            { code: "4351603", name: "کندانسینگ یونیت 6GE-40-40P/ACS-663A آسه", brand: "آسه", stock: "in", price: "توافقی", hue: 175, image: "https://www.damoon-co.com/wp-content/uploads/6GE-40-40P-ACS-663A.webp" },
            { code: "4351004", name: "کندانسینگ یونیت 6FE-50Y-40P/ACS-663B آسه", brand: "آسه", stock: "in", price: 88484000, discount: 25, hue: 175, image: "https://www.damoon-co.com/wp-content/uploads/6FE-50Y-40P-ACS-663B.webp" },
            { code: "4350805", name: "کندانسینگ یونیت 8GE-60-40P/ACS-663C آسه", brand: "آسه", stock: "in", price: "توافقی", hue: 175, image: "https://www.damoon-co.com/wp-content/uploads/8GE-60-40P-ACS-663C.webp" },
            { code: "4350606", name: "کندانسینگ یونیت 8GE-60Y-40P/ACS-663C آسه", brand: "آسه", stock: "in", price: 11686000, discount: 12, hue: 175, image: "https://www.damoon-co.com/wp-content/uploads/8GE-60Y-40P-ACS-663C.webp" },
            { code: "4350407", name: "کندانسینگ یونیت 4GE-30-40P/ACS-463B آسه", brand: "آسه", stock: "in", price: "توافقی", hue: 175, image: "https://www.damoon-co.com/wp-content/uploads/4GE-30-40P-ACS-463B.webp" },
            { code: "4350208", name: "کندانسینگ یونیت 4FE-35-40P/ACS-463C آسه", brand: "آسه", stock: "in", price: 1260000, discount: 10, hue: 175, image: "https://www.damoon-co.com/wp-content/uploads/4FE-35-40P-ACS-463C.webp" },
            { code: "4350009", name: "کندانسینگ یونیت 6JE-33-40P/ACS-463B آسه", brand: "آسه", stock: "in", price: 1299000, hue: 175, image: "https://www.damoon-co.com/wp-content/uploads/6JE-33-40P-ACS-463B.webp" },
            { code: "4349810", name: "کندانسینگ یونیت 6HE-35-40P/ACS-463C آسه", brand: "آسه", stock: "in", price: 6340000, discount: 12, hue: 175, image: "https://www.damoon-co.com/wp-content/uploads/6HE-35-40P-ACS-463C.webp" },
            { code: "4349611", name: "کندانسینگ یونیت 4GE-30Y-40P/ACS-463B آسه", brand: "آسه", stock: "in", price: "توافقی", hue: 175, image: "https://www.damoon-co.com/wp-content/uploads/4GE-30Y-40P-ACS-463B.webp" },
            { code: "4349412", name: "کندانسینگ یونیت 4FE-35Y-40P/ACS-463B آسه", brand: "آسه", stock: "in", price: 90172000, discount: 10, hue: 175, image: "https://www.damoon-co.com/wp-content/uploads/4FE-35Y-40P-ACS-463B.webp" },
            { code: "4349113", name: "کندانسینگ یونیت 6JE-33Y-40P/ACS-463B آسه", brand: "آسه", stock: "in", price: "توافقی", hue: 175, image: "https://www.damoon-co.com/wp-content/uploads/6JE-33Y-40P-ACS-463B.webp" },
            { code: "4348914", name: "کندانسینگ یونیت 6HE-35Y-40P/ACS-463C آسه", brand: "آسه", stock: "in", price: 62019000, hue: 175, image: "https://www.damoon-co.com/wp-content/uploads/6HE-35Y-40P-ACS-463C.webp" },
            { code: "4348715", name: "کندانسینگ یونیت 6GE-40Y-40P/ACS-463C آسه", brand: "آسه", stock: "in", price: "توافقی", hue: 175, image: "https://www.damoon-co.com/wp-content/uploads/6GE-40Y-40P-ACS-463C.webp" },
            { code: "4348316", name: "کندانسینگ یونیت 6FE-44-40P/ACS-463B آسه", brand: "آسه", stock: "in", price: 1208000, hue: 175, image: "https://www.damoon-co.com/wp-content/uploads/6FE-44-40P-ACS-463B.webp" },
            { code: "4348117", name: "کندانسینگ یونیت 6FE-50Y-40P/ACS-463B آسه", brand: "آسه", stock: "in", price: 764000, hue: 175, image: "https://www.damoon-co.com/wp-content/uploads/6FE-50Y-40P-ACS-463B.webp" },
            { code: "4347918", name: "کندانسینگ یونیت 6FE-44Y-40P/ACS-463B آسه", brand: "آسه", stock: "in", price: "توافقی", hue: 175, image: "https://www.damoon-co.com/wp-content/uploads/6FE-44Y-40P-ACS-463B.webp" },
            { code: "4347719", name: "کندانسینگ یونیت S6F-30.2-40P/ACS -463B آسه", brand: "آسه", stock: "in", price: "توافقی", hue: 175, image: "https://www.damoon-co.com/wp-content/uploads/S6F-30.2-40P-ACS-463B.webp" },
            { code: "4347420", name: "کندانسینگ یونیت S6F-30.2Y-40P/ACS -463B آسه", brand: "آسه", stock: "in", price: 273000, discount: 10, hue: 175, image: "https://www.damoon-co.com/wp-content/uploads/S6F-30.2Y-40P-ACS-463B.webp" }
        ]}
      ],
    },
    {
      id: "compressor",
      name: "کمپرسور تبرید",
      count: 20,
      desc: "کمپرسورهای برودتی با امکان استعلام سریع و صدور پیش‌فاکتور.",
      children: [
        { id: "bitzer", name: "کمپرسور بیتزر", count: 12, skus: [
            { code: "4392001", name: "کمپرسور پیستونی ۳۰ اسب بخار سه فاز بیتزر مدل 6JE-33Y", brand: "بیتزر", stock: "in", price: 1787000, discount: 18, hue: 35, image: "https://www.damoon-co.com/wp-content/uploads/bitzer-4ve-7-reciprocating-compressor-3-1.jpg" },
            { code: "3877802", name: "کمپرسور دو مرحله ای 5 اسب بخار سه فاز بیتزر مدل S4T-5.2Y", brand: "بیتزر", stock: "in", price: "توافقی", hue: 35, image: "https://www.damoon-co.com/wp-content/uploads/bitzer-s4t-5-2y-stage-2-compressor.jpg" },
            { code: "3877403", name: "کمپرسور دو مرحله ای 8 اسب بخار سه فاز بیتزر مدل S4N-8.2Y", brand: "بیتزر", stock: "in", price: "توافقی", hue: 35, image: "https://www.damoon-co.com/wp-content/uploads/bitzer-s4n-8-2y-stage-2-compressor.jpg" },
            { code: "293404", name: "کمپرسور دو مرحله ای بیتزر ۱۲ اسب بخار سه فاز (S4G-12.2)", brand: "بیتزر", stock: "in", price: 8155000, discount: 18, hue: 35, image: "https://www.damoon-co.com/wp-content/uploads/2021/07/bitzer-S4G-12.2-two-stage-compressor.jpg" },
            { code: "3876805", name: "کمپرسور دو مرحله ای ۱۲ اسب بخار سه فاز بیتزر مدل S4G-12.2Y", brand: "بیتزر", stock: "in", price: 32730000, hue: 35, image: "https://www.damoon-co.com/wp-content/uploads/bitzer-s4g-12-2y-stage-2-compressor.jpg" },
            { code: "295206", name: "کمپرسور دو مرحله ای بیتزر ۱۵ اسب بخار سه فاز (S6J-16.2)", brand: "بیتزر", stock: "in", price: 12425000, hue: 35, image: "https://www.damoon-co.com/wp-content/uploads/2021/07/bitzer-S6J-16.2-two-stage-compressor.jpg" },
            { code: "3880007", name: "کمپرسور دو مرحله ای ۱۶ اسب بخار سه فاز بیتزر مدل S6J-16.2Y", brand: "بیتزر", stock: "in", price: "توافقی", hue: 35, image: "https://www.damoon-co.com/wp-content/uploads/bitzer-s6j-16-2y-stage-2-compressor.jpg" },
            { code: "3879608", name: "کمپرسور دو مرحله ای ۲۰ اسب بخار سه فاز بیتزر مدل S6H-20.2Y", brand: "بیتزر", stock: "in", price: "توافقی", hue: 35, image: "https://www.damoon-co.com/wp-content/uploads/bitzer-s6h-20-2y-stage-2-compressor.jpg" },
            { code: "2367209", name: "کمپرسور پیستونی ۲۵ اسب بخار بوک سری HA6/1240-4", brand: "بوک", stock: "in", price: 20903000, hue: 40, image: "https://www.damoon-co.com/wp-content/uploads/bock-ha6-1240-4-reciprocating-compressor.jpg" },
            { code: "2365112", name: "کمپرسور پیستونی ۱۵ اسب بخار بوک سری HAX5/830-4", brand: "بوک", stock: "in", price: "توافقی", hue: 40, image: "https://www.damoon-co.com/wp-content/uploads/bock-hax5-830-4-reciprocating-compressor.jpg" },
            { code: "2362815", name: "کمپرسور پیستونی ۱۰ اسب بخار بوک سری HA4/555-4", brand: "بوک", stock: "in", price: "توافقی", hue: 40, image: "https://www.damoon-co.com/wp-content/uploads/bock-ha4-555-4-reciprocating-compressor.jpg" },
            { code: "2354018", name: "کمپرسور پیستونی ۴۰ اسب بخار بوک سری HGX6/1410-4 S", brand: "بوک", stock: "in", price: "توافقی", hue: 40, image: "https://www.damoon-co.com/wp-content/uploads/bock-hgx6-1410-4-s-reciprocating-compressor.jpg" }
        ]},
        { id: "danfoss-c", name: "کمپرسور دانفوس", count: 4, skus: [
            { code: "2366510", name: "کمپرسور پیستونی 20 اسب بخار بوک سری HAX5/945-4", brand: "بوک", stock: "in", price: "توافقی", hue: 40, image: "https://www.damoon-co.com/wp-content/uploads/bock-hax5-945-4-reciprocating-compressor.jpg" },
            { code: "2364413", name: "کمپرسور پیستونی ۱۵ اسب بخار بوک سری HA5/830-4", brand: "بوک", stock: "in", price: 5358000, hue: 40, image: "https://www.damoon-co.com/wp-content/uploads/bock-ha5-830-4-reciprocating-compressor.jpg" },
            { code: "2355416", name: "کمپرسور پیستونی ۷.۵ اسب بخار بوک سری HAX34E/380-4", brand: "بوک", stock: "in", price: 3411000, discount: 18, hue: 40, image: "https://www.damoon-co.com/wp-content/uploads/bock-hax34e-380-4-s-reciprocating-compressor.jpg" },
            { code: "2353219", name: "کمپرسور پیستونی ۴۰ اسب بخار بوک سری HG6/1410-4 S", brand: "بوک", stock: "in", price: 1497000, hue: 40, image: "https://www.damoon-co.com/wp-content/uploads/bock-hg6-1410-4-s-reciprocating-compressor.jpg" }
        ]},
        { id: "copeland", name: "کمپرسور کوپلند", count: 4, skus: [
            { code: "2365811", name: "کمپرسور پیستونی 20 اسب بخار بوک سری HA5/945-4", brand: "بوک", stock: "in", price: 2452000, hue: 40, image: "https://www.damoon-co.com/wp-content/uploads/bock-ha5-945-4-reciprocating-compressor.jpg" },
            { code: "2363514", name: "کمپرسور پیستونی ۱۰ اسب بخار بوک سری HAX4/555-4", brand: "بوک", stock: "in", price: 9793000, hue: 40, image: "https://www.damoon-co.com/wp-content/uploads/bock-hax4-555-4-reciprocating-compressor.jpg" },
            { code: "2354717", name: "کمپرسور پیستونی ۷.۵ اسب بخار بوک سری HA34E/380-4", brand: "بوک", stock: "in", price: 1336000, hue: 40, image: "https://www.damoon-co.com/wp-content/uploads/bock-ha34e-380-4-s-reciprocating-compressor.jpg" },
            { code: "2352420", name: "کمپرسور پیستونی 35 اسب بخار بوک سری HGX56E/1155-4 S", brand: "بوک", stock: "in", price: "توافقی", hue: 40, image: "https://www.damoon-co.com/wp-content/uploads/bock-hgx56e-1155-4-s-reciprocating-compressor.jpg" }
        ]}
      ],
    },
    {
      id: "control",
      name: "کنترل و اندازه‌گیری",
      count: 15,
      desc: "پرشر سوئیچ، ترموستات و تجهیزات اندازه‌گیری برودتی.",
      children: [
        { id: "pressure", name: "پرشر سوئیچ", count: 7, skus: [
            { code: "4241801", name: "های پرشر سوئیچ ساده دانفوس KP5", brand: "دانفوس", stock: "in", price: "توافقی", hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/danfoss-kp5-pressure-switch-main.png" },
            { code: "4243602", name: "های اند لو پرشر سوئیچ ساده دانفوس KP15", brand: "دانفوس", stock: "in", price: "توافقی", hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/danfoss-kp15-pressure-switch-main.png" },
            { code: "4241103", name: "لو پرشر سوئیچ ساده دانفوس KP1", brand: "دانفوس", stock: "in", price: "توافقی", hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/danfoss-kp1-pressure-switch-main.png" },
            { code: "1191404", name: "اویل پرشر سوئیچ MP55 دانفوس", brand: "دانفوس", stock: "in", price: "توافقی", hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/2022/03/mp55-oil-pressure-switch.jpg" },
            { code: "1184505", name: "پرشر سوئیچ دانفوس KP15 ریست دار", brand: "دانفوس", stock: "in", price: 3303000, discount: 20, hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/2022/02/Danfoss-KP15-High-and-low-Pressure-Control-Manual-Reset.jpg" },
            { code: "1183506", name: "پرشر سوئیچ دانفوس KP5 ریست دار", brand: "دانفوس", stock: "in", price: "توافقی", hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/2022/02/Danfoss-KP5-High-Pressure-Control-Manual-Reset.jpg" },
            { code: "1119607", name: "پرشر سوئیچ دانفوس KP1 ریست دار", brand: "دانفوس", stock: "in", price: 14552000, hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/2022/01/danfoss-kp1-pressure-switch.jpg" }
        ]},
        { id: "thermo", name: "ترموستات", count: 6, skus: [
            { code: "2192308", name: "ترموستات KP78 دانفوس", brand: "دانفوس", stock: "in", price: "توافقی", hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/danfoss-thermostat-kp-78.jpg" },
            { code: "2191809", name: "ترموستات ERC214 دانفوس", brand: "دانفوس", stock: "in", price: "توافقی", hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/danfoss-thermostat-erc-214.jpg" },
            { code: "2181010", name: "ترموستات ERC213 دانفوس", brand: "دانفوس", stock: "in", price: 2336000, hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/danfoss-thermostat-erc-213.jpg" },
            { code: "2180211", name: "ترموستات ERC211 دانفوس", brand: "دانفوس", stock: "in", price: 12346000, hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/danfoss-thermostat-erc-211.jpg" },
            { code: "2172712", name: "ترموستات UT72 ساده دانفوس", brand: "دانفوس", stock: "in", price: 1836000, discount: 10, hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/thermostat-ut72.jpg" },
            { code: "2171613", name: "ترموستات KP61 ساده دانفوس", brand: "دانفوس", stock: "in", price: "توافقی", hue: 210, image: "https://www.damoon-co.com/wp-content/uploads/thermostat-kp61.jpg" }
        ]},
        { id: "gauge", name: "گیج فشار", count: 2, skus: [
            { code: "2294414", name: "گیج فشار ویکا سری 500Psi", brand: "ویکا", stock: "in", price: "توافقی", hue: 190, image: "https://www.damoon-co.com/wp-content/uploads/wika-pressure-gauge-500-psi-2-scaled_11zon-1.jpg" },
            { code: "2279215", name: "گیج فشار ویکا سری 230Psi", brand: "ویکا", stock: "in", price: "توافقی", hue: 190, image: "https://www.damoon-co.com/wp-content/uploads/wika-pressure-gauge-230-psi-scaled.jpg" }
        ]}
      ],
    },
    {
      id: "condenser",
      name: "کندانسور / اواپراتور",
      count: 20,
      desc: "کندانسور و اواپراتور برای پروژه‌های سردخانه‌ای و تهویه.",
      children: [
        { id: "evap", name: "اواپراتور", count: 20, skus: [
            { code: "3931301", name: "اواپراتور نوین مدل NES2-550-4069", brand: "نوین", stock: "in", price: 2840000, discount: 10, hue: 160, image: "https://www.damoon-co.com/wp-content/uploads/novin-nes2-550-4069-evaporator.jpg" },
            { code: "3931002", name: "اواپراتور نوین مدل NES2-550-3562", brand: "نوین", stock: "in", price: "توافقی", hue: 160, image: "https://www.damoon-co.com/wp-content/uploads/novin-nes2-550-3562-evaporator.jpg" },
            { code: "3930703", name: "اواپراتور نوین مدل NES2-450-3055", brand: "نوین", stock: "in", price: 507000, discount: 12, hue: 160, image: "https://www.damoon-co.com/wp-content/uploads/novin-nes2-450-3055-evaporator.jpg" },
            { code: "3930404", name: "اواپراتور نوین مدل NES2-350-2544", brand: "نوین", stock: "in", price: 84063000, hue: 160, image: "https://www.damoon-co.com/wp-content/uploads/novin-nes2-350-2544-evaporator.jpg" },
            { code: "3930105", name: "اواپراتور نوین مدل NES2-350-2035", brand: "نوین", stock: "in", price: "توافقی", hue: 160, image: "https://www.damoon-co.com/wp-content/uploads/novin-nes2-350-2035-evaporator.jpg" },
            { code: "3929706", name: "اواپراتور نوین مدل NES2-340-1019", brand: "نوین", stock: "in", price: "توافقی", hue: 160, image: "https://www.damoon-co.com/wp-content/uploads/novin-nes2-340-1019-evaporator.jpg" },
            { code: "3929407", name: "اواپراتور نوین مدل NES2-250-1525", brand: "نوین", stock: "in", price: 3371000, discount: 25, hue: 160, image: "https://www.damoon-co.com/wp-content/uploads/novin-nes2-250-1525-evaporator.jpg" },
            { code: "3929008", name: "اواپراتور نوین مدل NES2-240-715", brand: "نوین", stock: "in", price: 5617000, hue: 160, image: "https://www.damoon-co.com/wp-content/uploads/novin-nes2-240-715-evaporator.jpg" },
            { code: "3928609", name: "اواپراتور نوین مدل NES2-240-512", brand: "نوین", stock: "in", price: 7040000, hue: 160, image: "https://www.damoon-co.com/wp-content/uploads/novin-nes2-240-512-evaporator.jpg" },
            { code: "3928310", name: "اواپراتور نوین مدل NES2-240-410", brand: "نوین", stock: "in", price: "توافقی", hue: 160, image: "https://www.damoon-co.com/wp-content/uploads/novin-nes2-240-410-evaporator-2.jpg" },
            { code: "3927911", name: "اواپراتور نوین مدل NES2-140-37", brand: "نوین", stock: "in", price: "توافقی", hue: 160, image: "https://www.damoon-co.com/wp-content/uploads/novin-nes2-140-37-evaporator.jpg" },
            { code: "3927612", name: "اواپراتور نوین مدل NES2-140-25", brand: "نوین", stock: "in", price: 17574000, discount: 20, hue: 160, image: "https://www.damoon-co.com/wp-content/uploads/novin-nes2-140-25-evaporator.jpg" },
            { code: "3926513", name: "اواپراتور نوین مدل NES2-140-14", brand: "نوین", stock: "in", price: "توافقی", hue: 160, image: "https://www.damoon-co.com/wp-content/uploads/novin-nes2-140-14-evaporator.jpg" },
            { code: "3926214", name: "اواپراتور نوین مدل NES1-450-3049", brand: "نوین", stock: "in", price: "توافقی", hue: 160, image: "https://www.damoon-co.com/wp-content/uploads/novin-nes1-450-3049-evaporator.jpg" },
            { code: "3925815", name: "اواپراتور نوین مدل NES1-350-2538", brand: "نوین", stock: "in", price: "توافقی", hue: 160, image: "https://www.damoon-co.com/wp-content/uploads/novin-nes1-350-2538-evaporator.jpg" },
            { code: "3925516", name: "اواپراتور نوین مدل NES1-340-1017", brand: "نوین", stock: "in", price: 79839000, discount: 30, hue: 160, image: "https://www.damoon-co.com/wp-content/uploads/novin-nes1-340-1017-evaporator.jpg" },
            { code: "3925217", name: "اواپراتور نوین مدل NES1-335-713", brand: "نوین", stock: "in", price: "توافقی", hue: 160, image: "https://www.damoon-co.com/wp-content/uploads/novin-nes1-335-713-evaporator.jpg" },
            { code: "3924918", name: "اواپراتور نوین مدل NES1-250-2029", brand: "نوین", stock: "in", price: 1865000, discount: 15, hue: 160, image: "https://www.damoon-co.com/wp-content/uploads/novin-nes1-250-2029-evaporator.jpg" },
            { code: "3924619", name: "اواپراتور نوین مدل NES1-250-1523", brand: "نوین", stock: "in", price: "توافقی", hue: 160, image: "https://www.damoon-co.com/wp-content/uploads/novin-nes1-250-1523-evaporator.jpg" },
            { code: "3924320", name: "اواپراتور نوین مدل NES1-235-511", brand: "نوین", stock: "in", price: 2234000, hue: 160, image: "https://www.damoon-co.com/wp-content/uploads/novin-nes1-235-511-evaporator.jpg" }
        ]}
      ],
    },
    {
      id: "consumables",
      name: "لوازم مصرفی",
      count: 20,
      desc: "گاز مبرد، روغن و لوازم مصرفی برودتی.",
      children: [
        { id: "gas", name: "گاز مبرد", count: 10, skus: [
            { code: "4141211", name: "گاز R507a کولیب", brand: "متفرقه", stock: "in", price: 3259000, discount: 15, hue: 120, image: "https://www.damoon-co.com/wp-content/uploads/coolib-r507a-refrigerant-main.jpg" },
            { code: "4141412", name: "گاز R507a ایسکون", brand: "متفرقه", stock: "in", price: 701000, discount: 8, hue: 120, image: "https://www.damoon-co.com/wp-content/uploads/Isecon-r507a-refrigerant-main.jpg" },
            { code: "4739013", name: "گاز R410a صف ایسکون", brand: "متفرقه", stock: "in", price: 3434000, hue: 120, image: "https://www.damoon-co.com/wp-content/uploads/R410A-1.webp" },
            { code: "1517014", name: "گاز R410A ایسکون", brand: "متفرقه", stock: "in", price: "توافقی", hue: 120, image: "https://www.damoon-co.com/wp-content/uploads/isecon-410a-refrigerant-01.jpg" },
            { code: "1519015", name: "گاز R410a کولیب", brand: "متفرقه", stock: "in", price: 1787000, hue: 120, image: "https://www.damoon-co.com/wp-content/uploads/coolib-410a-refrigerant-01.jpg" },
            { code: "4055316", name: "گاز R410a رایم", brand: "متفرقه", stock: "in", price: 978000, hue: 120, image: "https://www.damoon-co.com/wp-content/uploads/R410A-rime-refrigerant-main.jpg" },
            { code: "1574517", name: "گاز R410A MA", brand: "متفرقه", stock: "in", price: 6821000, discount: 15, hue: 120, image: "https://www.damoon-co.com/wp-content/uploads/ma-r410a-refrigerant-01.jpg" },
            { code: "1505418", name: "گاز R410A DY دی وای", brand: "متفرقه", stock: "in", price: 26421000, hue: 120, image: "https://www.damoon-co.com/wp-content/uploads/DY-R410-refrigerant-01-1.jpg" },
            { code: "1222519", name: "گاز R410A آلفا", brand: "متفرقه", stock: "in", price: "توافقی", hue: 120, image: "https://www.damoon-co.com/wp-content/uploads/alfa-r410a-refrigerant-01.jpg" },
            { code: "1233120", name: "گاز R410A هانیول", brand: "متفرقه", stock: "in", price: 40080000, hue: 120, image: "https://www.damoon-co.com/wp-content/uploads/honeywell-R410A-01.jpg" }
        ]},
        { id: "oil", name: "روغن کمپرسور", count: 10, skus: [
            { code: "1538801", name: "روغن SL32 سانیسو 1 لیتری", brand: "سانیسو", stock: "in", price: 520000, hue: 120, image: "https://www.damoon-co.com/wp-content/uploads/suniso-sl32-1liter-01.jpg" },
            { code: "1337702", name: "روغن SL46 ‌سانیسو 4 لیتری", brand: "سانیسو", stock: "in", price: 1430000, discount: 30, hue: 120, image: "https://www.damoon-co.com/wp-content/uploads/suniso-oil-sl42-01.jpg" },
            { code: "1234603", name: "روغن SL100 سانیسو 4 لیتری", brand: "سانیسو", stock: "in", price: "توافقی", hue: 120, image: "https://www.damoon-co.com/wp-content/uploads/SL-100.jpg" },
            { code: "1232604", name: "روغن کمپرسور SL68 سانیسو 4 لیتری", brand: "سانیسو", stock: "in", price: 7627000, discount: 30, hue: 120, image: "https://www.damoon-co.com/wp-content/uploads/SL-68.jpg" },
            { code: "1232405", name: "روغن SL220 سانیسو 4 لیتری", brand: "سانیسو", stock: "in", price: "توافقی", hue: 120, image: "https://www.damoon-co.com/wp-content/uploads/SL-220.jpg" },
            { code: "1230406", name: "روغن SL170 سانیسو 4 لیتری", brand: "سانیسو", stock: "in", price: 36957000, hue: 120, image: "https://www.damoon-co.com/wp-content/uploads/suniso-sl-170-4l.jpg" },
            { code: "1230307", name: "روغن SL32 سانیسو 4 لیتری", brand: "سانیسو", stock: "in", price: 1247000, discount: 25, hue: 120, image: "https://www.damoon-co.com/wp-content/uploads/suniso-oil-SL-32-01.jpg" },
            { code: "1230008", name: "روغن SL22 سانیسو 4 لیتری", brand: "سانیسو", stock: "in", price: 18379000, hue: 120, image: "https://www.damoon-co.com/wp-content/uploads/suniso-sl22-4liter.jpg" },
            { code: "1228009", name: "روغن 5GS سانیسو 4 لیتری", brand: "سانیسو", stock: "in", price: "توافقی", hue: 120, image: "https://www.damoon-co.com/wp-content/uploads/5gs.jpg" },
            { code: "1226310", name: "روغن کمپرسور 3GS سانیسو 4 لیتری", brand: "سانیسو", stock: "in", price: "توافقی", hue: 120, image: "https://www.damoon-co.com/wp-content/uploads/3gs-1.jpg" }
        ]}
      ],
    }
  ];

  var SORTS = [
    { id: "cheap", label: "ارزان ترین" },
    { id: "expensive", label: "گرانترین" },
    { id: "bestseller", label: "پرفروش ترین" },
    { id: "popular", label: "محبوب ترین" },
  ];

  var BRAND_LABELS = {
    دانفوس: "دانفوس | Danfoss",
    بیتزر: "بیتزر | Bitzer",
    بوک: "بوک | Bock",
    آسه: "آسه | ASE",
    ویکا: "ویکا | Wika",
    نوین: "نوین | Novin",
    سانیسو: "سانیسو | Suniso",
    متفرقه: "متفرقه",
  };

  /* Attribute filters per root category (Barghchi-style, Damoon content) */
  var CATEGORY_ATTRS = {
    valves: [
      { key: "valveType", title: "نوع شیر", options: ["بال ولو", "شیر برقی", "بوبین"] },
      { key: "connection", title: "نوع اتصال", options: ["جوشی", "مهره‌ای", "کابلی", "سوکتی"] },
      { key: "size", title: "سایز", options: ["1/4", "3/8", "1/2", "5/8", "3/4", "7/8", "1-1/8", "1-3/8", "1-5/8", "2-1/8", "2-5/8", "3-1/8"] },
      { key: "voltage", title: "ولتاژ", options: ["۱۲ ولت", "۲۴ ولت", "۲۲۰ ولت"] },
    ],
    coldroom: [
      { key: "unitSeries", title: "سری یونیت", options: ["ACS-663", "ACS-463", "ACS-450"] },
      { key: "refrigerantTag", title: "نوع گاز (سری)", options: ["Y (POE)", "استاندارد"] },
      { key: "compressorFamily", title: "خانواده کمپرسور", options: ["4FE", "4GE", "4NE", "6FE", "6GE", "6HE", "6JE", "8GE", "S6F"] },
    ],
    compressor: [
      { key: "compType", title: "نوع کمپرسور", options: ["پیستونی", "دو مرحله‌ای"] },
      { key: "hp", title: "اسب بخار", options: ["۴", "۵", "۷.۵", "۸", "۱۰", "۱۲", "۱۵", "۱۶", "۲۰", "۲۵", "۳۰", "۳۵", "۴۰"] },
      { key: "phase", title: "فاز", options: ["سه فاز"] },
    ],
    control: [
      { key: "deviceType", title: "نوع تجهیزات", options: ["پرشر سوئیچ", "ترموستات", "گیج فشار"] },
      { key: "pressureKind", title: "نوع پرشر", options: ["های پرشر", "لو پرشر", "های اند لو", "اویل پرشر"] },
      { key: "resetType", title: "نوع ریست", options: ["ساده", "ریست دار"] },
    ],
    condenser: [
      { key: "evapSeries", title: "سری اواپراتور", options: ["NES1", "NES2"] },
      { key: "fanSize", title: "سایز فن", options: ["140", "235", "240", "250", "335", "340", "350", "450", "550"] },
    ],
    consumables: [
      { key: "consumableType", title: "نوع کالا", options: ["گاز مبرد", "روغن کمپرسور"] },
      { key: "gasType", title: "نوع گاز", options: ["R410A", "R507a"] },
      { key: "oilGrade", title: "گرید روغن", options: ["3GS", "5GS", "SL22", "SL32", "SL46", "SL68", "SL100", "SL170", "SL220"] },
      { key: "packSize", title: "حجم بسته‌بندی", options: ["۱ لیتری", "۴ لیتری"] },
    ],
  };

  var PAGE_SIZE = 12;

  var COMPARE_MAX = 4;

  var state = {
    path: [],
    query: "",
    brandQuery: "",
    cart: {},
    wishlist: {},
    quotes: {},
    compare: {},
    sort: "expensive",
    brands: {},
    attrs: {},
    stockOnly: false,
    discountedOnly: false,
    onlineOnly: false,
    view: "grid",
    descOpen: false,
    openFilters: { brand: true },
    page: 1,
  };

  var pendingCategory = "valves";
  var isBound = false;

  var BRAND_LOGOS = {
    دانفوس: "assets/brands/danfoss.png",
    کوپلند: "assets/brands/copeland.png",
    بیتزر: "assets/brands/bitzer.png",
  };

  function brandLogoSrc(brand) {
    return BRAND_LOGOS[brand] || "";
  }

  function brandsFromNode(node) {
    var seen = {};
    var list = [];
    collectSkus(node).forEach(function (sku) {
      var b = sku.brand;
      if (!b || seen[b]) return;
      seen[b] = true;
      list.push({ name: b, logo: brandLogoSrc(b) });
    });
    return list;
  }

  function getMegaMenuData() {
    function mapCategoryLevels(nodes) {
      return (nodes || []).map(function (node) {
        return {
          id: node.id,
          name: node.name,
          brands: brandsFromNode(node),
          children: mapCategoryLevels(node.children),
        };
      });
    }

    return TREE.map(function (cat) {
      return {
        id: cat.id,
        name: cat.name,
        brands: brandsFromNode(cat),
        groups: mapCategoryLevels(cat.children),
      };
    });
  }

  function findNodeById(id) {
    var found = null;
    function walk(nodes, trail) {
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var t = trail.concat([n]);
        if (n.id === id) {
          found = t;
          return true;
        }
        if (n.children && walk(n.children, t)) return true;
      }
      return false;
    }
    walk(TREE, []);
    return found;
  }

  function openCategory(id) {
    var trail = findNodeById(id);
    if (!trail || !trail.length) return;
    state.path = trail.map(function (n) { return n.id; });
    state.query = "";
    state.brandQuery = "";
    state.brands = {};
    state.attrs = {};
    state.stockOnly = false;
    state.discountedOnly = false;
    state.onlineOnly = false;
    state.openFilters = { brand: true };
    state.sort = "expensive";
    state.page = 1;
    pendingCategory = null;
    if (isBound) remount();
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function findById(nodes, id) {
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].id === id) return nodes[i];
    }
    return null;
  }

  function resolvePath() {
    var nodes = [];
    var cur = TREE;
    for (var i = 0; i < state.path.length; i++) {
      var n = findById(cur, state.path[i]);
      if (!n) break;
      nodes.push(n);
      cur = n.children || [];
    }
    return nodes;
  }

  function collectSkus(node) {
    var out = [];
    function walk(n) {
      if (!n) return;
      if (n.skus && n.skus.length) {
        for (var i = 0; i < n.skus.length; i++) out.push(n.skus[i]);
      }
      if (n.children) {
        for (var j = 0; j < n.children.length; j++) walk(n.children[j]);
      }
    }
    walk(node);
    return out;
  }

  function cartCount() {
    var n = 0;
    Object.keys(state.cart).forEach(function (k) { n += state.cart[k] || 0; });
    return n;
  }

  function wishlistCount() {
    return Object.keys(state.wishlist).filter(function (k) {
      return !!state.wishlist[k];
    }).length;
  }

  function quotesCount() {
    return Object.keys(state.quotes).filter(function (k) {
      return !!state.quotes[k];
    }).length;
  }

  function setBadgeEl(el, count) {
    if (!el) return;
    if (count > 0) {
      el.hidden = false;
      el.textContent = String(count);
      el.setAttribute("aria-label", count + " مورد");
    } else {
      el.hidden = true;
      el.textContent = "0";
      el.removeAttribute("aria-label");
    }
  }

  function syncHeaderCart() {
    var count = cartCount();
    var lines = cartLines();
    var cartBtn = document.querySelector("#head-cart .head-cart-btn");
    var badge = document.querySelector(".head-cart-count");
    var metaCount = document.querySelector(".head-cart-meta-count");
    var list = document.querySelector(".head-cart-list");
    var empty = document.querySelector(".head-cart-empty");
    var totalEl = document.querySelector(".head-cart-total-val");
    var footer = document.querySelector(".head-cart-footer");
    var total = 0;

    setBadgeEl(badge, count);
    if (metaCount) metaCount.textContent = String(count);
    if (cartBtn) {
      cartBtn.setAttribute(
        "aria-label",
        count > 0 ? "سبد درخواست (" + count + ")" : "سبد درخواست"
      );
    }

    if (list) {
      if (!lines.length) {
        list.innerHTML = "";
      } else {
        list.innerHTML = lines
          .map(function (line) {
            var sku = line.sku;
            var qty = line.qty || 1;
            var price =
              typeof sku.price === "number" ? sku.price : null;
            var lineSum = price == null ? null : price * qty;
            if (lineSum != null) total += lineSum;
            var priceHtml =
              lineSum == null
                ? "توافقی"
                : formatMoney(lineSum) + " تومان";
            var thumb =
              sku.image
                ? '<img alt="' +
                  esc(sku.name) +
                  '" width="75" height="75" loading="lazy" decoding="async" src="' +
                  esc(sku.image) +
                  '" />'
                : '<span class="head-cart-thumb-fallback">' +
                  esc((sku.brand || "?").charAt(0)) +
                  "</span>";
            return (
              '<div class="head-cart-item">' +
                '<div class="head-cart-thumb">' +
                thumb +
                "</div>" +
                '<div class="head-cart-item-body">' +
                  '<div class="head-cart-item-title">' +
                  esc(sku.name) +
                  "</div>" +
                  '<div class="head-cart-item-meta">' +
                    "<span>" +
                    qty +
                    " عدد</span>" +
                    "<strong>" +
                    priceHtml +
                    "</strong>" +
                  "</div>" +
                "</div>" +
              "</div>"
            );
          })
          .join("");
      }
    }

    if (empty) empty.hidden = count > 0;
    if (footer) footer.hidden = count <= 0;
    if (totalEl) {
      totalEl.textContent =
        count > 0 ? formatMoney(total) + " تومان" : "۰ تومان";
    }
  }

  function syncHeaderBadges() {
    var wishCount = wishlistCount();
    var quoteCount = quotesCount();
    var wishBtn = document.getElementById("head-wish");
    var wishBadge = document.querySelector(".head-wish-count");
    var quoteBadge = document.querySelector(".head-quote-count");
    var quoteCta = document.getElementById("head-quote-cta");

    setBadgeEl(wishBadge, wishCount);
    setBadgeEl(quoteBadge, quoteCount);
    syncHeaderCart();
    syncCompareDock();

    if (wishBtn) {
      wishBtn.setAttribute(
        "aria-label",
        wishCount > 0 ? "علاقه‌مندی‌ها (" + wishCount + ")" : "علاقه‌مندی‌ها"
      );
    }
    if (quoteCta) {
      quoteCta.setAttribute(
        "aria-label",
        quoteCount > 0
          ? "صدور پیش فاکتور (" + quoteCount + ")"
          : "صدور پیش فاکتور"
      );
    }
  }

  function toggleWishlist(code) {
    if (!code) return;
    if (state.wishlist[code]) delete state.wishlist[code];
    else state.wishlist[code] = true;
    syncHeaderBadges();
  }

  function findSkuByCode(code) {
    if (!code) return null;
    for (var c = 0; c < TREE.length; c++) {
      var list = collectSkus(TREE[c]);
      for (var j = 0; j < list.length; j++) {
        if (list[j].code === code) return list[j];
      }
    }
    return null;
  }

  function addQuote(code) {
    if (!code) return;
    var cur = Number(state.quotes[code]) || 0;
    state.quotes[code] = cur > 0 ? cur : 1;
    syncHeaderBadges();
  }

  function setQuoteQty(code, qty) {
    if (!code) return;
    var n = Math.max(0, Math.floor(Number(qty) || 0));
    if (n <= 0) delete state.quotes[code];
    else state.quotes[code] = n;
    syncHeaderBadges();
  }

  function removeQuote(code) {
    if (!code) return;
    delete state.quotes[code];
    syncHeaderBadges();
  }

  function quoteLines() {
    var lines = [];
    Object.keys(state.quotes).forEach(function (code) {
      var qty = Number(state.quotes[code]) || 0;
      if (!qty) return;
      var sku = findSkuByCode(code);
      if (sku) lines.push({ sku: sku, qty: qty });
    });
    return lines;
  }

  function compareCount() {
    return Object.keys(state.compare).filter(function (k) {
      return !!state.compare[k];
    }).length;
  }

  function compareLines() {
    var lines = [];
    Object.keys(state.compare).forEach(function (code) {
      if (!state.compare[code]) return;
      var sku = findSkuByCode(code);
      if (sku) lines.push(sku);
    });
    return lines;
  }

  function toggleCompare(code) {
    if (!code) return false;
    if (state.compare[code]) {
      delete state.compare[code];
      syncCompareDock();
      return true;
    }
    if (compareCount() >= COMPARE_MAX) {
      alert("حداکثر " + COMPARE_MAX + " کالا برای مقایسه قابل انتخاب است.");
      return false;
    }
    state.compare[code] = true;
    syncCompareDock();
    return true;
  }

  function removeCompare(code) {
    if (!code) return;
    delete state.compare[code];
    syncCompareDock();
  }

  function clearCompare() {
    state.compare = {};
    syncCompareDock();
  }

  function findRootIdForSku(sku) {
    if (!sku) return "";
    for (var i = 0; i < TREE.length; i++) {
      var list = collectSkus(TREE[i]);
      for (var j = 0; j < list.length; j++) {
        if (list[j].code === sku.code) return TREE[i].id;
      }
    }
    return TREE[0] ? TREE[0].id : "";
  }

  function getCompareSpecs(skus) {
    var list = skus || [];
    var rows = [
      {
        label: "کد کالا",
        values: list.map(function (s) { return s.code || "-"; }),
      },
      {
        label: "برند",
        values: list.map(function (s) {
          return BRAND_LABELS[s.brand] || s.brand || "-";
        }),
      },
      {
        label: "موجودی",
        values: list.map(function (s) {
          return s.stock === "in" ? "موجود" : "ناموجود";
        }),
      },
    ];

    var titleByKey = {};
    Object.keys(CATEGORY_ATTRS).forEach(function (rootId) {
      (CATEGORY_ATTRS[rootId] || []).forEach(function (g) {
        titleByKey[g.key] = g.title;
      });
    });

    var keys = [];
    var seen = {};
    list.forEach(function (sku) {
      var rootId = findRootIdForSku(sku);
      var derived = deriveSkuAttrs(sku, rootId) || {};
      Object.keys(derived).forEach(function (key) {
        if (!seen[key] && derived[key]) {
          seen[key] = true;
          keys.push(key);
        }
      });
    });

    keys.forEach(function (key) {
      rows.push({
        label: titleByKey[key] || key,
        values: list.map(function (sku) {
          var rootId = findRootIdForSku(sku);
          var derived = deriveSkuAttrs(sku, rootId) || {};
          return derived[key] || "-";
        }),
      });
    });

    rows.push({
      label: "قیمت (تومان)",
      values: list.map(function (s) {
        if (s.price == null || s.price === "" || s.price === "توافقی") return "توافقی";
        return formatMoney(s.price);
      }),
    });

    return rows;
  }

  function syncCompareDock() {
    var dock = document.getElementById("compare-dock");
    if (!dock) return;
    var lines = compareLines();
    var n = lines.length;
    var onComparePage = ((location.hash || "").replace(/^#/, "") === "compare");
    if (!n || onComparePage) {
      dock.hidden = true;
      if (!n) dock.innerHTML = "";
      return;
    }
    dock.hidden = false;
    var thumbs = lines
      .map(function (sku) {
        var img = sku.image
          ? '<img src="' + esc(sku.image) + '" alt="' + esc(sku.name) + '" width="48" height="48" loading="lazy" />'
          : '<span>' + esc((sku.brand || "?").charAt(0)) + "</span>";
        return (
          '<div class="compare-dock-item" title="' +
          esc(sku.name) +
          '">' +
          img +
          '<button type="button" class="compare-dock-x" data-compare-remove="' +
          esc(sku.code) +
          '" aria-label="حذف از مقایسه">×</button>' +
          "</div>"
        );
      })
      .join("");
    var slots = "";
    for (var i = n; i < COMPARE_MAX; i++) {
      slots += '<div class="compare-dock-slot" aria-hidden="true"></div>';
    }
    dock.innerHTML =
      '<div class="compare-dock-inner">' +
        '<div class="compare-dock-thumbs">' +
        thumbs +
        slots +
        "</div>" +
        '<div class="compare-dock-meta">' +
          "<strong>" +
          n +
          " کالا</strong>" +
          '<span>برای مقایسه انتخاب شده</span>' +
        "</div>" +
        '<div class="compare-dock-actions">' +
          '<button type="button" class="compare-dock-clear" data-compare-clear>حذف همه</button>' +
          '<button type="button" class="compare-dock-go" data-open-compare' +
          (n < 2 ? " disabled" : "") +
          ">مقایسه</button>" +
        "</div>" +
      "</div>";
  }

  function cartLines() {
    var lines = [];
    var trail = resolvePath();
    var root = trail[0] || TREE[0];
    var all = collectSkus(root);
    Object.keys(state.cart).forEach(function (code) {
      var qty = state.cart[code];
      if (!qty) return;
      var sku = null;
      for (var i = 0; i < all.length; i++) {
        if (all[i].code === code) { sku = all[i]; break; }
      }
      if (!sku) {
        for (var c = 0; c < TREE.length && !sku; c++) {
          var list = collectSkus(TREE[c]);
          for (var j = 0; j < list.length; j++) {
            if (list[j].code === code) { sku = list[j]; break; }
          }
        }
      }
      if (sku) lines.push({ sku: sku, qty: qty });
    });
    return lines;
  }

  function uniqueBrands(skus) {
    var map = {};
    var out = [];
    skus.forEach(function (s) {
      if (!map[s.brand]) {
        map[s.brand] = true;
        out.push(s.brand);
      }
    });
    return out.sort();
  }

  function activeBrandCount() {
    return Object.keys(state.brands).filter(function (k) { return state.brands[k]; }).length;
  }

  function activeAttrCount() {
    var n = 0;
    Object.keys(state.attrs).forEach(function (key) {
      var group = state.attrs[key] || {};
      Object.keys(group).forEach(function (opt) {
        if (group[opt]) n += 1;
      });
    });
    return n;
  }

  function hasActiveFilters() {
    return (
      activeBrandCount() > 0 ||
      activeAttrCount() > 0 ||
      state.stockOnly ||
      state.discountedOnly ||
      state.onlineOnly ||
      !!state.query
    );
  }

  function clearFilters() {
    state.brands = {};
    state.attrs = {};
    state.stockOnly = false;
    state.discountedOnly = false;
    state.onlineOnly = false;
    state.query = "";
    state.brandQuery = "";
    state.page = 1;
  }

  function rootCategoryId(trail) {
    return trail && trail[0] ? trail[0].id : (TREE[0] && TREE[0].id) || "";
  }

  function brandLabel(brand) {
    return BRAND_LABELS[brand] || brand;
  }

  function isFilterOpen(key) {
    return !!state.openFilters[key];
  }

  function toggleFilterSection(key) {
    state.openFilters[key] = !state.openFilters[key];
  }

  function matchFirst(name, pairs) {
    for (var i = 0; i < pairs.length; i++) {
      if (pairs[i][0].test(name)) return pairs[i][1];
    }
    return "";
  }

  function deriveSkuAttrs(sku, rootId) {
    var name = sku.name || "";
    var attrs = {};

    if (rootId === "valves") {
      if (/بوبین/.test(name)) attrs.valveType = "بوبین";
      else if (/شیر برقی/.test(name)) attrs.valveType = "شیر برقی";
      else if (/بال ولو/.test(name)) attrs.valveType = "بال ولو";

      if (/جوشی/.test(name)) attrs.connection = "جوشی";
      else if (/مهره/.test(name)) attrs.connection = "مهره‌ای";
      else if (/کابل/.test(name)) attrs.connection = "کابلی";
      else if (/سوکت/.test(name)) attrs.connection = "سوکتی";

      attrs.size = matchFirst(name, [
        [/3[\s\/\-]?1[\s\/\-]?8|3-1\/8/, "3-1/8"],
        [/2[\s\/\-]?5[\s\/\-]?8|2-5\/8/, "2-5/8"],
        [/2[\s\/\-]?1[\s\/\-]?8|2-1\/8/, "2-1/8"],
        [/1[\s\/\-]?5[\s\/\-]?8|1-5\/8/, "1-5/8"],
        [/1[\s\/\-]?3[\s\/\-]?8|1-3\/8/, "1-3/8"],
        [/1[\s\/\-]?1[\s\/\-]?8|1-1\/8/, "1-1/8"],
        [/7[\s\/]8/, "7/8"],
        [/3[\s\/]4/, "3/4"],
        [/5[\s\/]8/, "5/8"],
        [/1[\s\/]2/, "1/2"],
        [/3[\s\/]8/, "3/8"],
        [/1[\s\/]4/, "1/4"],
      ]);

      if (/۲۲۰|220/.test(name)) attrs.voltage = "۲۲۰ ولت";
      else if (/۲۴|24/.test(name)) attrs.voltage = "۲۴ ولت";
      else if (/۱۲|12/.test(name)) attrs.voltage = "۱۲ ولت";
    } else if (rootId === "coldroom") {
      attrs.unitSeries = matchFirst(name, [
        [/ACS-663/, "ACS-663"],
        [/ACS-463/, "ACS-463"],
        [/ACS-450/, "ACS-450"],
      ]);
      attrs.refrigerantTag = /Y-|\dY\//.test(name) ? "Y (POE)" : "استاندارد";
      attrs.compressorFamily = matchFirst(name, [
        [/S6F/, "S6F"],
        [/8GE/, "8GE"],
        [/6JE/, "6JE"],
        [/6HE/, "6HE"],
        [/6GE/, "6GE"],
        [/6FE/, "6FE"],
        [/4NE/, "4NE"],
        [/4GE/, "4GE"],
        [/4FE/, "4FE"],
      ]);
    } else if (rootId === "compressor") {
      attrs.compType = /دو مرحله/.test(name) ? "دو مرحله‌ای" : "پیستونی";
      attrs.phase = /سه فاز/.test(name) ? "سه فاز" : "";
      attrs.hp = matchFirst(name, [
        [/۴۰ اسب|40 اسب/, "۴۰"],
        [/۳۵ اسب|35 اسب/, "۳۵"],
        [/۳۰ اسب|30 اسب/, "۳۰"],
        [/۲۵ اسب|25 اسب/, "۲۵"],
        [/۲۰ اسب|20 اسب/, "۲۰"],
        [/۱۶ اسب|16 اسب/, "۱۶"],
        [/۱۵ اسب|15 اسب/, "۱۵"],
        [/۱۲ اسب|12 اسب/, "۱۲"],
        [/۱۰ اسب|10 اسب/, "۱۰"],
        [/۸ اسب|8 اسب/, "۸"],
        [/۷\.۵ اسب|7\.5 اسب/, "۷.۵"],
        [/۵ اسب|5 اسب/, "۵"],
        [/۴ اسب|4 اسب/, "۴"],
      ]);
    } else if (rootId === "control") {
      if (/گیج/.test(name)) attrs.deviceType = "گیج فشار";
      else if (/ترموستات/.test(name)) attrs.deviceType = "ترموستات";
      else attrs.deviceType = "پرشر سوئیچ";

      if (/اویل پرشر|MP55/.test(name)) attrs.pressureKind = "اویل پرشر";
      else if (/های اند لو|KP15/.test(name)) attrs.pressureKind = "های اند لو";
      else if (/لو پرشر|KP1/.test(name)) attrs.pressureKind = "لو پرشر";
      else if (/های پرشر|KP5/.test(name)) attrs.pressureKind = "های پرشر";

      if (/ریست/.test(name)) attrs.resetType = "ریست دار";
      else if (/ساده/.test(name)) attrs.resetType = "ساده";
    } else if (rootId === "condenser") {
      attrs.evapSeries = /NES1/.test(name) ? "NES1" : /NES2/.test(name) ? "NES2" : "";
      attrs.fanSize = matchFirst(name, [
        [/550/, "550"],
        [/450/, "450"],
        [/350/, "350"],
        [/340/, "340"],
        [/335/, "335"],
        [/250/, "250"],
        [/240/, "240"],
        [/235/, "235"],
        [/140/, "140"],
      ]);
    } else if (rootId === "consumables") {
      if (/روغن/.test(name)) {
        attrs.consumableType = "روغن کمپرسور";
        attrs.oilGrade = matchFirst(name, [
          [/SL220/, "SL220"],
          [/SL170/, "SL170"],
          [/SL100/, "SL100"],
          [/SL68/, "SL68"],
          [/SL46|SL42/, "SL46"],
          [/SL32/, "SL32"],
          [/SL22/, "SL22"],
          [/5GS/, "5GS"],
          [/3GS/, "3GS"],
        ]);
        attrs.packSize = /1 لیتر|۱ لیتر/.test(name) ? "۱ لیتری" : "۴ لیتری";
      } else {
        attrs.consumableType = "گاز مبرد";
        if (/R507/i.test(name)) attrs.gasType = "R507a";
        else if (/R410/i.test(name)) attrs.gasType = "R410A";
      }
    }

    return attrs;
  }

  function skuMatchesAttrs(sku, rootId) {
    var selectedKeys = Object.keys(state.attrs).filter(function (key) {
      var group = state.attrs[key] || {};
      return Object.keys(group).some(function (opt) { return group[opt]; });
    });
    if (!selectedKeys.length) return true;

    var derived = deriveSkuAttrs(sku, rootId);
    for (var i = 0; i < selectedKeys.length; i++) {
      var key = selectedKeys[i];
      var group = state.attrs[key] || {};
      var value = derived[key];
      if (!value || !group[value]) return false;
    }
    return true;
  }

  function chevronSvg(open) {
    if (open) {
      return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M5.196 6.136a.75.75 0 1 0-1.06 1.061l1.06-1.06zM8 10l-.53.53a.75.75 0 0 0 1.06 0zm3.864-2.803a.75.75 0 0 0-1.06-1.06zm-7.727 0L7.47 10.53l1.06-1.06-3.333-3.334zM8.53 10.53l3.333-3.333-1.06-1.06L7.468 9.47l1.06 1.06z"/></svg>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20" aria-hidden="true"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1.5" d="m3.4 7.458 5.433 5.434a1.655 1.655 0 0 0 2.334 0L16.6 7.458"/></svg>';
  }

  function pageCount(total) {
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }

  function clampPage(total) {
    var pages = pageCount(total);
    if (state.page > pages) state.page = pages;
    if (state.page < 1) state.page = 1;
    return pages;
  }

  function pageSlice(skus) {
    clampPage(skus.length);
    var start = (state.page - 1) * PAGE_SIZE;
    return skus.slice(start, start + PAGE_SIZE);
  }

  function buildPagination(total) {
    var pages = clampPage(total);
    if (total <= PAGE_SIZE) return "";

    var start = (state.page - 1) * PAGE_SIZE + 1;
    var end = Math.min(total, state.page * PAGE_SIZE);
    var html =
      '<nav class="arc-pager" aria-label="صفحه‌بندی">' +
        '<div class="arc-pager-meta">نمایش ' +
        start +
        " تا " +
        end +
        " از " +
        total +
        " کالا</div>" +
        '<div class="arc-pager-controls">' +
          '<button type="button" class="arc-pager-btn" data-page="' +
          (state.page - 1) +
          '"' +
          (state.page <= 1 ? " disabled" : "") +
          ' aria-label="صفحه قبل">‹</button>';

    var windowSize = 5;
    var from = Math.max(1, state.page - Math.floor(windowSize / 2));
    var to = Math.min(pages, from + windowSize - 1);
    from = Math.max(1, to - windowSize + 1);

    if (from > 1) {
      html +=
        '<button type="button" class="arc-pager-btn" data-page="1">1</button>';
      if (from > 2) html += '<span class="arc-pager-ellipsis">…</span>';
    }

    for (var p = from; p <= to; p++) {
      html +=
        '<button type="button" class="arc-pager-btn' +
        (p === state.page ? " is-active" : "") +
        '" data-page="' +
        p +
        '"' +
        (p === state.page ? ' aria-current="page"' : "") +
        ">" +
        p +
        "</button>";
    }

    if (to < pages) {
      if (to < pages - 1) html += '<span class="arc-pager-ellipsis">…</span>';
      html +=
        '<button type="button" class="arc-pager-btn" data-page="' +
        pages +
        '">' +
        pages +
        "</button>";
    }

    html +=
      '<button type="button" class="arc-pager-btn" data-page="' +
      (state.page + 1) +
      '"' +
      (state.page >= pages ? " disabled" : "") +
      ' aria-label="صفحه بعد">›</button>' +
      "</div></nav>";
    return html;
  }

  function filteredSkus(skus, rootId) {
    var q = state.query.trim().toLowerCase();
    var brandActive = activeBrandCount() > 0;
    var list = skus.filter(function (s) {
      if (state.stockOnly && s.stock !== "in") return false;
      if (state.discountedOnly && !(s.discount > 0)) return false;
      if (state.onlineOnly && (s.price == null || s.price === "" || s.price === "توافقی")) return false;
      if (brandActive && !state.brands[s.brand]) return false;
      if (!skuMatchesAttrs(s, rootId)) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().indexOf(q) >= 0 ||
        s.code.toLowerCase().indexOf(q) >= 0 ||
        s.brand.toLowerCase().indexOf(q) >= 0
      );
    });

    list = list.slice();
    if (state.sort === "cheap" || state.sort === "expensive") {
      list.sort(function (a, b) {
        var pa = typeof a.price === "number" ? a.price : null;
        var pb = typeof b.price === "number" ? b.price : null;
        if (pa == null && pb == null) return a.name.localeCompare(b.name, "fa");
        if (pa == null) return 1;
        if (pb == null) return -1;
        return state.sort === "cheap" ? pa - pb : pb - pa;
      });
    } else if (state.sort === "bestseller") {
      list.sort(function (a, b) {
        if (a.stock !== b.stock) return a.stock === "in" ? -1 : 1;
        var da = a.discount || 0;
        var db = b.discount || 0;
        if (db !== da) return db - da;
        return a.name.localeCompare(b.name, "fa");
      });
    } else if (state.sort === "popular") {
      list.sort(function (a, b) {
        var da = a.discount || 0;
        var db = b.discount || 0;
        if (db !== da) return db - da;
        return a.name.localeCompare(b.name, "fa");
      });
    }
    return list;
  }

  function thumb(sku) {
    var h = sku.hue || 210;
    if (sku.image) {
      return (
        '<div class="arc-thumb arc-thumb-photo" style="--h:' + h + '">' +
          '<img src="' + esc(sku.image) + '" alt="' + esc(sku.name) + '" loading="lazy" decoding="async" />' +
        "</div>"
      );
    }
    return (
      '<div class="arc-thumb" style="--h:' + h + '">' +
        '<span class="arc-thumb-mark">' + esc(sku.brand.charAt(0)) + "</span>" +
      "</div>"
    );
  }

  function basketThumb(sku) {
    var h = sku.hue || 210;
    if (sku.image) {
      return (
        '<div class="arc-basket-thumb">' +
          '<img src="' + esc(sku.image) + '" alt="' + esc(sku.name) + '" loading="lazy" decoding="async" />' +
        "</div>"
      );
    }
    return (
      '<div class="arc-basket-thumb" style="--h:' + h + '">' +
        '<span class="arc-basket-thumb-mark">' + esc(sku.brand.charAt(0)) + "</span>" +
      "</div>"
    );
  }

  function brandBadge(sku) {
    var h = sku.hue || 210;
    var logo = brandLogoSrc(sku.brand);
    if (logo) {
      return (
        '<div class="arc-brand-badge arc-brand-badge-logo" title="' + esc(sku.brand) + '">' +
          '<img src="' + logo + '" alt="' + esc(sku.brand) + '" width="50" height="50" loading="lazy" decoding="async" />' +
        "</div>"
      );
    }
    return (
      '<div class="arc-brand-badge" style="--h:' + h + '" title="' + esc(sku.brand) + '">' +
        esc(sku.brand.charAt(0)) +
      "</div>"
    );
  }

  function stockLabel(sku) {
    return sku.stock === "in"
      ? '<span class="arc-stock in">موجود</span>'
      : '<span class="arc-stock out">ناموجود</span>';
  }

  function formatMoney(n) {
    var s = String(Math.round(Number(n) || 0));
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
  }

  function priceBlock(sku, compact) {
    if (sku.price == null || sku.price === "" || sku.price === "توافقی") {
      return compact
        ? "<strong>توافقی</strong>"
        : '<div class="arc-card-price is-quote"><strong>توافقی</strong></div>';
    }
    var sale = Number(sku.price) || 0;
    var disc = Number(sku.discount) || 0;
    var html = "";
    if (disc > 0 && disc < 100) {
      var old = Math.round(sale / (1 - disc / 100) / 1000) * 1000;
      html +=
        '<span class="arc-discount">٪' +
        disc +
        "</span>" +
        '<div class="arc-price-col">' +
          '<span class="arc-price-old">' + formatMoney(old) + "</span>" +
          '<div class="arc-price-now"><strong>' + formatMoney(sale) + "</strong><span>تومان</span></div>" +
        "</div>";
    } else {
      html +=
        '<div class="arc-price-now"><strong>' +
        formatMoney(sale) +
        "</strong><span>تومان</span></div>";
    }
    if (compact) return html;
    return '<div class="arc-card-price' + (disc ? " has-discount" : "") + '">' + html + "</div>";
  }

  function buildBreadcrumb(trail) {
    var html = '<nav class="arc-bc" aria-label="مسیر">';
    html += '<button type="button" class="arc-bc-link" data-goto="">محصولات</button>';
    for (var i = 0; i < trail.length; i++) {
      html += '<span class="arc-bc-sep">/</span>';
      if (i === trail.length - 1) {
        html += '<span class="arc-bc-last">' + esc(trail[i].name) + "</span>";
      } else {
        html +=
          '<button type="button" class="arc-bc-link" data-goto="' +
          esc(trail[i].id) +
          '">' +
          esc(trail[i].name) +
          "</button>";
      }
    }
    html += "</nav>";
    return html;
  }

  function buildHeader(trail) {
    var leaf = trail[trail.length - 1];
    var root = trail[0];
    var title = leaf ? leaf.name : "محصولات";
    var desc =
      (leaf && leaf.desc) ||
      (root && root.desc) ||
      "قبل از ثبت درخواست با تیم فروش دامون هماهنگ کنید. استعلام قیمت پروژه‌ای، ضمانت اصالت و صدور پیش‌فاکتور.";

    var descCls = state.descOpen ? "is-open" : "";

    return (
      '<div class="arc-header">' +
        '<div class="arc-header-top">' +
          buildBreadcrumb(trail) +
        "</div>" +
        '<div class="arc-title-row">' +
          '<div class="arc-title-wrap"><h1 class="arc-title">' + esc(title) + "</h1></div>" +
          '<div class="arc-desc-wrap ' + descCls + '">' +
            '<div class="arc-desc">' +
              "<p>" + esc(desc) + "</p>" +
            "</div>" +
            '<button type="button" class="arc-desc-more" data-act="toggle-desc">' +
              (state.descOpen ? "کمتر" : "بیشتر بخوانید") +
              '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M5.196 6.136a.75.75 0 1 0-1.06 1.061l1.06-1.06zM8 10l-.53.53a.75.75 0 0 0 1.06 0zm3.864-2.803a.75.75 0 0 0-1.06-1.06zm-7.727 0L7.47 10.53l1.06-1.06-3.333-3.334zM8.53 10.53l3.333-3.333-1.06-1.06L7.468 9.47l1.06 1.06z"/></svg>' +
            "</button>" +
          "</div>" +
        "</div>" +
        '<div class="arc-banner">' +
          '<img class="arc-banner-img" src="assets/images/arc-banner-hero.jpg" alt="تأمین تخصصی تجهیزات برودتی و صنعتی — ' +
          esc(title) +
          '" width="1400" height="360" loading="lazy" decoding="async" />' +
        "</div>" +
      "</div>"
    );
  }

  function buildAttrFilterBlock(group) {
    var open = isFilterOpen(group.key);
    var selected = state.attrs[group.key] || {};
    var html =
      '<div class="fa-block' + (open ? " is-open" : "") + '">' +
        '<button type="button" class="fa-title" data-act="toggle-filter" data-filter-key="' +
        esc(group.key) +
        '">' +
          "<span>" + esc(group.title) + "</span>" +
          chevronSvg(true) +
        "</button>" +
        '<div class="fa-body' + (open ? "" : " is-collapsed") + '">';

    group.options.forEach(function (opt, idx) {
      var id = "attr-" + group.key + "-" + idx;
      var checked = selected[opt] ? " checked" : "";
      html +=
        '<label class="fa-check" for="' + id + '">' +
          '<input type="checkbox" id="' +
          id +
          '" data-attr-key="' +
          esc(group.key) +
          '" data-attr-val="' +
          esc(opt) +
          '"' +
          checked +
          " />" +
          "<span>" + esc(opt) + "</span>" +
        "</label>";
    });

    html += "</div></div>";
    return html;
  }

  function buildArchiveFilters(brands, rootId) {
    var bq = state.brandQuery.trim().toLowerCase();
    var list = brands.filter(function (b) {
      return !bq || b.toLowerCase().indexOf(bq) >= 0 || brandLabel(b).toLowerCase().indexOf(bq) >= 0;
    });
    var brandOpen = isFilterOpen("brand");
    var attrGroups = CATEGORY_ATTRS[rootId] || [];

    var html = '<div class="filters-archive">';

    html +=
      '<div class="fa-block fa-brand' + (brandOpen ? " is-open" : "") + '">' +
        '<button type="button" class="fa-title" data-act="toggle-filter" data-filter-key="brand">' +
          "<span>برند</span>" +
          chevronSvg(brandOpen) +
        "</button>";

    if (brandOpen) {
      html +=
        '<div class="fa-search">' +
          '<input type="search" class="fa-search-input" data-brand-q placeholder="جستجو ..." value="' +
          esc(state.brandQuery) +
          '" />' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="fa-search-ico" aria-hidden="true"><path fill="currentColor" d="M19.47 20.53a.75.75 0 1 0 1.06-1.06zM17.25 10.5a6.75 6.75 0 0 1-6.75 6.75v1.5a8.25 8.25 0 0 0 8.25-8.25zm-6.75 6.75a6.75 6.75 0 0 1-6.75-6.75h-1.5a8.25 8.25 0 0 0 8.25 8.25zM3.75 10.5a6.75 6.75 0 0 1 6.75-6.75v-1.5a8.25 8.25 0 0 0-8.25 8.25zm6.75-6.75a6.75 6.75 0 0 1 6.75 6.75h1.5a8.25 8.25 0 0 0-8.25-8.25zm10.03 15.72-4.187-4.188-1.06 1.06 4.187 4.188z"/></svg>' +
        "</div>" +
        '<div class="fa-list">';

      if (!list.length) {
        html += '<p class="arc-empty-mini">برندی یافت نشد</p>';
      } else {
        list.forEach(function (b, idx) {
          var id = "brand-" + idx;
          var checked = state.brands[b] ? " checked" : "";
          html +=
            '<label class="fa-check" for="' + id + '">' +
              '<input type="checkbox" id="' + id + '" data-brand="' + esc(b) + '"' + checked + " />" +
              "<span>" + esc(brandLabel(b)) + "</span>" +
            "</label>";
        });
      }
      html += "</div>";
    }
    html += "</div>";

    attrGroups.forEach(function (group) {
      html += buildAttrFilterBlock(group);
    });

    html +=
      '<div class="fa-switch">' +
        "<span>فقط کالاهای موجود</span>" +
        '<label class="arc-switch">' +
          '<input type="checkbox" data-stock' + (state.stockOnly ? " checked" : "") + " />" +
          '<span class="arc-switch-ui"></span>' +
        "</label>" +
      "</div>" +
      '<div class="fa-switch">' +
        "<span>فقط کالاهای تخفیف‌دار</span>" +
        '<label class="arc-switch">' +
          '<input type="checkbox" data-discounted' + (state.discountedOnly ? " checked" : "") + " />" +
          '<span class="arc-switch-ui"></span>' +
        "</label>" +
      "</div>" +
      '<div class="fa-switch fa-switch-last">' +
        "<span>فقط کالاهای قابل خرید آنلاین</span>" +
        '<label class="arc-switch">' +
          '<input type="checkbox" data-online' + (state.onlineOnly ? " checked" : "") + " />" +
          '<span class="arc-switch-ui"></span>' +
        "</label>" +
      "</div>";

    html += "</div>";
    return html;
  }

  function buildSales() {
    return (
      '<div class="arc-sales">' +
        '<div class="arc-sales-head">' +
          '<div class="arc-sales-avatar" aria-hidden="true">د</div>' +
          '<div class="arc-sales-copy">' +
            '<div class="arc-sales-title">' +
              '<span class="arc-sales-dot" aria-hidden="true"></span>' +
              "<div>گفتگو با تیم فروش</div>" +
            "</div>" +
            '<div class="arc-sales-sub">استعلام قیمت کالا برای پروژه‌ها و کارفرمایان</div>' +
          "</div>" +
        "</div>" +
        '<div class="arc-sales-actions">' +
          '<div class="arc-sales-action">' +
            '<button type="button" class="arc-sales-btn arc-sales-btn-success" data-act="enquiry">' +
              '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M14.582 11.985c-.249-.124-1.472-.723-1.7-.805s-.394-.124-.56.123c-.166.248-.643.806-.788.971-.145.166-.29.186-.54.062-.248-.124-1.05-.385-2-1.229-.74-.656-1.24-1.467-1.384-1.715-.145-.248-.016-.382.109-.506.112-.11.249-.289.373-.433s.166-.248.249-.413c.083-.166.041-.31-.02-.434-.063-.124-.56-1.343-.768-1.84-.202-.482-.407-.416-.56-.424a10 10 0 0 0-.477-.009.92.92 0 0 0-.663.31c-.228.248-.871.847-.871 2.066s.891 2.396 1.016 2.562c.124.165 1.754 2.666 4.25 3.739.594.255 1.058.407 1.419.521.596.189 1.138.162 1.567.098.478-.07 1.472-.599 1.68-1.177s.207-1.074.145-1.178-.228-.165-.477-.289m-4.54 6.17h-.003a8.3 8.3 0 0 1-4.213-1.149l-.302-.178-3.133.817.836-3.04-.197-.31A8.2 8.2 0 0 1 1.765 9.91c.002-4.541 3.715-8.236 8.28-8.236a8.24 8.24 0 0 1 5.852 2.416 8.17 8.17 0 0 1 2.422 5.827c-.002 4.542-3.715 8.237-8.277 8.237m7.044-15.249A9.92 9.92 0 0 0 10.042 0C4.552 0 .086 4.446.083 9.91c0 1.747.458 3.451 1.33 4.954L0 20l5.279-1.378a10 10 0 0 0 4.759 1.206h.004c5.488 0 9.956-4.446 9.958-9.91a9.83 9.83 0 0 0-2.914-7.012" clip-rule="evenodd"/></svg>' +
              "<span>گفتگوی سریع</span>" +
            "</button>" +
          "</div>" +
          '<div class="arc-sales-action arc-sales-action-ping">' +
            '<span class="arc-sales-ping animate-slowPing" aria-hidden="true"></span>' +
            '<button type="button" class="arc-sales-btn arc-sales-btn-info" data-act="list">' +
              '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M14.164 17.708H5.831c-3.042 0-4.792-1.75-4.792-4.791V7.083c0-3.041 1.75-4.791 4.792-4.791h8.333c3.042 0 4.792 1.75 4.792 4.791v5.834c0 3.041-1.75 4.791-4.792 4.791M5.831 3.542c-2.384 0-3.542 1.158-3.542 3.541v5.834c0 2.383 1.158 3.541 3.542 3.541h8.333c2.383 0 3.542-1.158 3.542-3.541V7.083c0-2.383-1.159-3.541-3.542-3.541z"/><path d="M9.997 10.725c-.7 0-1.408-.217-1.95-.658L5.439 7.983a.623.623 0 0 1 .775-.975l2.608 2.084c.633.508 1.708.508 2.342 0l2.608-2.084a.615.615 0 0 1 .875.1.615.615 0 0 1-.1.875l-2.608 2.084c-.534.441-1.242.658-1.942.658"/></svg>' +
              "<span>ارسال لیست</span>" +
            "</button>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function buildSidebar(brands, lines, rootId) {
    var n = cartCount();
    var html =
      '<aside class="arc-sidebar">' +
        '<div class="arc-sidebar-sticky">' +
          buildSales() +
          '<div class="arc-filters-head">' +
            "<span>فیلترها</span>" +
            (hasActiveFilters()
              ? '<button type="button" class="arc-clear-filters" data-act="clear-filters">حذف فیلترها</button>'
              : "") +
          "</div>" +
          buildArchiveFilters(brands, rootId) +

          '<div class="arc-basket">' +
            '<div class="arc-basket-head">' +
              "<strong>سبد درخواست</strong>" +
              '<span class="arc-basket-count">' + n + " قلم</span>" +
            "</div>";

    if (!lines.length) {
      html += '<p class="arc-basket-empty">کالایی انتخاب نشده است.</p>';
    } else {
      html += '<ul class="arc-basket-list">';
      lines.forEach(function (line) {
        html +=
          "<li>" +
            basketThumb(line.sku) +
            '<div class="arc-basket-meta">' +
              "<strong>" + esc(line.sku.name) + "</strong>" +
              "<span>" + esc(line.sku.code) + " · " + esc(line.sku.brand) + "</span>" +
              '<div class="arc-basket-price">' + priceBlock(line.sku, true) + "</div>" +
            "</div>" +
            '<div class="arc-qty">' +
              '<button type="button" data-dec="' + esc(line.sku.code) + '" aria-label="کاهش">−</button>' +
              "<span>" + line.qty + "</span>" +
              '<button type="button" data-inc="' + esc(line.sku.code) + '" aria-label="افزایش">+</button>' +
            "</div>" +
          "</li>";
      });
      html += "</ul>";
      html +=
        '<div class="arc-basket-actions">' +
          '<button type="button" class="arc-btn arc-btn-primary" data-act="request">ثبت درخواست خرید</button>' +
          '<button type="button" class="arc-btn arc-btn-ghost" data-act="clear">خالی کردن</button>' +
        "</div>";
    }

    html += "</div></div></aside>";
    return html;
  }

  function buildToolbar() {
    return (
      '<div class="arc-toolbar">' +
        '<div class="arc-view-toggle">' +
          '<span class="arc-view-label">مدل نمایش</span>' +
          '<button type="button" class="arc-view-btn' +
          (state.view === "grid" ? " is-active" : "") +
          '" data-view="grid">' +
            '<svg width="22" height="22" viewBox="0 0 24 25" fill="none" aria-hidden="true"><path stroke="currentColor" stroke-width="1.5" d="M2 18.5c0-1.54 0-2.31.347-2.876.194-.317.46-.583.777-.777C3.689 14.5 4.46 14.5 6 14.5s2.31 0 2.876.347c.317.194.583.46.777.777C10 16.189 10 16.96 10 18.5s0 2.31-.347 2.877c-.194.316-.46.582-.777.776C8.311 22.5 7.54 22.5 6 22.5s-2.31 0-2.876-.347a2.35 2.35 0 0 1-.777-.776C2 20.81 2 20.04 2 18.5ZM14 18.5c0-1.54 0-2.31.347-2.876.194-.317.46-.583.777-.777.565-.347 1.336-.347 2.876-.347s2.31 0 2.877.347c.316.194.582.46.776.777C22 16.189 22 16.96 22 18.5s0 2.31-.347 2.877c-.194.316-.46.582-.776.776-.566.347-1.337.347-2.877.347s-2.31 0-2.876-.347a2.35 2.35 0 0 1-.777-.776C14 20.81 14 20.04 14 18.5ZM2 6.5c0-1.54 0-2.31.347-2.876.194-.317.46-.583.777-.777C3.689 2.5 4.46 2.5 6 2.5s2.31 0 2.876.347c.317.194.583.46.777.777C10 4.189 10 4.96 10 6.5s0 2.31-.347 2.876c-.194.317-.46.583-.777.777C8.311 10.5 7.54 10.5 6 10.5s-2.31 0-2.876-.347a2.35 2.35 0 0 1-.777-.777C2 8.811 2 8.04 2 6.5ZM14 6.5c0-1.54 0-2.31.347-2.876.194-.317.46-.583.777-.777C15.689 2.5 16.46 2.5 18 2.5s2.31 0 2.877.347c.316.194.582.46.776.777C22 4.189 22 4.96 22 6.5s0 2.31-.347 2.876c-.194.317-.46.583-.776.777-.566.347-1.337.347-2.877.347s-2.31 0-2.876-.347a2.35 2.35 0 0 1-.777-.777C14 8.811 14 8.04 14 6.5Z"/></svg>' +
            "محصولات" +
          "</button>" +
          '<button type="button" class="arc-view-btn' +
          (state.view === "list" ? " is-active" : "") +
          '" data-view="list">' +
            '<svg width="22" height="22" viewBox="0 0 24 25" fill="none" aria-hidden="true"><path stroke="currentColor" stroke-linecap="round" stroke-width="1.5" d="M2 11.9c0-1.158.242-1.4 1.4-1.4h17.2c1.158 0 1.4.242 1.4 1.4v1.2c0 1.158-.242 1.4-1.4 1.4H3.4c-1.158 0-1.4-.242-1.4-1.4zM2 3.9c0-1.158.242-1.4 1.4-1.4h17.2c1.158 0 1.4.242 1.4 1.4v1.2c0 1.158-.242 1.4-1.4 1.4H3.4C2.242 6.5 2 6.258 2 5.1zM2 19.9c0-1.158.242-1.4 1.4-1.4h17.2c1.158 0 1.4.242 1.4 1.4v1.2c0 1.158-.242 1.4-1.4 1.4H3.4c-1.158 0-1.4-.242-1.4-1.4z"/></svg>' +
            "لیست قیمت" +
          "</button>" +
        "</div>" +
        '<div class="arc-sort">' +
          '<svg width="22" height="22" viewBox="0 0 24 25" fill="none" aria-hidden="true"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7.5h3M3 17.5h6M18 17.5h3M15 7.5h6"/><path stroke="currentColor" stroke-width="1.5" d="M6 7.5c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C7.602 4.5 8.068 4.5 9 4.5s1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C12 6.102 12 6.568 12 7.5s0 1.398-.152 1.765a2 2 0 0 1-1.083 1.083c-.367.152-.833.152-1.765.152s-1.398 0-1.765-.152a2 2 0 0 1-1.083-1.083C6 8.898 6 8.432 6 7.5ZM12 17.5c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083c.367-.152.833-.152 1.765-.152s1.398 0 1.765.152a2 2 0 0 1 1.083 1.083c.152.367.152.833.152 1.765s0 1.398-.152 1.765a2 2 0 0 1-1.083 1.083c-.367.152-.833.152-1.765.152s-1.398 0-1.765-.152a2 2 0 0 1-1.083-1.083C12 18.898 12 18.432 12 17.5Z"/></svg>' +
          '<span class="arc-sort-label">مرتب‌سازی</span>' +
          '<ul class="arc-sort-list">' +
            SORTS.map(function (s) {
              var active = state.sort === s.id;
              return (
                '<li class="arc-sort-item' +
                (active ? " is-active" : "") +
                '">' +
                  '<button type="button" class="arc-sort-btn' +
                  (active ? " is-active" : "") +
                  '" data-sort="' +
                  s.id +
                  '"><span> ' +
                  esc(s.label) +
                  "</span></button>" +
                "</li>"
              );
            }).join("") +
          "</ul>" +
        "</div>" +
      "</div>"
    );
  }

  function buildSearchBar() {
    return (
      '<div class="arc-search-bar">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.6"/><path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' +
        '<input type="search" class="arc-input arc-search-input" data-q placeholder="جستجو در نام، کد یا برند..." value="' +
        esc(state.query) +
        '" />' +
      "</div>"
    );
  }

  function buildProductCard(sku) {
    var qty = state.cart[sku.code] || 0;
    var inStock = sku.stock === "in";
    var cartCtl = qty
      ? '<div class="arc-qty arc-qty-lg">' +
          '<button type="button" data-dec="' + esc(sku.code) + '">−</button>' +
          "<span>" + qty + "</span>" +
          '<button type="button" data-inc="' + esc(sku.code) + '"' + (inStock ? "" : " disabled") + ">+</button>" +
        "</div>"
      : '<button type="button" class="arc-btn arc-btn-primary arc-btn-sm" data-add="' +
          esc(sku.code) +
          '"' +
          (inStock ? "" : " disabled") +
          ">" +
          '<svg width="18" height="19" viewBox="0 0 18 19" fill="none" aria-hidden="true"><path stroke="currentColor" stroke-linecap="round" stroke-width="1.5" d="M9.75 16.25H8.2c-2.064 0-3.095 0-3.811-.57-.976-.784-1.043-2.376-1.239-3.49l-.444-2.53a1.45 1.45 0 0 0-.817-1.05.36.36 0 0 1-.202-.251c-.128-.606-.467-1.449.292-1.783.171-.076.405-.076.874-.076h2.772m3 0h6.522c.469 0 .703 0 .874.076.76.334.42 1.177.292 1.783a.36.36 0 0 1-.202.25 1.5 1.5 0 0 0-.601.516M11.25 13.625h5.25m-2.625 2.625V11M4.875 8.75l2.625-6m3.75 0 1.875 3.75"/></svg>' +
          (inStock ? "سبد" : "ناموجود") +
        "</button>";

    var logo = brandLogoSrc(sku.brand);
    return (
      '<div class="arc-card-wrap">' +
        '<article class="arc-card' + (qty ? " is-in-cart" : "") + (logo ? " has-brand-logo" : "") + '">' +
          '<div class="arc-card-top">' +
            brandBadge(sku) +
          "</div>" +
          '<div class="arc-card-media">' +
            thumb(sku) +
          "</div>" +
          '<div class="arc-card-body">' +
            '<div class="arc-card-info">' +
              '<h3 class="arc-card-title">' + esc(sku.name) + "</h3>" +
              '<div class="arc-card-meta">' +
                "<span>" + esc(sku.code) + "</span>" +
                stockLabel(sku) +
              "</div>" +
            "</div>" +
            priceBlock(sku) +
            '<div class="arc-card-hover">' +
              '<div class="arc-card-icons">' +
                '<button type="button" class="arc-icon-btn' +
                (state.wishlist[sku.code] ? " is-wished" : "") +
                '" data-wish="' +
                esc(sku.code) +
                '" title="علاقه‌مندی" aria-label="علاقه‌مندی" aria-pressed="' +
                (state.wishlist[sku.code] ? "true" : "false") +
                '">' +
                  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" fill="none" viewBox="0 0 18 16" aria-hidden="true"><path stroke="#2B3674" stroke-linecap="round" stroke-width="1.5" d="M14.597 1.996c-2.011-1.234-3.767-.737-4.821.055-.433.325-.649.487-.776.487s-.343-.162-.776-.487c-1.054-.792-2.81-1.29-4.82-.055-2.64 1.619-3.238 6.96 2.85 11.467 1.16.858 1.74 1.287 2.746 1.287s1.586-.43 2.745-1.287c6.089-4.507 5.491-9.848 2.852-11.467Z"/></svg>' +
                "</button>" +
                '<button type="button" class="arc-icon-btn' +
                (state.compare[sku.code] ? " is-compare" : "") +
                '" data-compare="' +
                  esc(sku.code) +
                  '" title="مقایسه" aria-label="افزودن به مقایسه" aria-pressed="' +
                  (state.compare[sku.code] ? "true" : "false") +
                  '">' +
                  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="12" fill="none" viewBox="0 0 14 12" aria-hidden="true"><path stroke="#2B3674" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12.625 3.75H3.848c-1.049 0-1.574 0-1.7-.313-.126-.312.25-.677 1.005-1.406L4.478.75M1.375 8.25h8.777c1.049 0 1.574 0 1.7.313.126.312-.25.677-1.005 1.406L9.522 11.25"/></svg>' +
                "</button>" +
              "</div>" +
              '<div class="arc-card-cta">' + cartCtl + "</div>" +
            "</div>" +
          "</div>" +
        "</article>" +
      "</div>"
    );
  }

  function buildGrid(skus) {
    if (!skus.length) {
      return '<div class="arc-empty"><p>کالایی با این فیلترها پیدا نشد.</p></div>';
    }
    return (
      '<div class="arc-grid">' +
        skus.map(buildProductCard).join("") +
      "</div>"
    );
  }

  var TOMAN_ICON =
    '<svg class="pl-toman" xmlns="http://www.w3.org/2000/svg" width="18" height="13" fill="none" viewBox="0 0 18 13" aria-hidden="true">' +
      '<path fill="#707EAE" d="M5.292 6.296q-1.56 0-2.412-.9-.84-.888-.84-2.496V.512h1.524v2.352q0 .936.42 1.392t1.32.456h.48q.864 0 1.356-.456.492-.444.492-1.26V.512h1.524v2.352q0 1.08-.432 1.848-.42.78-1.188 1.176-.756.408-1.752.408zM2.472 10.916q.06 0 .084.156.036.156.036.66 0 .48-.036.624-.024.144-.084.144H2.04q-1.008 0-1.524-.576Q0 11.336 0 10.256V4.76h1.512v5.4q0 .396.144.576.156.18.492.18z"/>' +
      '<path fill="#707EAE" d="M5.87 7.484q1.128 0 1.74.648.624.648.624 1.836v.06q0 1.164-.648 1.824-.636.648-1.776.648-.588 0-.996-.156t-.6-.432a1.35 1.35 0 0 1-.564.456q-.336.132-.864.132h-.312q-.12 0-.12-.768 0-.816.12-.816h.312q.336 0 .48-.132t.144-.432v-.336q0-1.164.66-1.848.672-.684 1.8-.684m-.06 1.512q-.9 0-.9.96v.06q0 .444.216.684.228.228.684.228.468 0 .684-.216.228-.228.228-.696v-.06q0-.96-.912-.96"/>' +
      '<path fill="#707EAE" d="M14.065 7.916q.12 0 .12.816 0 .768-.12.768h-.96q-.133 1.356-.96 2.112-.816.756-2.148.756l-1.981-.024 1.088-1.548h.989q.708 0 1.116-.348.408-.336.408-.888V9.5h-.84q-1.2 0-1.812-.576t-.612-1.68v-.06q0-.78.3-1.392.312-.612.852-.96a2.3 2.3 0 0 1 1.26-.348q1.092 0 1.727.732.636.72.636 1.98v.72zm-4.2-.78q0 .432.204.612t.708.18h.84v-.744q0-.588-.24-.888-.228-.3-.66-.3-.42 0-.636.3-.216.288-.216.78z"/>' +
      '<path fill="#707EAE" d="M17.436 7.208q0 1.104-.576 1.704-.576.588-1.596.588h-1.2q-.12 0-.12-.768 0-.816.12-.816h1.188q.3 0 .48-.18.192-.192.192-.552v-1.8h1.512zm-3.084-3.096V2.756h3.384v1.356zM4.748.5v1.356H6.38V.5z"/>' +
    "</svg>";

  var ENQUIRY_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="20" fill="currentColor" viewBox="0 0 22 20" aria-hidden="true">' +
      '<path d="M6.9.256C3.598.256.904 2.95.904 6.252c0 .998.272 1.902.667 2.718l-.65 2.317-.003.012c-.135.54.396 1.07.935.936l.012-.004 2.317-.65c.826.421 1.732.667 2.718.667 3.302 0 5.996-2.694 5.996-5.996S10.203.256 6.9.256m0 .9a5.098 5.098 0 0 1 0 10.193 5 5 0 0 1-2.48-.633.45.45 0 0 0-.34-.04l-2.229.625.625-2.23a.45.45 0 0 0-.034-.328c-.393-.759-.638-1.583-.638-2.491A5.1 5.1 0 0 1 6.9 1.155M4.922 3.583a.51.51 0 0 0-.39.18c-.15.15-.51.509-.51 1.199s.51 1.379.57 1.469c.09.09.99 1.59 2.458 2.159 1.2.48 1.44.39 1.709.36s.84-.36.96-.69c.12-.36.12-.63.12-.66q-.045-.09-.27-.18c-.15-.09-.87-.42-.99-.48-.15-.06-.24-.09-.33.06s-.36.48-.45.57c-.06.09-.15.09-.299.03-.12-.09-.6-.24-1.14-.72-.45-.39-.719-.839-.809-.989s0-.24.06-.3.15-.15.21-.24c.09-.09.09-.15.15-.24s.03-.18 0-.239c-.03-.06-.33-.78-.45-1.05-.12-.24-.24-.24-.33-.24zM17.215 4.262c.254-.019.516.007.772.083l.916.271a2.92 2.92 0 0 1 1.998 2.042c.573 2.175-.083 4.749-1.79 7.646-1.703 2.894-3.645 4.733-5.838 5.333a2.97 2.97 0 0 1-2.8-.683l-.698-.646a2.11 2.11 0 0 1-.266-2.788l1.007-1.368a2.17 2.17 0 0 1 2.367-.782l1.576.472c.066.019.224-.071.362-.19.246-.214.586-.645.95-1.262.39-.662.556-1.096.622-1.352.067-.256.051-.287.041-.374a.2.2 0 0 0-.06-.114l-.001-.001-1.175-1.075a2.105 2.105 0 0 1-.497-2.426l.709-1.546a2.15 2.15 0 0 1 1.805-1.24m.084 1.158a1 1 0 0 0-.833.566l-.71 1.546a.93.93 0 0 0 .225 1.086l1.175 1.073c.241.22.395.52.432.843.01.085.032.401-.07.797-.104.396-.318.92-.747 1.648-.4.679-.779 1.194-1.188 1.55-.133.115-.691.65-1.45.428h-.002l-1.582-.475c-.411-.123-.85.024-1.098.36l-1.007 1.367a.934.934 0 0 0 .121 1.248l.697.647a1.83 1.83 0 0 0 1.705.413c1.773-.486 3.527-2.056 5.144-4.802 1.619-2.749 2.125-5.023 1.667-6.76a1.77 1.77 0 0 0-1.205-1.225l-.915-.271a1 1 0 0 0-.36-.039"/>' +
    "</svg>";

  var QUOTE_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16" aria-hidden="true">' +
      '<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.667 1.333h.182c2.174 0 3.261 0 4.016.532q.325.23.57.537c.565.71.565 1.734.565 3.78v1.697c0 1.975 0 2.963-.312 3.752-.503 1.268-1.566 2.268-2.913 2.741-.838.295-1.888.295-3.987.295-1.2 0-1.799 0-2.278-.168a2.76 2.76 0 0 1-1.664-1.567c-.179-.45-.179-1.015-.179-2.144V8"/>' +
      '<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14 8a2.22 2.22 0 0 1-2.222 2.222c-.444 0-.968-.078-1.4.038a1.11 1.11 0 0 0-.785.786c-.116.431-.038.955-.038 1.398a2.22 2.22 0 0 1-2.222 2.223"/>' +
      '<path stroke="currentColor" stroke-linecap="round" stroke-width="1.5" d="M7.333 4H2m2.667-2.667v5.334"/>' +
    "</svg>";

  var CART_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" fill="none" viewBox="0 0 18 19" aria-hidden="true"><path stroke="currentColor" stroke-linecap="round" stroke-width="1.5" d="M9.75 16.25H8.2c-2.064 0-3.095 0-3.811-.57-.976-.784-1.043-2.376-1.239-3.49l-.444-2.53a1.45 1.45 0 0 0-.817-1.05.36.36 0 0 1-.202-.251c-.128-.606-.467-1.449.292-1.783.171-.076.405-.076.874-.076h2.772m3 0h6.522c.469 0 .703 0 .874.076.76.334.42 1.177.292 1.783a.36.36 0 0 1-.202.25 1.5 1.5 0 0 0-.601.516M11.25 13.625h5.25m-2.625 2.625V11M4.875 8.75l2.625-6m3.75 0 1.875 3.75"/></svg>';

  function listPriceHtml(sku) {
    if (sku.price == null || sku.price === "" || sku.price === "توافقی") {
      return '<span class="pl-price-val">توافقی</span>';
    }
    return (
      '<span class="pl-price-val">' +
      formatMoney(sku.price) +
      "</span>" +
      TOMAN_ICON
    );
  }

  function listStockHtml(sku) {
    if (sku.stock === "in") {
      return '<div class="pl-stock-ok">موجود</div>';
    }
    return '<div class="pl-stock-out">ناموجود</div>';
  }

  function listTitleLink(sku) {
    return (
      '<a class="pl-title-link" href="#product/' +
      esc(sku.code) +
      '">' +
      esc(sku.name) +
      "</a>"
    );
  }

  function canBuyOnline(sku) {
    return (
      sku.stock === "in" &&
      typeof sku.price === "number" &&
      !(sku.price == null || sku.price === "" || sku.price === "توافقی")
    );
  }

  function listEnquiryBtn(sku, opts) {
    var mobile = opts && opts.mobile;
    if (mobile) {
      return (
        '<button type="button" class="pl-buy-btn is-quote-icon" data-enquiry="' +
        esc(sku.code) +
        '" title="استعلام" aria-label="استعلام">' +
        ENQUIRY_ICON +
        "</button>"
      );
    }
    return (
      '<button type="button" class="pl-buy-btn is-quote" data-enquiry="' +
      esc(sku.code) +
      '">' +
      "<span>" +
      ENQUIRY_ICON +
      "</span>استعلام" +
      "</button>"
    );
  }

  function listBuyCtl(sku, opts) {
    var qty = state.cart[sku.code] || 0;

    if (!canBuyOnline(sku)) {
      return listEnquiryBtn(sku, opts);
    }

    if (qty) {
      return (
        '<div class="pl-qty">' +
          '<button type="button" class="pl-qty-btn" data-dec="' +
          esc(sku.code) +
          '" aria-label="کاهش">−</button>' +
          '<span class="pl-qty-val">' +
          qty +
          "</span>" +
          '<button type="button" class="pl-qty-btn" data-inc="' +
          esc(sku.code) +
          '" aria-label="افزایش">+</button>' +
        "</div>"
      );
    }

    return (
      '<button type="button" class="pl-buy-btn is-add" data-add="' +
      esc(sku.code) +
      '">' +
      "<span>" +
      CART_ICON +
      "</span>سبد" +
      "</button>"
    );
  }

  function listQuoteCtl(sku, opts) {
    var compact = opts && opts.compact;
    var compactCls = compact ? " is-compact" : "";
    if (state.quotes[sku.code]) {
      return (
        '<a class="pl-quote-btn pl-quote-view' +
        compactCls +
        '" href="#proforma" data-open-proforma>' +
        "<span>" +
        QUOTE_ICON +
        "</span>مشاهده" +
        "</a>"
      );
    }
    return (
      '<button type="button" class="pl-quote-btn' +
      compactCls +
      '" data-quote="' +
      esc(sku.code) +
      '">' +
      "<span>" +
      QUOTE_ICON +
      "</span>پیش فاکتور" +
      "</button>"
    );
  }

  function listBrandCell(sku, size) {
    var logo = brandLogoSrc(sku.brand);
    var w = size === "sm" ? 32 : 52;
    var h = size === "sm" ? 32 : 42;
    if (logo) {
      return (
        '<img class="pl-brand-img' +
        (size === "sm" ? " is-sm" : "") +
        '" src="' +
        logo +
        '" alt="' +
        esc(sku.brand) +
        '" width="' +
        w +
        '" height="' +
        h +
        '" loading="lazy" decoding="async" />'
      );
    }
    return '<span class="pl-brand-text">' + esc(sku.brand) + "</span>";
  }

  function buildPriceList(skus, title) {
    if (!skus.length) {
      return '<div class="arc-empty"><p>کالایی با این فیلترها پیدا نشد.</p></div>';
    }

    var rows = skus
      .map(function (sku) {
        var priceHtml = listPriceHtml(sku);
        var stockHtml = listStockHtml(sku);
        var titleLink = listTitleLink(sku);
        return (
          '<tr class="pl-row">' +
            '<td class="pl-mobile" colspan="7">' +
              '<div class="pl-mobile-top">' +
                '<div class="pl-mobile-title">' +
                  '<input type="checkbox" />' +
                  titleLink +
                "</div>" +
                '<div class="pl-mobile-buy">' +
                listBuyCtl(sku, { mobile: true }) +
                "</div>" +
              "</div>" +
              '<div class="pl-mobile-meta">' +
                '<div class="pl-mobile-brand">' +
                listBrandCell(sku, "sm") +
                "</div>" +
                '<div class="pl-mobile-price"><div class="pl-price-wrap">' +
                priceHtml +
                "</div></div>" +
                '<div class="pl-mobile-stock">' +
                stockHtml +
                "</div>" +
                '<div class="pl-mobile-quote">' +
                listQuoteCtl(sku, { compact: true }) +
                "</div>" +
              "</div>" +
            "</td>" +
            '<td class="pl-check pl-desk no-print"><input type="checkbox" /></td>' +
            '<td class="pl-title pl-desk">' +
            titleLink +
            "</td>" +
            '<td class="pl-brand pl-desk">' +
            listBrandCell(sku) +
            "</td>" +
            '<td class="pl-price pl-desk"><div class="pl-price-wrap">' +
            priceHtml +
            "</div></td>" +
            '<td class="pl-stock pl-desk">' +
            stockHtml +
            "</td>" +
            '<td class="pl-buy pl-desk no-print">' +
            listBuyCtl(sku) +
            "</td>" +
            '<td class="pl-quote pl-desk no-print">' +
            listQuoteCtl(sku) +
            "</td>" +
          "</tr>"
        );
      })
      .join("");

    return (
      '<div class="wrap-print">' +
        '<div class="pl-toolbar">' +
          '<div class="pl-toolbar-meta">' +
            '<div class="pl-toolbar-title">لیست قیمت ' + esc(title) + "</div>" +
            '<div class="pl-toolbar-date"><span class="pl-date-label">به تاریخ </span>1405/08/17</div>' +
          "</div>" +
          '<div class="pl-toolbar-actions no-print">' +
            '<span class="pl-export-label">دریافت خروجی</span>' +
            '<button type="button" class="pl-export-btn" data-act="print-list" title="چاپ" aria-label="چاپ">' +
              '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20" aria-hidden="true"><path fill="#00A7E7" d="M6.25.5A2.26 2.26 0 0 0 4 2.75v.75h-.75A3.26 3.26 0 0 0 0 6.75v7A2.26 2.26 0 0 0 2.25 16H4v1.25a2.26 2.26 0 0 0 2.25 2.25h7.5A2.26 2.26 0 0 0 16 17.25V16h1.75A2.26 2.26 0 0 0 20 13.75v-7a3.26 3.26 0 0 0-3.25-3.25H16v-.75A2.26 2.26 0 0 0 13.75.5zm0 1.5h7.5c.423 0 .75.327.75.75v.75h-9v-.75c0-.423.327-.75.75-.75m-3 3h13.5c.975 0 1.75.775 1.75 1.75v7c0 .423-.327.75-.75.75H16v-1.75a2.26 2.26 0 0 0-2.25-2.25h-7.5A2.26 2.26 0 0 0 4 12.75v1.75H2.25a.74.74 0 0 1-.75-.75v-7C1.5 5.775 2.275 5 3.25 5m3 7h7.5c.423 0 .75.327.75.75v4.5c0 .423-.327.75-.75.75h-7.5a.74.74 0 0 1-.75-.75v-4.5c0-.423.327-.75.75-.75"/></svg>' +
            "</button>" +
            '<button type="button" class="pl-export-btn" title="PDF" aria-label="PDF">' +
              '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" fill="#FC2254" viewBox="0 0 24 25" aria-hidden="true"><path fill="currentColor" d="M6.25 2.633A2.26 2.26 0 0 0 4 4.883v15.5a2.26 2.26 0 0 0 2.25 2.25h11.5a2.26 2.26 0 0 0 2.25-2.25v-10.5a.75.75 0 0 0-.22-.53l-.008-.008-6.492-6.492a.75.75 0 0 0-.53-.22zm0 1.5H12v4.25a2.26 2.26 0 0 0 2.25 2.25h4.25v9.75c0 .423-.327.75-.75.75H6.25a.74.74 0 0 1-.75-.75v-15.5c0-.423.327-.75.75-.75m7.25 1.06 3.94 3.94h-3.19a.74.74 0 0 1-.75-.75zm-2.25 5.94c-.684 0-1.25.565-1.25 1.25 0 .871.444 1.813 1.026 2.716-.15.49-.315.97-.507 1.404l-.016.005c-1.265.485-2.157 1.042-2.625 1.48a1.253 1.253 0 0 0 .872 2.145c.347 0 .631-.158.846-.331.263-.214.52-.539.823-.994.264-.396.545-.918.816-1.474.433-.15.892-.291 1.4-.402.79.668 1.654 1.2 2.615 1.2.684 0 1.25-.565 1.25-1.25 0-.684-.566-1.25-1.25-1.25-.83 0-1.596.1-2.322.23-.17-.162-.36-.27-.515-.453-.116-.137-.175-.294-.28-.44.22-.822.367-1.694.367-2.586 0-.685-.566-1.25-1.25-1.25m0 1c.143 0 .25.106.25.25 0 .41-.105.81-.167 1.218-.186-.453-.333-.896-.333-1.218 0-.144.107-.25.25-.25m.469 3.984q.017.016.034.031l-.05.015zm3.531.516c.143 0 .25.106.25.25 0 .143-.107.25-.25.25-.35 0-.748-.186-1.14-.388.382-.037.732-.112 1.14-.112m-5.51 1.342c-.05.08-.105.205-.154.278-.272.409-.532.7-.621.772-.107.087-.178.108-.215.108a.24.24 0 0 1-.177-.073.24.24 0 0 1-.073-.177c0-.073.024-.13.06-.165l.002-.001c.184-.172.63-.45 1.178-.742"/></svg>' +
            "</button>" +
            '<button type="button" class="pl-export-btn" title="Excel" aria-label="Excel">' +
              '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" fill="none" viewBox="0 0 16 20" aria-hidden="true"><path fill="#08A54A" d="M2.25 0A2.26 2.26 0 0 0 0 2.25v15.5A2.26 2.26 0 0 0 2.25 20h11.5A2.26 2.26 0 0 0 16 17.75V7.25a.75.75 0 0 0-.22-.53l-.007-.008L9.28.22A.75.75 0 0 0 8.75 0zm0 1.5H8v4.25A2.26 2.26 0 0 0 10.25 8h4.25v9.75c0 .423-.327.75-.75.75H2.25a.74.74 0 0 1-.75-.75V2.25c0-.423.327-.75.75-.75M9.5 2.56l3.94 3.94h-3.19a.74.74 0 0 1-.75-.75zM6.27 9.5a.75.75 0 0 0-.653 1.152L7.111 13l-1.494 2.348a.75.75 0 0 0 1.266.805L8 14.398l1.117 1.754a.75.75 0 0 0 1.035.23.75.75 0 0 0 .23-1.035L8.89 13l1.493-2.347a.75.75 0 1 0-1.266-.806L8 11.603 6.883 9.848A.75.75 0 0 0 6.27 9.5"/></svg>' +
            "</button>" +
          "</div>" +
        "</div>" +
        '<table class="pl-table">' +
          '<thead class="pl-thead">' +
            '<tr class="pl-head-row">' +
              '<td class="pl-check no-print"><input type="checkbox" /></td>' +
              "<td>عنوان</td>" +
              "<td>برند</td>" +
              "<td>قیمت (تومان)</td>" +
              "<td>موجودی </td>" +
              '<td class="no-print">خرید</td>' +
              '<td class="no-print">پیش فاکتور</td>' +
            "</tr>" +
          "</thead>" +
          "<tbody>" + rows + "</tbody>" +
        "</table>" +
      "</div>"
    );
  }

  function buildHTML() {
    if (pendingCategory) {
      var trail0 = findNodeById(pendingCategory);
      if (trail0 && trail0.length) {
        state.path = trail0.map(function (n) { return n.id; });
      } else if (!state.path.length && TREE[0]) {
        state.path = [TREE[0].id];
      }
      pendingCategory = null;
    } else if (!state.path.length && TREE[0]) {
      state.path = [TREE[0].id];
    }

    var trail = resolvePath();
    var leaf = trail[trail.length - 1] || TREE[0];
    var rootId = rootCategoryId(trail);
    var skusAll = collectSkus(leaf);
    var brands = uniqueBrands(skusAll);
    var skus = filteredSkus(skusAll, rootId);
    var pageSkus = pageSlice(skus);
    var lines = cartLines();
    var title = leaf ? leaf.name : "محصولات";

    return (
      '<div class="arc-page" dir="rtl">' +
        '<div class="arc-container">' +
          buildHeader(trail) +
          '<div class="arc-body">' +
            buildSidebar(brands, lines, rootId) +
            '<div class="arc-main">' +
              buildToolbar() +
              buildSearchBar() +
              (state.view === "list" ? buildPriceList(pageSkus, title) : buildGrid(pageSkus)) +
              buildPagination(skus.length) +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function remount() {
    var host = document.getElementById("view-products");
    if (!host) return;
    var qEl = host.querySelector("[data-q]");
    var bqEl = host.querySelector("[data-brand-q]");
    var keepQ = qEl === document.activeElement;
    var keepBq = bqEl === document.activeElement;
    var qPos = keepQ ? qEl.selectionStart : null;
    var bqPos = keepBq ? bqEl.selectionStart : null;

    host.innerHTML = buildHTML();

    if (keepQ) {
      var nq = host.querySelector("[data-q]");
      if (nq) {
        nq.focus();
        try { nq.setSelectionRange(qPos, qPos); } catch (e) {}
      }
    } else if (keepBq) {
      var nbq = host.querySelector("[data-brand-q]");
      if (nbq) {
        nbq.focus();
        try { nbq.setSelectionRange(bqPos, bqPos); } catch (e) {}
      }
    }

    syncHeaderBadges();
  }

  function gotoCrumb(id) {
    if (!id) {
      state.path = TREE[0] ? [TREE[0].id] : [];
      state.page = 1;
      remount();
      return;
    }
    var idx = state.path.indexOf(id);
    if (idx >= 0) {
      state.path = state.path.slice(0, idx + 1);
      state.page = 1;
      remount();
    }
  }

  function addToCart(code) {
    state.cart[code] = (state.cart[code] || 0) + 1;
    remount();
  }

  var navigatePage = null;

  function bind(root, navFn) {
    if (!root || root.__arcBound) return;
    root.__arcBound = true;
    isBound = true;
    if (typeof navFn === "function") navigatePage = navFn;
    syncHeaderBadges();

    root.addEventListener("click", function (e) {
      var t = e.target.closest("[data-open-proforma]");
      if (t) {
        e.preventDefault();
        if (typeof navigatePage === "function") navigatePage("proforma");
        else location.hash = "proforma";
        return;
      }

      t = e.target.closest("[data-goto]");
      if (t) {
        gotoCrumb(t.getAttribute("data-goto") || "");
        return;
      }

      t = e.target.closest("[data-open]");
      if (t) {
        openCategory(t.getAttribute("data-open"));
        return;
      }

      t = e.target.closest("[data-view]");
      if (t) {
        state.view = t.getAttribute("data-view") === "list" ? "list" : "grid";
        state.page = 1;
        remount();
        return;
      }

      t = e.target.closest("[data-sort]");
      if (t) {
        state.sort = t.getAttribute("data-sort") || "expensive";
        state.page = 1;
        remount();
        return;
      }

      t = e.target.closest("[data-page]");
      if (t && !t.disabled) {
        var nextPage = parseInt(t.getAttribute("data-page"), 10);
        if (!isNaN(nextPage) && nextPage !== state.page) {
          state.page = nextPage;
          remount();
          var main = root.querySelector(".arc-main");
          if (main && main.scrollIntoView) {
            try { main.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (err) {}
          }
        }
        return;
      }

      t = e.target.closest("[data-add]");
      if (t && !t.disabled) {
        addToCart(t.getAttribute("data-add"));
        return;
      }

      t = e.target.closest("[data-inc]");
      if (t && !t.disabled) {
        addToCart(t.getAttribute("data-inc"));
        return;
      }

      t = e.target.closest("[data-dec]");
      if (t) {
        var code = t.getAttribute("data-dec");
        var q = (state.cart[code] || 0) - 1;
        if (q <= 0) delete state.cart[code];
        else state.cart[code] = q;
        remount();
        return;
      }

      t = e.target.closest("[data-wish]");
      if (t) {
        toggleWishlist(t.getAttribute("data-wish") || "");
        remount();
        return;
      }

      t = e.target.closest("[data-compare]");
      if (t) {
        toggleCompare(t.getAttribute("data-compare") || "");
        remount();
        return;
      }

      t = e.target.closest(
        ".pl-buy-btn.is-quote, .pl-buy-btn.is-quote-icon, [data-enquiry]"
      );
      if (t) {
        var enquiryCode =
          t.getAttribute("data-enquiry") ||
          t.getAttribute("data-quote") ||
          "";
        if (window.DamoonChatbot && typeof window.DamoonChatbot.open === "function") {
          window.DamoonChatbot.open(
            enquiryCode
              ? "سلام، درخواست استعلام قیمت برای کد " + enquiryCode + " دارم."
              : "سلام، می‌خواهم استعلام قیمت بگیرم."
          );
        } else {
          alert(
            enquiryCode
              ? "استعلام قیمت برای کد " + enquiryCode + " ثبت شد."
              : "گفتگوی سریع در دسترس نیست."
          );
        }
        return;
      }

      t = e.target.closest("[data-quote]");
      if (t && !t.hasAttribute("data-open-proforma")) {
        addQuote(t.getAttribute("data-quote") || "");
        remount();
        return;
      }

      t = e.target.closest("[data-act]");
      if (t) {
        var act = t.getAttribute("data-act");
        if (act === "toggle-desc") {
          state.descOpen = !state.descOpen;
          remount();
        } else if (act === "toggle-filter") {
          toggleFilterSection(t.getAttribute("data-filter-key") || "brand");
          remount();
        } else if (act === "clear-filters") {
          clearFilters();
          remount();
        } else if (act === "clear") {
          state.cart = {};
          remount();
        } else if (act === "request") {
          var n = cartCount();
          if (!n) {
            alert("سبد درخواست خالی است.");
            return;
          }
          alert("درخواست خرید با " + n + " قلم ثبت شد.\nوضعیت را در بخش «خریدهای من» پیگیری کنید.");
          state.cart = {};
          remount();
        } else if (act === "enquiry") {
          if (window.DamoonChatbot && typeof window.DamoonChatbot.open === "function") {
            window.DamoonChatbot.open();
          } else {
            alert("گفتگوی سریع با تیم فروش دامون به‌زودی فعال می‌شود.");
          }
        } else if (act === "print-list") {
          try { window.print(); } catch (err) {}
        } else if (act === "list") {
          var lines = cartLines();
          if (!lines.length) {
            alert("ابتدا کالا را به سبد درخواست اضافه کنید، سپس لیست را ارسال کنید.");
            return;
          }
          var text = lines
            .map(function (l) {
              return l.sku.code + " × " + l.qty + " — " + l.sku.name;
            })
            .join("\n");
          alert("لیست درخواست برای تیم فروش:\n\n" + text);
        }
      }
    });

    root.addEventListener("change", function (e) {
      var brandEl = e.target.closest("[data-brand]");
      if (brandEl) {
        var b = brandEl.getAttribute("data-brand");
        if (brandEl.checked) state.brands[b] = true;
        else delete state.brands[b];
        state.page = 1;
        remount();
        return;
      }

      var attrEl = e.target.closest("[data-attr-key]");
      if (attrEl) {
        var aKey = attrEl.getAttribute("data-attr-key");
        var aVal = attrEl.getAttribute("data-attr-val");
        if (!state.attrs[aKey]) state.attrs[aKey] = {};
        if (attrEl.checked) state.attrs[aKey][aVal] = true;
        else delete state.attrs[aKey][aVal];
        state.page = 1;
        remount();
        return;
      }

      if (e.target.matches("[data-stock]")) {
        state.stockOnly = !!e.target.checked;
        state.page = 1;
        remount();
        return;
      }
      if (e.target.matches("[data-discounted]")) {
        state.discountedOnly = !!e.target.checked;
        state.page = 1;
        remount();
        return;
      }
      if (e.target.matches("[data-online]")) {
        state.onlineOnly = !!e.target.checked;
        state.page = 1;
        remount();
      }
    });

    root.addEventListener("input", function (e) {
      if (e.target.matches("[data-q]")) {
        state.query = e.target.value;
        state.page = 1;
        remount();
        return;
      }
      if (e.target.matches("[data-brand-q]")) {
        state.brandQuery = e.target.value;
        remount();
      }
    });
  }

  function refreshAfterCompareChange() {
    syncCompareDock();
    remount();
    var hash = (location.hash || "").replace(/^#/, "");
    if (hash === "compare" && typeof navigatePage === "function") {
      navigatePage("compare");
    }
  }

  document.addEventListener("click", function (e) {
    var rm = e.target.closest("[data-compare-remove]");
    if (rm) {
      removeCompare(rm.getAttribute("data-compare-remove") || "");
      refreshAfterCompareChange();
      return;
    }
    if (e.target.closest("[data-compare-clear]")) {
      clearCompare();
      refreshAfterCompareChange();
      return;
    }
    if (e.target.closest("[data-open-compare]")) {
      if (compareCount() < 2) return;
      if (typeof navigatePage === "function") navigatePage("compare");
      else location.hash = "compare";
      syncCompareDock();
    }
  });

  global.DamoonProducts = {
    buildHTML: buildHTML,
    bind: bind,
    setNavigate: function (fn) {
      if (typeof fn === "function") navigatePage = fn;
    },
    getMegaMenuData: getMegaMenuData,
    openCategory: openCategory,
    quoteLines: quoteLines,
    setQuoteQty: setQuoteQty,
    removeQuote: removeQuote,
    formatMoney: formatMoney,
    syncHeaderBadges: syncHeaderBadges,
    compareLines: compareLines,
    getCompareSpecs: getCompareSpecs,
    removeCompare: removeCompare,
    clearCompare: clearCompare,
    syncCompareDock: syncCompareDock,
  };
})(window);
