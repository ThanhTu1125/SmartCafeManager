import axios from "axios";

const API = "http://localhost:8080/api/v1";
const FE = "http://localhost:5173";
const results = [];

function ok(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`OK   ${name}${detail ? " — " + detail : ""}`);
}
function fail(name, detail = "") {
  results.push({ name, ok: false, detail: String(detail).slice(0, 220) });
  console.log(`FAIL ${name} — ${String(detail).slice(0, 220)}`);
}

async function expectStatus(name, fn, expectCodes = [200]) {
  try {
    const res = await fn();
    const code = res.status;
    if (expectCodes.includes(code)) ok(name, `HTTP ${code}`);
    else fail(name, `HTTP ${code}`);
    return res;
  } catch (err) {
    const code = err.response?.status;
    const msg =
      typeof err.response?.data === "string"
        ? err.response.data
        : err.response?.data?.message || err.message;
    if (code && expectCodes.includes(code)) ok(name, `HTTP ${code}`);
    else fail(name, `HTTP ${code || "?"} ${msg}`);
    return null;
  }
}

async function login(username, password) {
  const res = await axios.post(`${API}/auth/login`, { username, password });
  return res.data;
}

async function main() {
  console.log("=== SMOKE CHECK SmartCafeManager ===\n");

  // FE pages
  for (const path of ["/", "/home", "/news", "/menu/table/1", "/forgot-password"]) {
    await expectStatus(`FE ${path}`, () => axios.get(`${FE}${path}`), [200]);
  }

  // Public APIs
  await expectStatus("Items list", () => axios.get(`${API}/items`));
  await expectStatus("Items latest", () => axios.get(`${API}/items/latest`));
  await expectStatus("Items best-sellers", () => axios.get(`${API}/items/best-sellers`));
  const newsList = await expectStatus("News public list", () =>
    axios.get(`${API}/news`, { params: { page: 0, size: 10 } })
  );
  const firstNewsId = newsList?.data?.content?.[0]?.newsId;
  if (firstNewsId) {
    await expectStatus(`News detail #${firstNewsId}`, () =>
      axios.get(`${API}/news/${firstNewsId}`)
    );
  } else {
    fail("News detail", "no published news");
  }

  // Auth negatives
  await expectStatus(
    "Login wrong password",
    () => axios.post(`${API}/auth/login`, { username: "admin", password: "wrong" }),
    [400, 401]
  );
  await expectStatus(
    "Profile without token",
    () => axios.get(`${API}/users/profile`),
    [401, 403]
  );

  // Customer login + profile
  let customer;
  try {
    customer = await login("khach_vip01", "123456");
    ok("Login customer", `role=${customer.roleName}`);
  } catch (e) {
    fail("Login customer", e.response?.data?.message || e.message);
  }
  if (customer?.token) {
    const h = { Authorization: `Bearer ${customer.token}` };
    await expectStatus("Customer profile", () =>
      axios.get(`${API}/users/profile`, { headers: h })
    );
    await expectStatus(
      "Customer blocked from admin news",
      () => axios.get(`${API}/news/admin/all`, { headers: h, params: { page: 0, size: 5 } }),
      [401, 403]
    );
  }

  // Admin login + news CRUD surface
  let admin;
  try {
    admin = await login("admin", "123456");
    ok("Login admin", `role=${admin.roleName}`);
  } catch (e) {
    fail("Login admin", e.response?.data?.message || e.message);
  }
  if (admin?.token) {
    const h = { Authorization: `Bearer ${admin.token}` };
    await expectStatus("Admin profile", () =>
      axios.get(`${API}/users/profile`, { headers: h })
    );
    const adminNews = await expectStatus("Admin news list", () =>
      axios.get(`${API}/news/admin/all`, { headers: h, params: { page: 0, size: 10 } })
    );
    const adminId = adminNews?.data?.content?.[0]?.newsId;
    if (adminId) {
      await expectStatus(`Admin news detail #${adminId}`, () =>
        axios.get(`${API}/news/admin/${adminId}`, { headers: h })
      );
    } else {
      fail("Admin news detail", "empty list");
    }
    await expectStatus("Admin employees list", () =>
      axios.get(`${API}/admin/employees`, { headers: h })
    );
    await expectStatus("Admin customers list", () =>
      axios.get(`${API}/admin/customers`, { headers: h })
    );
  }

  // Staff login
  let staff;
  try {
    staff = await login("thungan01", "123456");
    ok("Login staff thungan01", `role=${staff.roleName}`);
  } catch (e) {
    try {
      staff = await login("phabep01", "123456");
      ok("Login staff phabep01", `role=${staff.roleName}`);
    } catch (e2) {
      fail("Login staff", e2.response?.data?.message || e2.message);
    }
  }

  // Customer order flow (table 1)
  await expectStatus("Table info 1", () =>
    axios.get(`${API}/customer/table-info`, { params: { tableId: 1 } })
  );
  await expectStatus("Cart table 1", () => axios.get(`${API}/customer/cart/1`));

  // Try add first item to cart if items exist
  try {
    const itemsRes = await axios.get(`${API}/items`);
    const items = Array.isArray(itemsRes.data) ? itemsRes.data : itemsRes.data?.content || [];
    const itemId = items[0]?.itemId || items[0]?.id;
    if (itemId) {
      await expectStatus("Add item to cart", () =>
        axios.post(`${API}/customer/cart/add`, null, {
          params: { tableId: 1, itemId, quantity: 1 },
        })
      );
      await expectStatus("Cart after add", () => axios.get(`${API}/customer/cart/1`));
    } else {
      fail("Add item to cart", "no items in menu");
    }
  } catch (e) {
    fail("Add item to cart", e.response?.data || e.message);
  }

  // Forgot password (should not crash; may be 200 even if email unknown)
  await expectStatus(
    "Forgot password API",
    () =>
      axios.post(`${API}/auth/forgot-password`, {
        email: "codegymintern@gmail.com",
      }),
    [200, 400]
  );

  // Verify OTP bad token
  await expectStatus(
    "Verify OTP invalid",
    () => axios.post(`${API}/auth/verify-otp`, { token: "invalid-otp-xxx" }),
    [400, 401]
  );

  // FE admin/customer pages reachability (HTML shell)
  for (const path of [
    "/profile",
    "/admin/news",
    "/news/1",
    "/change-password",
    "/payment-success",
  ]) {
    await expectStatus(`FE ${path}`, () => axios.get(`${FE}${path}`), [200]);
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n=== SUMMARY: ${passed} OK / ${failed} FAIL / ${results.length} total ===`);
  if (failed) {
    console.log("\nFailed cases:");
    for (const r of results.filter((x) => !x.ok)) {
      console.log(` - ${r.name}: ${r.detail}`);
    }
  }
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
