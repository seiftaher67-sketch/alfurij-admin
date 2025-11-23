import React, { useEffect, useState, useMemo } from "react";

const API_BASE_URL = "http://localhost:8000";

/**
 * صفحة واحدة تعرض إشعارات الأدمن من الباك‑إند:
 * - جلب (fetch) مع دعم فلترة (نوع، غير مقروء)، بحث، وتحميل المزيد (pagination simple)
 * - وضع علامة كمقروء / عدم مقروء
 * - عرض تفاصيل إشعار في مودال
 *
 * ملاحظة: عدّل مسارات الـ API إذا كانت مختلفة (مثال: /api/admin/notifications).
 */

const normalizeListPayload = (json) => {
  if (!json) return [];
  // شائع: { data: [...] } أو [...]
  if (Array.isArray(json)) return json;
  if (json.data && Array.isArray(json.data)) return json.data;
  // بعض الـ backends يعيد { notifications: [...] }
  if (json.notifications && Array.isArray(json.notifications)) return json.notifications;
  return [];
};

const formatDateAr = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [hasMore, setHasMore] = useState(false);

  const [search, setSearch] = useState("");
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");

  const [activeNotification, setActiveNotification] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // available types will be computed from fetched notifications
  const types = useMemo(() => {
    const s = new Set();
    notifications.forEach((n) => n.type && s.add(n.type));
    return ["all", ...Array.from(s)];
  }, [notifications]);

  useEffect(() => {
    // reset when filters change
    setPage(1);
    fetchNotifications(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyUnread, typeFilter, search]);

  const fetchNotifications = async (p = 1, replace = false) => {
    try {
      setLoading(true);
      setError(null);

      // بناء استعلام بسيط؛ عدّل المسار /params حسب الـ API الفعلي
      const params = new URLSearchParams();
      params.append("page", p);
      params.append("limit", pageSize);
      if (onlyUnread) params.append("unread", "1");
      if (typeFilter && typeFilter !== "all") params.append("type", typeFilter);
      if (search) params.append("q", search);

      const url = `${API_BASE_URL}/api/notifications?${params.toString()}`;

      const res = await fetch(url);
      const json = await res.json().catch(() => res);
      const items = normalizeListPayload(json);

      // حاول دعم إن الـ API يرد صفحياً بشكل مختلف
      const totalReturned = items.length;
      const nextHasMore = totalReturned === pageSize;

      setHasMore(nextHasMore);
      setPage(p);
      setNotifications((prev) => (replace ? items : [...prev, ...items]));
    } catch (err) {
      console.error(err);
      setError(err?.message || "حدث خطأ أثناء جلب الإشعارات");
    } finally {
      setLoading(false);
    }
  };

  const openNotification = async (n) => {
    setActiveNotification(n);
    setModalOpen(true);

    // علامة كمقروء - محاولة استدعاء endpoint
    if (!n.read_at) {
      await markAsRead(n.id, true);
      // تحديث محلي سريع
      setNotifications((prev) => prev.map((it) => (it.id === n.id ? { ...it, read_at: new Date().toISOString() } : it)));
    }
  };

  const markAsRead = async (id, optimistic = false) => {
    try {
      // حاول endpoint شائع
      const endpoints = [
        `${API_BASE_URL}/api/notifications/${id}/mark-read`,
        `${API_BASE_URL}/api/notifications/${id}/read`,
        `${API_BASE_URL}/api/notifications/${id}`,
      ];

      let done = false;
      for (const ep of endpoints) {
        try {
          // إذا الـ endpoint الأخير نفذ PATCH لتحديث الحقل
          if (ep.endsWith("/notifications/" + id)) {
            const r = await fetch(ep, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ read: true }),
            });
            if (r.ok) { done = true; break; }
          } else {
            const r = await fetch(ep, { method: "POST" });
            if (r.ok) { done = true; break; }
          }
        } catch (e) {
          // ignore and try next
        }
      }

      if (!done) console.warn("لم أتمكن من استدعاء endpoint علامة مقروء (تحقق من backend)");
      if (optimistic) {
        setNotifications((prev) => prev.map((it) => (it.id === id ? { ...it, read_at: new Date().toISOString() } : it)));
      }
    } catch (err) {
      console.error("markAsRead error", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      // endpoint عام محتمل
      const ep = `${API_BASE_URL}/api/notifications/mark-all-read`;
      const r = await fetch(ep, { method: "POST" });
      if (!r.ok) console.warn("mark-all-read لم يجد استجابة 2xx، تأكد من endpoint");
      // تحديث محلي
      setNotifications((prev) => prev.map((it) => ({ ...it, read_at: new Date().toISOString() })));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleRead = async (n) => {
    const makeRead = !n.read_at;
    if (makeRead) await markAsRead(n.id, true);
    else {
      // محاولة عمل un-read إن لم يوجد API فلا يحدث شيء
      try {
        const ep = `${API_BASE_URL}/api/notifications/${n.id}/mark-unread`;
        const r = await fetch(ep, { method: "POST" });
        if (!r.ok) console.warn("mark-unread لم يرجع 2xx");
        setNotifications((prev) => prev.map((it) => (it.id === n.id ? { ...it, read_at: null } : it)));
      } catch {
        console.warn("unread API غير موجود، تم تجاهل العملية");
      }
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">الإشعارات</h1>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { setSearch(""); setOnlyUnread(false); setTypeFilter("all"); fetchNotifications(1, true); }}
            className="px-3 py-2 bg-white border rounded-md text-sm hover:shadow"
            title="إعادة تحميل"
          >
            إعادة تحميل
          </button>

          <button
            onClick={markAllAsRead}
            className="px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
          >
            تعليم الكل كمقروء
          </button>
        </div>
      </header>

      {/* controls */}
      <div className="bg-sandLight p-4 rounded-md border border-[#f3e1d3] flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بعنوان أو محتوى الإشعار..."
            className="px-3 py-2 rounded-md border w-72"
          />
          <button onClick={() => fetchNotifications(1, true)} className="px-3 py-2 bg-[#F8BC06] rounded-md text-white">بحث</button>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={onlyUnread} onChange={(e) => setOnlyUnread(e.target.checked)} />
            غير المقروءة فقط
          </label>

          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-2 py-2 border rounded-md text-sm">
            <option value="all">الكل</option>
            {/* types قائمة ديناميكية مستخرجة من البيانات */}
            {types.filter(t => t !== "all").map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {loading && page === 1 ? (
            <div className="p-6 text-center">جاري التحميل...</div>
          ) : error ? (
            <div className="p-6 text-red-600">خطأ: {error}</div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-slate-600">لا توجد إشعارات</div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className={`flex gap-4 p-4 rounded-lg border ${n.read_at ? "bg-white" : "bg-white shadow-md"}`}>
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${n.read_at ? "bg-gray-100" : "bg-[#F8BC06]"}`}>
                    {/* أيقونة مبسطة حسب النوع */}
                    <span className="text-white font-bold">{(n.type || "N").slice(0,1).toUpperCase()}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-lg">{n.title || "بدون عنوان"}</div>
                      <div className="text-sm text-slate-500 mt-1 line-clamp-2">{n.body || n.message || JSON.stringify(n.data || {}).slice(0,120)}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-400">{formatDateAr(n.created_at || n.createdAt || n.created)}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => openNotification(n)} className="text-sm text-[#0b6efd]">تفاصيل</button>
                        <button onClick={() => toggleRead(n)} className="text-sm text-slate-600">
                          {n.read_at ? "تعليم كغير مقروء" : "تعليم كمقروء"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* تحميل المزيد */}
          {hasMore && (
            <div className="text-center">
              <button
                onClick={() => fetchNotifications(page + 1, false)}
                disabled={loading}
                className="px-6 py-2 rounded-md bg-[#F8BC06] text-black font-semibold"
              >
                {loading ? "تحميل..." : "تحميل المزيد"}
              </button>
            </div>
          )}
        </div>

        {/* sidebar: ملخص / فلاتر متقدمة */}
        <aside className="space-y-4">
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">إجمالي الإشعارات</div>
                <div className="text-2xl font-bold">{notifications.length}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">غير المقروءة</div>
                <div className="text-2xl font-bold">{notifications.filter(n => !n.read_at).length}</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <h3 className="font-semibold mb-2">الفلاتر</h3>
            <div className="flex flex-col gap-2">
              <label className="text-sm">
                <input type="checkbox" checked={onlyUnread} onChange={(e) => setOnlyUnread(e.target.checked)} /> غير المقروءة فقط
              </label>
              <label className="text-sm">نوع الإشعار</label>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full border px-2 py-2 rounded">
                <option value="all">الكل</option>
                {types.filter(t=>t!=="all").map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <h3 className="font-semibold mb-2">إجراءات سريعة</h3>
            <div className="flex flex-col gap-2">
              <button onClick={() => { setOnlyUnread(false); setTypeFilter("all"); fetchNotifications(1, true); }} className="px-3 py-2 border rounded">عرض الكل</button>
              <button onClick={() => { setOnlyUnread(true); setTypeFilter("all"); fetchNotifications(1, true); }} className="px-3 py-2 bg-[#F8BC06] rounded text-black">غير المقروءة</button>
            </div>
          </div>
        </aside>
      </div>

      {/* التفاصيل - مودال بسيط */}
      {modalOpen && activeNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)}></div>

          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{activeNotification.title}</h2>
                <div className="text-sm text-slate-500 mt-1">{formatDateAr(activeNotification.created_at || activeNotification.createdAt)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { toggleRead(activeNotification); }} className="px-3 py-2 border rounded">
                  {activeNotification.read_at ? "تعليم كغير مقروء" : "تعليم كمقروء"}
                </button>
                <button onClick={() => setModalOpen(false)} className="px-3 py-2 bg-red-600 text-white rounded">إغلاق</button>
              </div>
            </div>

            <div className="mt-5 text-slate-700 space-y-3">
              <div>{activeNotification.body || activeNotification.message || JSON.stringify(activeNotification.data || {}, null, 2)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
