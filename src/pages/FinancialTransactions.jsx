import React, { useEffect, useState, useMemo } from "react";

const API_BASE_URL = "http://localhost:8000";

// Helpers
const normalizeListPayload = (json) => {
  if (!json) return [];
  if (Array.isArray(json)) return json;
  if (json.data && Array.isArray(json.data)) return json.data;
  if (json.transactions && Array.isArray(json.transactions)) return json.transactions;
  return [];
};

const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
};

const toCSV = (rows = []) => {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const header = keys.join(",");
  const lines = rows.map(r =>
    keys.map(k => {
      const v = r[k] == null ? "" : String(r[k]).replace(/"/g, '""');
      return `"${v}"`;
    }).join(",")
  );
  return [header, ...lines].join("\n");
};

export default function FinancialTransactions() {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [hasMore, setHasMore] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // credit / debit / all
  const [statusFilter, setStatusFilter] = useState("all"); // optional statuses

  const totals = useMemo(() => {
    let inflow = 0, outflow = 0;
    transactions.forEach(t => {
      const a = parseFloat(t.amount || 0);
      if (a >= 0) inflow += a; else outflow += Math.abs(a);
    });
    return { inflow, outflow, count: transactions.length };
  }, [transactions]);

  useEffect(() => {
    // initial load
    fetchBalance();
    fetchTransactions(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reload when filters or search change
  useEffect(() => {
    setPage(1);
    fetchTransactions(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, typeFilter, statusFilter]);

  const fetchBalance = async () => {
    setLoadingBalance(true);
    try {
      // try common endpoints, adjust per backend
      const endpoints = [
        `${API_BASE_URL}/api/company/balance`,
        `${API_BASE_URL}/api/admin/company/balance`,
        `${API_BASE_URL}/api/wallets/company`,
      ];
      let json = null;
      for (const ep of endpoints) {
        try {
          const r = await fetch(ep);
          if (!r.ok) continue;
          json = await r.json().catch(() => null);
          if (json) break;
        } catch {}
      }
      if (!json) {
        setBalance(null);
        return;
      }
      // support shapes: { balance: 100 }, { data: { balance: 100 } }, { wallet: { balance } }
      let b = null;
      if (typeof json === "object") {
        if ("balance" in json) b = json.balance;
        else if (json.data && "balance" in json.data) b = json.data.balance;
        else if (json.wallet && "balance" in json.wallet) b = json.wallet.balance;
      }
      setBalance(b == null ? null : parseFloat(b));
    } catch (err) {
      console.error(err);
      setBalance(null);
    } finally {
      setLoadingBalance(false);
    }
  };

  const fetchTransactions = async (p = 1, replace = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("page", p);
      params.append("limit", pageSize);
      if (search) params.append("q", search);
      if (typeFilter && typeFilter !== "all") params.append("type", typeFilter);
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);

      // adjust endpoint if your backend uses a different admin path
      const url = `${API_BASE_URL}/api/transactions?${params.toString()}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json().catch(() => res);
      const items = normalizeListPayload(json);

      // simple pagination detection: if returned count == pageSize => maybe more
      setHasMore(items.length === pageSize);
      setPage(p);
      setTransactions(prev => (replace ? items : [...prev, ...items]));
    } catch (err) {
      console.error(err);
      setError(err.message || "خطأ أثناء جلب المعاملات");
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    fetchBalance();
    setPage(1);
    fetchTransactions(1, true);
  };

  const loadMore = () => {
    fetchTransactions(page + 1, false);
  };

  const exportCSV = () => {
    const rows = transactions.map(t => ({
      id: t.id,
      date: t.created_at || t.date || t.createdAt,
      type: t.type || (t.amount >= 0 ? "credit" : "debit"),
      amount: t.amount,
      currency: t.currency || t.currency_code || "SAR",
      user: t.user_id || (t.user && (t.user.name || t.user.email)) || "",
      related_user: t.related_user_id || "",
      description: t.description || t.note || (t.data ? JSON.stringify(t.data) : ""),
      status: t.status || "",
    }));
    const csv = toCSV(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">المعاملات المالية</h1>
        <div className="flex items-center gap-3">
          <button onClick={refresh} className="px-3 py-2 bg-white border rounded-md">تحديث</button>
          <button onClick={exportCSV} className="px-3 py-2 bg-[#F8BC06] rounded-md text-black font-semibold">تصدير CSV</button>
        </div>
      </header>

      {/* Balance card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <div className="text-sm text-slate-500">رصيد الشركة</div>
          <div className="text-3xl font-bold mt-2">
            {loadingBalance ? "جارٍ..." : (balance == null ? "غير متوفر" : `${balance.toLocaleString()} ر.س`)}
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <div className="text-sm text-slate-500">إجمالي الوارد</div>
          <div className="text-2xl font-semibold mt-2">{totals.inflow.toFixed(2)} ر.س</div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <div className="text-sm text-slate-500">إجمالي الصادر</div>
          <div className="text-2xl font-semibold mt-2">{totals.outflow.toFixed(2)} ر.س</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-sandLight p-4 rounded-md border border-[#f3e1d3]">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث برقم المعاملة، وصف، أو مستخدم..."
          className="px-3 py-2 rounded-md border w-72"
        />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-2 py-2 border rounded-md">
          <option value="all">الكل</option>
          <option value="credit">وارد (دفع)</option>
          <option value="debit">صادر (سحب)</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-2 py-2 border rounded-md">
          <option value="all">كل الحالات</option>
          <option value="pending">قيد الانتظار</option>
          <option value="succeeded">ناجح</option>
          <option value="failed">فشل</option>
        </select>
        <button onClick={() => { setPage(1); fetchTransactions(1, true); }} className="px-3 py-2 bg-[#F8BC06] rounded-md">تطبيق</button>
      </div>

      {/* Transactions table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-right">#</th>
              <th className="p-3 text-right">التاريخ</th>
              <th className="p-3 text-right">النوع</th>
              <th className="p-3 text-right">المبلغ</th>
              <th className="p-3 text-right">العملة</th>
              <th className="p-3 text-right">المستخدم</th>
              <th className="p-3 text-right">المستخدم المرتبط</th>
              <th className="p-3 text-right">الوصف</th>
              <th className="p-3 text-right">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {loading && page === 1 ? (
              <tr><td colSpan="9" className="p-6 text-center">جاري التحميل...</td></tr>
            ) : error ? (
              <tr><td colSpan="9" className="p-6 text-center text-red-600">خطأ: {error}</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan="9" className="p-6 text-center text-slate-600">لا توجد معاملات</td></tr>
            ) : transactions.map((t) => (
              <tr key={t.id} className="even:bg-white odd:bg-slate-50">
                <td className="p-3 text-right">{t.id}</td>
                <td className="p-3 text-right">{formatDate(t.created_at || t.date || t.createdAt)}</td>
                <td className="p-3 text-right">{(t.type || (t.amount >= 0 ? "credit" : "debit")).toString()}</td>
                <td className={`p-3 text-right font-semibold ${Number(t.amount) < 0 ? "text-red-600" : "text-green-600"}`}>{Number(t.amount).toFixed(2)}</td>
                <td className="p-3 text-right">{t.currency || t.currency_code || "SAR"}</td>
                <td className="p-3 text-right">{t.user_id || (t.user && (t.user.name || t.user.email)) || "—"}</td>
                <td className="p-3 text-right">{t.related_user_id || "—"}</td>
                <td className="p-3 text-right max-w-xs truncate">{t.description || t.note || (t.data ? JSON.stringify(t.data) : "—")}</td>
                <td className="p-3 text-right">{t.status || t.txn_type || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* load more */}
        <div className="p-4 text-center">
          {hasMore ? (
            <button onClick={loadMore} disabled={loading} className="px-6 py-2 rounded-md bg-[#F8BC06] text-black font-semibold">
              {loading ? "تحميل..." : "تحميل المزيد"}
            </button>
          ) : (
            <div className="text-slate-500">لا مزيد من المعاملات</div>
          )}
        </div>
      </div>
    </div>
  );
}
