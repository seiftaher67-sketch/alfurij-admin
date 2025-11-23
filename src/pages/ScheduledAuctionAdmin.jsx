import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000";

const fmt = (iso) => {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("ar-SA"); } catch { return iso; }
};

const normalize = (json) => {
  if (!json) return null;
  if (json.data && !Array.isArray(json.data)) return json.data;
  return json;
};

export default function ScheduledAuctionAdmin() {
  const { id } = useParams();
  const nav = useNavigate();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // fetch auction detail
        const r1 = await fetch(`${API_BASE_URL}/api/auctions/${id}`);
        const j1 = await r1.json().catch(() => null);
        const a = normalize(j1) || (j1 && j1.auction) || j1;
        // try multiple shapes
        const auctionData = a || {};

        // fetch bids for auction: try common endpoints
        const endpoints = [
          `${API_BASE_URL}/api/auctions/${id}/bids`,
          `${API_BASE_URL}/api/bids?auction_id=${id}`,
          `${API_BASE_URL}/api/auctions/${id}/offers`,
        ];
        let bidsData = [];
        for (const ep of endpoints) {
          try {
            const r = await fetch(ep);
            if (!r.ok) continue;
            const j = await r.json().catch(() => null);
            if (!j) continue;
            if (Array.isArray(j)) { bidsData = j; break; }
            if (Array.isArray(j.data)) { bidsData = j.data; break; }
            if (Array.isArray(j.bids)) { bidsData = j.bids; break; }
          } catch (e) { /* ignore and try next */ }
        }

        setAuction({
          id: auctionData.id,
          title: auctionData.title || auctionData.listing?.title || `اعلان ${auctionData.id}`,
          start_at: auctionData.auction_start_at || auctionData.start_time || auctionData.start_at,
          end_at: auctionData.auction_end_at || auctionData.end_time || auctionData.end_at,
          participants_count: auctionData.participants_count ?? auctionData.participants ?? (Array.isArray(bidsData) ? new Set(bidsData.map(b=>b.user_id||b.bidder_id)).size : 0),
          current_price: auctionData.current_price ?? auctionData.highest_bid ?? null,
          raw: auctionData,
        });

        // normalize bids array items: { id, user_id, bidder: {name,email}, amount, currency, created_at }
        const normalizedBids = (bidsData || []).map(b => ({
          id: b.id,
          amount: (b.amount ?? b.bid_amount ?? b.price) || 0,
          currency: b.currency || b.currency_code || "SAR",
          user_id: b.user_id ?? b.bidder_id ?? (b.user && (b.user.id)),
          bidder_name: (b.bidder?.name) || (b.user && (b.user.name || b.user.email)) || b.name || (b.user_id ? `user ${b.user_id}` : "—"),
          created_at: b.created_at || b.timestamp || b.createdAt || b.time,
          raw: b,
        })).sort((a,b) => Number(b.amount) - Number(a.amount));

        setBids(normalizedBids);
      } catch (err) {
        console.error(err);
        setError(err.message || "خطأ في جلب بيانات المزاد / العروض");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const highest = useMemo(() => (bids && bids.length ? bids[0].amount : (auction?.current_price || 0)), [bids, auction]);

  if (loading) return <div className="p-6 text-center">جاري التحميل...</div>;
  if (error) return <div className="p-6 text-center text-red-600">خطأ: {error}</div>;
  if (!auction) return <div className="p-6 text-center">لم يتم العثور على المزاد</div>;

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{auction.title}</h1>
          <div className="text-sm text-slate-500">معرّف المزاد: {auction.id}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => nav(-1)} className="px-3 py-2 border rounded">رجوع</button>
          <a href={`/auctions/${auction.id}`} className="px-3 py-2 bg-[#F8BC06] rounded font-medium">عرض كـ مستخدم</a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded shadow-sm">
          <div className="text-sm text-slate-500">بداية المزاد</div>
          <div className="text-lg font-semibold">{fmt(auction.start_at)}</div>
        </div>
        <div className="p-4 bg-white rounded shadow-sm">
          <div className="text-sm text-slate-500">انتهاء المزاد</div>
          <div className="text-lg font-semibold">{fmt(auction.end_at)}</div>
        </div>
        <div className="p-4 bg-white rounded shadow-sm">
          <div className="text-sm text-slate-500">المشاركين</div>
          <div className="text-lg font-semibold">{auction.participants_count}</div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-slate-500">أعلى سعر وصل إليه</div>
          <div className="text-2xl font-bold text-green-600">{highest} ر.س</div>
        </div>
        <div>
          <button onClick={() => window.location.reload()} className="px-3 py-2 border rounded">تحديث البيانات</button>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-right">#</th>
              <th className="p-3 text-right">المزايد</th>
              <th className="p-3 text-right">المبلغ</th>
              <th className="p-3 text-right">العملة</th>
              <th className="p-3 text-right">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {bids.length === 0 ? (
              <tr><td colSpan="5" className="p-6 text-center text-slate-500">لا توجد عروض حتى الآن</td></tr>
            ) : bids.map((b, idx) => (
              <tr key={b.id} className="even:bg-white odd:bg-slate-50">
                <td className="p-3 text-right">{idx + 1}</td>
                <td className="p-3 text-right">{b.bidder_name || b.user_id}</td>
                <td className="p-3 text-right font-semibold">{Number(b.amount).toFixed(2)}</td>
                <td className="p-3 text-right">{b.currency}</td>
                <td className="p-3 text-right">{fmt(b.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}