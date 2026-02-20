
/* =======================
   LOCAL DATABASE
======================= */
let DB = JSON.parse(localStorage.getItem("POSDZ")) || {
  users: [{ name: "Admin", pin: "1234", role: "manager", immutable: true }],
  settings: { name: "POS DZ", phone: "", addr: "" },
  stock: [],
  cart: [],
  customers: [],
  debts: [],
  sales: []
};

/* =======================
   DOM ELEMENTS
======================= */
const loginScreen   = document.getElementById("loginScreen");
const userSelect    = document.getElementById("userSelect");
const pinInput      = document.getElementById("pin");
const mainApp       = document.getElementById("mainApp");

const usersModal      = document.getElementById("usersModal");
const usersTableBody  = document.querySelector("#usersTable tbody");
const addUserForm     = document.getElementById("addUserForm");
const newUserName     = document.getElementById("newUserName");
const newUserPin      = document.getElementById("newUserPin");
const newUserRole     = document.getElementById("newUserRole");

const alertUserName   = document.getElementById("alertUserName");
const alertUserPin    = document.getElementById("alertUserPin");
const alertUserRole   = document.getElementById("alertUserRole");
const addUserInAlerts = document.getElementById("addUserInAlerts");

const stockList       = document.getElementById("stockList");
const sideMenu        = document.getElementById("sideMenu");
const menuBtn         = document.getElementById("menuBtn");

const currentTimeEl   = document.getElementById("currentTime");
const currentDateEl   = document.getElementById("currentDate");

const salePage        = document.getElementById("sale");
const cartTableBody   = document.getElementById("cart");
const searchInput     = document.getElementById("search");
const custSelect      = document.getElementById("custSelect");
const totalEl         = document.getElementById("total");

/* =======================
   UTILITY FUNCTIONS
======================= */
function saveDB() { localStorage.setItem("POSDZ", JSON.stringify(DB)); }
function formatPrice(val) { return Number(val).toFixed(2) + " دج"; }

/* =======================
   LOGIN SYSTEM
======================= */
function renderUserSelect() {
  userSelect.innerHTML = '<option value="">— اختر المستخدم —</option>';
  DB.users.forEach(u => {
    const opt = document.createElement("option");
    opt.value = u.name;
    opt.textContent = u.name;
    userSelect.appendChild(opt);
  });
}

function login() {
  const selectedName = userSelect.value;
  const pin = pinInput.value.trim();
  if (!selectedName) { alert("اختر المستخدم أولاً"); return; }
  const user = DB.users.find(u => u.name === selectedName && u.pin === pin);
  if (!user) { alert("اسم المستخدم أو الرمز خاطئ"); return; }
  localStorage.setItem("POSDZ_LOGGED", JSON.stringify(user));
  loginScreen.style.display = "none";
  mainApp.style.display = "block";
  document.getElementById("shopName").textContent = DB.settings.name || "POS DZ";
  showSale();
  startClock();
}

function logout() {
  localStorage.removeItem("POSDZ_LOGGED");
  loginScreen.style.display = "flex";
  mainApp.style.display = "none";
  sideMenu.classList.add("hidden");
}

/* =======================
   SETTINGS
======================= */
function loadSettings() {
  document.getElementById("sname").value  = DB.settings.name  || "";
  document.getElementById("sphone").value = DB.settings.phone || "";
  document.getElementById("saddr").value  = DB.settings.addr  || "";
}

function saveSettings() {
  DB.settings.name  = document.getElementById("sname").value.trim();
  DB.settings.phone = document.getElementById("sphone").value.trim();
  DB.settings.addr  = document.getElementById("saddr").value.trim();
  document.getElementById("shopName").textContent = DB.settings.name || "POS DZ";
  saveDB();
  alert("تم حفظ الإعدادات بنجاح!");
}

/* =======================
   USER MANAGEMENT
======================= */
function renderUsersTable() {
  usersTableBody.innerHTML = "";
  DB.users.forEach((user, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${user.name}</td>
      <td>${"*".repeat(user.pin.length)}</td>
      <td>${user.role === "manager" ? "مدير" : "بائع"}</td>
      <td>
        <button onclick="editUser(${index})" ${user.immutable ? "disabled" : ""}>تعديل</button>
        <button onclick="deleteUser(${index})" ${user.immutable ? "disabled" : ""} style="background:#ef4444">حذف</button>
      </td>
    `;
    usersTableBody.appendChild(tr);
  });
}

function addUser(e) {
  e.preventDefault();
  const name = newUserName.value.trim();
  const pin  = newUserPin.value.trim();
  const role = newUserRole.value;
  if (!name || pin.length !== 4 || !/^\d+$/.test(pin)) { alert("الرجاء إدخال اسم صحيح وPIN من 4 أرقام"); return; }
  if (DB.users.find(u => u.name === name)) { alert("اسم المستخدم موجود مسبقًا"); return; }
  DB.users.push({ name, pin, role, immutable: false });
  saveDB();
  renderUsersTable(); renderUserSelect(); renderAlerts();
  addUserForm.reset();
}

function editUser(index) {
  const user = DB.users[index];
  const newName = prompt("تعديل الاسم:", user.name) || user.name;
  const newPin  = prompt("تعديل PIN (4 أرقام):", user.pin) || user.pin;
  const newRole = prompt("تعديل الدور (manager/baker):", user.role) || user.role;
  if (newPin.length !== 4 || !/^\d+$/.test(newPin)) { alert("PIN يجب أن يكون 4 أرقام"); return; }
  user.name = newName; user.pin = newPin; user.role = newRole;
  saveDB();
  renderUsersTable(); renderUserSelect(); renderAlerts();
}

function deleteUser(index) {
  if (DB.users[index].immutable) { alert("لا يمكن حذف هذا المستخدم"); return; }
  if (confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
    DB.users.splice(index, 1);
    saveDB(); renderUsersTable(); renderUserSelect(); renderAlerts();
  }
}

function renderAlerts() {
  const alertList = document.getElementById("alertList");
  alertList.innerHTML = "";
  DB.users.forEach((user, index) => {
    const li = document.createElement("li");
    li.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #eee";
    li.innerHTML = `
      <span><strong>${user.name}</strong> — ${user.role === "manager" ? "مدير" : "بائع"}</span>
      <span>
        <button onclick="editUser(${index})" ${user.immutable ? "disabled" : ""}>تعديل</button>
        <button onclick="deleteUser(${index})" ${user.immutable ? "disabled" : ""} style="background:#ef4444;margin-right:4px">حذف</button>
      </span>
    `;
    alertList.appendChild(li);
  });
}

function addUserInAlertsFunc(e) {
  e.preventDefault();
  const name = alertUserName.value.trim();
  const pin  = alertUserPin.value.trim();
  const role = alertUserRole.value;
  if (!name || pin.length !== 4 || !/^\d+$/.test(pin)) { alert("الرجاء إدخال اسم صحيح وPIN من 4 أرقام"); return; }
  if (DB.users.find(u => u.name === name)) { alert("اسم المستخدم موجود مسبقًا"); return; }
  DB.users.push({ name, pin, role, immutable: false });
  saveDB(); renderUsersTable(); renderUserSelect(); renderAlerts();
  addUserInAlerts.reset();
}

function closeUsersModal() {
  usersModal.style.display = "none";
}

/* =======================
   NAVIGATION
======================= */
function hideAllPages() { document.querySelectorAll(".page").forEach(p => p.classList.remove("active")); }

function showSale() {
  hideAllPages();
  salePage.classList.add("active");
  renderCustomerSelect();
  sideMenu.classList.add("hidden");
}

function show(id) {
  hideAllPages();
  const page = document.getElementById(id);
  if (page) page.classList.add("active");
  if (id === "reports")  renderReports();
  if (id === "settings") loadSettings();
  if (id === "alerts")   renderAlerts();
  if (id === "customers") renderCustomerList();
  if (id === "stock")    renderStock();
  sideMenu.classList.add("hidden");
}

function goBack() { showSale(); }

/* =======================
   CUSTOMERS
======================= */
function renderCustomerSelect() {
  custSelect.innerHTML = '<option value="">— بدون زبون —</option>';
  DB.customers.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.name;
    opt.textContent = c.name;
    custSelect.appendChild(opt);
  });
}

function addCustomer() {
  const name = document.getElementById("cname").value.trim();
  if (!name) { alert("أدخل اسم الزبون"); return; }
  if (DB.customers.find(c => c.name === name)) { alert("الزبون موجود مسبقًا"); return; }
  DB.customers.push({ name, debts: [] });
  document.getElementById("cname").value = "";
  saveDB();
  renderCustomerList();
  renderCustomerSelect();
}

function renderCustomerList() {
  const clist = document.getElementById("clist");
  clist.innerHTML = "";
  if (DB.customers.length === 0) {
    clist.innerHTML = "<li style='color:#6b7280;text-align:center'>لا يوجد زبائن بعد</li>";
    return;
  }
  DB.customers.forEach((c, index) => {
    const totalDebt = (c.debts || []).reduce((s, d) => s + (d.remaining || 0), 0);
    const li = document.createElement("li");
    li.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:8px 4px;border-bottom:1px solid #eee";
    li.innerHTML = `
      <span><strong>${c.name}</strong>${totalDebt > 0 ? ` <span style="color:#ef4444;font-size:13px">(دين: ${formatPrice(totalDebt)})</span>` : ""}</span>
      <button onclick="deleteCustomer(${index})" style="background:#ef4444;padding:5px 10px;font-size:13px">حذف</button>
    `;
    clist.appendChild(li);
  });
}

function deleteCustomer(index) {
  if (confirm("هل أنت متأكد من حذف هذا الزبون؟")) {
    DB.customers.splice(index, 1);
    saveDB(); renderCustomerList(); renderCustomerSelect();
  }
}

/* =======================
   STOCK MANAGEMENT
======================= */
function saveItem() {
  const type      = document.getElementById("type").value.trim();
  const brand     = document.getElementById("brand").value.trim();
  const size      = document.getElementById("size").value.trim();
  const barcode   = document.getElementById("barcode").value.trim();
  const price     = parseFloat(document.getElementById("price").value);
  const costPrice = parseFloat(document.getElementById("costPrice").value);
  const qty       = parseInt(document.getElementById("qty").value);
  const exp       = document.getElementById("exp").value;

  if (!type || !brand || !barcode || isNaN(price) || isNaN(costPrice) || isNaN(qty)) {
    alert("الرجاء إدخال كل البيانات بشكل صحيح!"); return;
  }

  const existing = DB.stock.find(i => i.barcode === barcode);
  if (existing) {
    existing.qty += qty;
    alert("المنتج موجود — تم تحديث الكمية!");
  } else {
    DB.stock.push({ type, brand, size, barcode, price, costPrice, qty, exp });
    alert("تم إضافة السلعة بنجاح!");
  }

  // مسح الحقول
  ["type","brand","size","barcode","price","costPrice","qty","exp"].forEach(id => {
    document.getElementById(id).value = "";
  });

  saveDB(); renderStock();
}

function editItem(index) {
  const item = DB.stock[index];
  const newPrice = prompt("السعر الجديد:", item.price);
  const newQty   = prompt("الكمية الجديدة:", item.qty);
  if (newPrice !== null && !isNaN(newPrice)) item.price = parseFloat(newPrice);
  if (newQty   !== null && !isNaN(newQty))   item.qty   = parseInt(newQty);
  saveDB(); renderStock();
}

function deleteItem(index) {
  if (!confirm("حذف المنتج؟")) return;
  DB.stock.splice(index, 1);
  saveDB(); renderStock();
}

function renderStock() {
  stockList.innerHTML = "";
  if (DB.stock.length === 0) {
    stockList.innerHTML = "<li style='color:#6b7280;text-align:center'>المخزون فارغ</li>";
    return;
  }
  DB.stock.forEach((item, index) => {
    const li = document.createElement("li");
    const expired = item.exp && new Date(item.exp) < new Date();
    li.style.cssText = "padding:8px 4px;border-bottom:1px solid #eee";
    li.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
        <span>
          <strong>${item.type}</strong> | ${item.brand} ${item.size ? "| "+item.size : ""}
          | باركود: <code>${item.barcode}</code>
          | سعر بيع: <strong>${formatPrice(item.price)}</strong>
          | كمية: <strong style="color:${item.qty < 5 ? '#ef4444' : '#10b981'}">${item.qty}</strong>
          ${expired ? '<span style="color:#ef4444;font-size:12px"> ⚠ منتهي الصلاحية</span>' : ""}
        </span>
        <span>
          <button onclick="editItem(${index})" style="padding:5px 10px;font-size:13px">تعديل</button>
          <button onclick="deleteItem(${index})" style="background:#ef4444;padding:5px 10px;font-size:13px;margin-right:4px">مسح</button>
        </span>
      </div>
    `;
    stockList.appendChild(li);
  });
}

/* =======================
   SALE & CART
======================= */
function renderSaleStock() {
  cartTableBody.innerHTML = "";
  DB.cart.forEach((cItem, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${cItem.name}</td>
      <td>
        <button onclick="decreaseQty(${index})" style="padding:3px 10px">−</button>
        <strong> ${cItem.qty} </strong>
        <button onclick="increaseQty(${index})" style="padding:3px 10px">+</button>
      </td>
      <td>${formatPrice(cItem.price)}</td>
      <td>${formatPrice(cItem.price * cItem.qty)}</td>
      <td><button onclick="removeFromCart(${index})" style="background:#ef4444;padding:5px 10px;font-size:13px">حذف</button></td>
    `;
    cartTableBody.appendChild(tr);
  });
  updateTotal();
}

function increaseQty(index) {
  const cartItem = DB.cart[index];
  const stockItem = DB.stock.find(s => s.barcode === cartItem.barcode);
  if (stockItem && cartItem.qty >= stockItem.qty) {
    alert("لا يوجد مخزون كافٍ!"); return;
  }
  cartItem.qty += 1;
  saveDB(); renderSaleStock();
}

function decreaseQty(index) {
  DB.cart[index].qty -= 1;
  if (DB.cart[index].qty <= 0) DB.cart.splice(index, 1);
  saveDB(); renderSaleStock();
}

function addItem() {
  const searchVal = searchInput.value.trim().toLowerCase();
  if (!searchVal) { alert("أدخل اسم السلعة أو الباركود"); return; }
  const item = DB.stock.find(i =>
    i.type.toLowerCase().includes(searchVal) || i.barcode.includes(searchVal)
  );
  if (!item) { alert("المنتج غير موجود في المخزون"); return; }
  if (item.qty <= 0) { alert("هذا المنتج نفذ من المخزون!"); return; }

  const cartItem = DB.cart.find(c => c.barcode === item.barcode);
  if (cartItem) {
    if (cartItem.qty >= item.qty) { alert("لا يوجد مخزون كافٍ!"); return; }
    cartItem.qty += 1;
  } else {
    DB.cart.push({ name: item.type, barcode: item.barcode, price: item.price, costPrice: item.costPrice, qty: 1 });
  }

  searchInput.value = "";
  saveDB(); renderSaleStock();
}

function removeFromCart(index) {
  DB.cart.splice(index, 1);
  saveDB(); renderSaleStock();
}

function updateTotal() {
  const total = DB.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  totalEl.textContent = formatPrice(total);
}

/* =======================
   PAYMENT FUNCTIONS
======================= */
function getCartTotal() {
  return DB.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

function deductStock() {
  DB.cart.forEach(cItem => {
    const stockItem = DB.stock.find(s => s.barcode === cItem.barcode);
    if (stockItem) stockItem.qty -= cItem.qty;
  });
}

function buildSale(type, paid) {
  return {
    date: new Date().toISOString(),
    customer: custSelect.value || "زبون عادي",
    type,
    paid: paid || 0,
    total: getCartTotal(),
    items: DB.cart.map(i => ({
      name: i.name, barcode: i.barcode,
      price: i.price, cost: i.costPrice || 0, qty: i.qty
    }))
  };
}

// دفع كامل
function pay() {
  if (DB.cart.length === 0) { alert("لا يوجد منتجات في العربة!"); return; }
  const paidVal = parseFloat(document.getElementById("paid").value);
  const total   = getCartTotal();
  if (!isNaN(paidVal) && paidVal < total) {
    alert(`المبلغ المدفوع (${formatPrice(paidVal)}) أقل من الإجمالي (${formatPrice(total)})`);
    return;
  }
  const change = !isNaN(paidVal) ? paidVal - total : 0;
  deductStock();
  DB.sales.push(buildSale("كامل", paidVal || total));
  DB.cart = [];
  document.getElementById("paid").value = "";
  saveDB();
  if (change > 0) alert(`✅ تم البيع بنجاح!\nالباقي للزبون: ${formatPrice(change)}`);
  else alert("✅ تم تسجيل البيع بنجاح!");
  renderSaleStock(); renderReports();
}

// دفع جزئي
function partial() {
  if (DB.cart.length === 0) { alert("لا يوجد منتجات في العربة!"); return; }
  const paidVal = parseFloat(document.getElementById("paid").value);
  const total   = getCartTotal();
  if (isNaN(paidVal) || paidVal <= 0) { alert("أدخل المبلغ المدفوع جزئياً"); return; }
  if (paidVal >= total) { alert("المبلغ يغطي الكل، استخدم 'تسديد' بدلاً من 'جزئي'"); return; }

  const remaining = total - paidVal;
  const customerName = custSelect.value || "زبون عادي";

  // إضافة الدين للزبون
  const customer = DB.customers.find(c => c.name === customerName);
  const debtRecord = { date: new Date().toISOString(), total, paid: paidVal, remaining };
  if (customer) {
    customer.debts = customer.debts || [];
    customer.debts.push(debtRecord);
  }

  deductStock();
  DB.sales.push(buildSale("جزئي", paidVal));
  if (!DB.debts) DB.debts = [];
  DB.debts.push({ customer: customerName, ...debtRecord });
  DB.cart = [];
  document.getElementById("paid").value = "";
  saveDB();
  alert(`✅ تم تسجيل الدفع الجزئي!\nالمبلغ المدفوع: ${formatPrice(paidVal)}\nالمتبقي: ${formatPrice(remaining)}`);
  renderSaleStock(); renderReports();
}

// دين كامل
function toDebt() {
  if (DB.cart.length === 0) { alert("لا يوجد منتجات في العربة!"); return; }
  const customerName = custSelect.value;
  if (!customerName) { alert("اختر زبوناً لتسجيل الدين عليه"); return; }
  const total = getCartTotal();

  const customer = DB.customers.find(c => c.name === customerName);
  const debtRecord = { date: new Date().toISOString(), total, paid: 0, remaining: total };
  if (customer) {
    customer.debts = customer.debts || [];
    customer.debts.push(debtRecord);
  }

  deductStock();
  DB.sales.push(buildSale("دين", 0));
  if (!DB.debts) DB.debts = [];
  DB.debts.push({ customer: customerName, ...debtRecord });
  DB.cart = [];
  saveDB();
  alert(`✅ تم تسجيل الدين على ${customerName}\nالمبلغ: ${formatPrice(total)}`);
  renderSaleStock(); renderReports();
}

/* =======================
   FINANCIAL REPORTS
======================= */
function renderReports() {
  if (!DB.sales) return;
  let salesCount = 0, revenue = 0, cost = 0;
  let debtTotal  = 0;

  DB.sales.forEach(sale => {
    salesCount++;
    sale.items.forEach(i => {
      revenue += i.price * i.qty;
      cost    += (i.cost || 0) * i.qty;
    });
  });

  (DB.debts || []).forEach(d => { debtTotal += d.remaining || 0; });

  const profit = revenue - cost;
  document.getElementById("rSales").textContent   = salesCount;
  document.getElementById("rRevenue").textContent = revenue.toFixed(2);
  document.getElementById("rCost").textContent    = cost.toFixed(2);
  document.getElementById("rProfit").textContent  = profit.toFixed(2);

  // إضافة سطر الديون إن لم يكن موجوداً
  let debtRow = document.getElementById("rDebtRow");
  if (!debtRow) {
    const reportsBox = document.getElementById("reportsBox");
    debtRow = document.createElement("p");
    debtRow.id = "rDebtRow";
    reportsBox.appendChild(debtRow);
  }
  debtRow.innerHTML = `الديون غير المسددة: <span style="color:#ef4444"><strong>${debtTotal.toFixed(2)}</strong></span> دج`;
}

/* =======================
   CLOCK & DATE
======================= */
function startClock() {
  function updateTime() {
    const now = new Date();
    currentTimeEl.textContent = now.toLocaleTimeString("ar-DZ");
    const day   = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year  = now.getFullYear();
    currentDateEl.textContent = `${day}-${month}-${year}`;
  }
  updateTime(); setInterval(updateTime, 1000);
}

/* =======================
   MENU TOGGLE
======================= */
menuBtn.addEventListener("click", () => { sideMenu.classList.toggle("hidden"); });

// إغلاق القائمة بالضغط خارجها
document.addEventListener("click", (e) => {
  if (!sideMenu.contains(e.target) && e.target !== menuBtn) {
    sideMenu.classList.add("hidden");
  }
});

/* =======================
   INITIALIZATION
======================= */
addUserForm.addEventListener("submit", addUser);
addUserInAlerts.addEventListener("submit", addUserInAlertsFunc);

// تشغيل العرض الأولي
renderUsersTable();
renderUserSelect();
renderStock();
renderSaleStock();
renderCustomerSelect();
renderCustomerList();

const logged = JSON.parse(localStorage.getItem("POSDZ_LOGGED"));
if (logged) {
  loginScreen.style.display = "none";
  mainApp.style.display = "block";
  document.getElementById("shopName").textContent = DB.settings.name || "POS DZ";
  showSale();
  startClock();
} else {
  loginScreen.style.display = "flex";
  mainApp.style.display = "none";
}
