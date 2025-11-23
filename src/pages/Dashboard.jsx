import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart3,
  Truck,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

/**
 * Dashboard - reorganized:
 * - Top stats (unchanged visual style)
 * - Calendar with scheduled auctions (events) — interactive month view
 * - Latest Activities feed
 * - Redesigned "Most sold" + Sales chart
 *
 * Endpoints this file attempts:
 * - GET /api/admin/stats          -> optional (top cards)
 * - GET /api/auctions?schedule=1  -> calendar events (or /api/auctions)
 * - GET /api/admin/activities     -> recent admin activities (fallback /api/activities)
 *
 * Adjust endpoints to match your backend.
 */

export default function Dashboard() {
  // top cards data (can be fetched)
  const [stats, setStats] = useState({
    totalSales: "0",
    newUsers: "0",
    listedTrucks: "0",
    dailyTx: "0",
  });

  // calendar events and current month
  const [events, setEvents] = useState([]); // { id, title, date (ISO), type }
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(null);

  // activities feed
  const [activities, setActivities] = useState([]); // { id, message, created_at, type }
  const [mostSold, setMostSold] = useState([]); // { name, count, progress }

  const fetchDashboardData = async () => {
    try {
      // try to fetch stats (optional)
      const s = await fetchTryJson("/api/admin/stats");
      if (s)
        setStats({
          totalSales: s.totalSales ?? stats.totalSales,
          newUsers: s.newUsers ?? stats.newUsers,
          listedTrucks: s.listedTrucks ?? stats.listedTrucks,
          dailyTx: s.dailyTx ?? stats.dailyTx,
        });

      // fetch auctions scheduled / upcoming to show on calendar
      const evRaw =
        (await fetchTryJson("/api/auctions?schedule=1")) ||
        (await fetchTryJson("/api/auctions"));
      if (evRaw) {
        const arr = Array.isArray(evRaw)
          ? evRaw
          : (evRaw.data || evRaw.auctions || []);
        const mapped = (arr || []).map((a) => ({
          id: a.id,
          title: a.title || a.name || `اعلان ${a.id}`,
          date:
            a.auction_start_at ||
            a.start_at ||
            a.date ||
            a.auction_date ||
            a.created_at,
          type: a.auction_type || (a.buy_now ? "buy_now" : "auction"),
        })).filter((e) => e.date);
        setEvents(mapped);
      }

      // activities
      const acts =
        (await fetchTryJson("/api/admin/activities")) ||
        (await fetchTryJson("/api/activities"));
      if (acts) {
        const list = Array.isArray(acts)
          ? acts
          : (acts.data || acts.activities || []);
        setActivities(
          (list || []).slice(0, 20).map((a) => ({
            id: a.id,
            message: a.message || a.title || a.description || JSON.stringify(a),
            created_at: a.created_at || a.createdAt || a.date || null,
            type: a.type || "info",
          }))
        );
      }

      // most sold (example endpoint)
      const ms =
        (await fetchTryJson("/api/reports/most-sold")) ||
        (await fetchTryJson("/api/most-sold"));
      if (ms) {
        const list = Array.isArray(ms) ? ms : (ms.data || ms.items || []);
        setMostSold(
          (list || []).slice(0, 5).map((it, idx) => ({
            name: it.name || it.title || `Item ${it.id || idx + 1}`,
            count: it.count || it.sales || 0,
            progress: Math.min(
              100,
              Math.round(
                ((it.count || it.sales || 0) / ((list[0]?.count || 1)) * 100)
              )
            ),
          }))
        );
      } else {
        // fallback dummy layout if backend not available yet
        setMostSold([
          { name: "شاحنات نقل", count: 2108, progress: 100 },
          { name: "شاحنات خفيفة", count: 944, progress: 45 },
          { name: "معدات ثقيلة", count: 221, progress: 10 },
        ]);
      }
    } catch (e) {
      console.error("fetchDashboardData", e);
    }
  };

  useEffect(() => {
    // initial fetch
    fetchDashboardData();
    // eslint-disable-next-line
  }, []);

  // helper to try multiple endpoints & safe json
  async function fetchTryJson(path) {
    try {
      const res = await fetch(path);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  // calendar helpers
  const monthStart = useMemo(
    () => new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1),
    [viewMonth]
  );
  const monthEnd = useMemo(
    () => new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0),
    [viewMonth]
  );
  const daysInMonth = monthEnd.getDate();
  const startWeekday = monthStart.getDay(); // 0 Sun .. 6 Sat (we'll adapt to RTL Monday-first if needed)
  const weeks = useMemo(() => {
    // create a 6x7 grid
    const grid = [];
    const firstGridDate = new Date(monthStart);
    firstGridDate.setDate(1 - startWeekday);
    for (let week = 0; week < 6; week++) {
      const row = [];
      for (let d = 0; d < 7; d++) {
        const dt = new Date(firstGridDate);
        dt.setDate(firstGridDate.getDate() + week * 7 + d);
        row.push(dt);
      }
      grid.push(row);
    }
    return grid;
  }, [monthStart, startWeekday]);

  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      const key = new Date(ev.date).toDateString();
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    });
    return map;
  }, [events]);

  const goPrev = () =>
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  const goNext = () =>
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));

  const dayHasEvents = (d) => !!eventsByDay[new Date(d).toDateString()];

  // Latest activities (limited)
  const latestActivities = activities.slice(0, 8);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-sandLight via-gray-light to-sandLight p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-textDark mb-8 text-center">
           لوحة التحكم
        </h1>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <InfoCard
            icon={DollarSign}
            title="إجمالي المبيعات"
            value={stats.totalSales}
            change="-6%"
            trend="down"
          />
          <InfoCard
            icon={Users}
            title="عدد المستخدمين الجدد"
            value={stats.newUsers}
            change="+22%"
            trend="up"
          />
          <InfoCard
            icon={Truck}
            title="عدد الشاحنات المدرجة"
            value={stats.listedTrucks}
            change="+8%"
            trend="up"
          />
          <InfoCard
            icon={BarChart3}
            title="المعاملات اليومية"
            value={stats.dailyTx}
            change="+15%"
            trend="up"
          />
        </div>

        {/* Calendar + Activities + Right column (Most sold + Chart) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Calendar */}
          <section className="lg:col-span-2 space-y-6">
            <Card className="rounded-soft bg-white shadow-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">تقويم المزايدات</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={goPrev}
                    className="px-3 py-1 border rounded"
                  >
                    السابق
                  </button>
                  <div className="px-4 py-1 font-medium">
                    {viewMonth.toLocaleString("ar-SA", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <button
                    onClick={goNext}
                    className="px-3 py-1 border rounded"
                  >
                    التالي
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-sm">
                {["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"].map(
                  (d) => (
                    <div
                      key={d}
                      className="text-center text-xs font-semibold text-slate-500"
                    >
                      {d}
                    </div>
                  )
                )}
                {weeks.map((week, wi) =>
                  week.map((day, di) => {
                    const inMonth = day.getMonth() === viewMonth.getMonth();
                    const key = day.toDateString();
                    const evs = eventsByDay[key] || [];
                    return (
                      <button
                        key={`${wi}-${di}`}
                        onClick={() => setSelectedDate(day)}
                        className={`p-2 rounded-lg text-right min-h-[64px] flex flex-col justify-between
                        ${inMonth ? "bg-white" : "bg-slate-50 text-slate-400"}
                        ${dayHasEvents(day) ? "ring-2 ring-[#F8BC06]/40" : ""}
                      `}
                      >
                        <div className="flex justify-between items-start">
                          <div className="text-sm font-medium">{day.getDate()}</div>
                          {day.toDateString() === new Date().toDateString() && (
                            <div className="text-xs bg-black text-white px-2 rounded">
                              الآن
                            </div>
                          )}
                        </div>
                        <div className="mt-2 space-y-1">
                          {evs.slice(0, 2).map((ev) => (
                            <div
                              key={ev.id}
                              className="bg-[#F8F9F9] text-xs rounded px-1 py-0.5 truncate"
                            >
                              {ev.title}
                            </div>
                          ))}
                          {evs.length > 2 && (
                            <div className="text-xs text-slate-400">
                              +{evs.length - 2} آخرون
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
              {/* Selected day events */}
              <div className="mt-4">
                <h4 className="font-semibold mb-2">
                  {selectedDate
                    ? `أحداث ${selectedDate.toLocaleDateString("ar-SA")}`
                    : "أحداث اليوم"}
                </h4>
                <div className="space-y-2">
                  {(eventsByDay[(selectedDate || today).toDateString()] || []).map(
                    (ev) => (
                      <div
                        key={ev.id}
                        className="p-3 bg-white rounded shadow-sm flex justify-between items-center"
                      >
                        <div>
                          <div className="font-semibold">{ev.title}</div>
                          <div className="text-xs text-slate-500">
                            {new Date(ev.date).toLocaleTimeString("ar-SA")}
                          </div>
                        </div>
                        <div className="text-sm text-slate-400">{ev.type}</div>
                      </div>
                    )
                  )}
                  {(!eventsByDay[(selectedDate || today).toDateString()] || []).length ===
                    0 && (
                    <div className="text-slate-500">لا توجد أحداث لهذا اليوم</div>
                  )}
                </div>
              </div>
            </Card>

            {/* Latest Activities */}
            <Card className="rounded-soft bg-white shadow-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">أحدث الأنشطة</h3>
                <div className="text-sm text-slate-400">{activities.length} سجل</div>
              </div>
              <ul className="divide-y">
                {latestActivities.map((act) => (
                  <li key={act.id} className="py-3 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F8BC06] flex items-center justify-center text-white font-bold">
                      {(act.type || "i").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div className="text-sm font-medium">{act.message}</div>
                        <div className="text-xs text-slate-400">
                          {act.created_at
                            ? new Date(act.created_at).toLocaleString("ar-SA")
                            : "-"}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        تفاصيل سريعة أو وصف مختصر للنشاط
                      </div>
                    </div>
                  </li>
                ))}
                {latestActivities.length === 0 && (
                  <li className="py-6 text-center text-slate-500">لا توجد أنشطة</li>
                )}
              </ul>
            </Card>
          </section>

          {/* Right: Most sold + Sales chart compact */}
          <aside className="space-y-6">
            <Card className="rounded-soft bg-white shadow-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">الأكثر بيعًا</h3>
                <div className="text-sm text-slate-400">Top {mostSold.length}</div>
              </div>
              <div className="space-y-3">
                {mostSold.map((m, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{m.name}</div>
                        <div className="text-sm text-slate-500">{m.count}</div>
                      </div>
                      <div className="mt-2 h-2 bg-slate-100 rounded overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primaryDark"
                          style={{ width: `${m.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            
          </aside>
        </div>
      </div>
    </div>
  );
}

// ——————————————————————————
// Reusable sub components
// ——————————————————————————
function InfoCard({ icon: Icon, title, value, change, trend }) {
  const isPositive = trend === "up";
  return (
    <Card className="rounded-soft bg-white shadow-card p-4 hover:shadow-xl transition-all duration-300">
      <CardContent className="p-0">
        <div className="flex items-center gap-4">
          <div className="bg-slate-100 p-3 rounded-lg">
            <Icon className="w-6 h-6 text-black" />
          </div>
          <div className="flex-1">
            <h3 className="text-textDark text-sm font-semibold mb-1">
              {title}
            </h3>
            <p className="text-2xl font-bold text-textSoft mb-1">
              {value}
            </p>
            <div className="flex items-center gap-1 text-sm">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`font-medium ${
                  isPositive ? "text-green-500" : "text-red-500"
                }`}
              >
                {change}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniBar({ height = 40, color = "bg-slate-400", label = "" }) {
  return (
    <div className="flex flex-col items-center text-sm text-textSoft">
      <div
        className={`w-8 ${color} rounded-t-lg shadow-sm`}
        style={{ height: `${height}px` }}
      />
      <div className="mt-2">{label}</div>
    </div>
  );
}
