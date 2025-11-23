import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  FaYoutube,
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaSnapchat,
  FaLink,
  FaSave,
  FaPlay,
  FaStop,
  FaTrash,
} from "react-icons/fa";

const API_BASE = "/api";
const THEME = {
  pageBg: "#FAF7F2",
  boxBg: "#FFFFFF",
  border: "#E8DFD8",
  primary: "#E0AA3E",
  heading: "#2D2A26",
  subtle: "#2D2A26",
  headerBg: "#F3ECE4", // table header bg (sandDark-ish)
};

export default function LiveControl() {
  const { id } = useParams();
  const [streamUrl, setStreamUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [streamType, setStreamType] = useState("youtube");
  const [streams, setStreams] = useState([]);
  const [subscribersCount, setSubscribersCount] = useState(150);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);

  const [bids, setBids] = useState([]); // {id, bidder, amount, time}

  useEffect(() => {
    loadStreams();
    loadBids();
    // eslint-disable-next-line
  }, []);

  const loadStreams = async () => {
    try {
      const resp = await fetch(`${API_BASE}/auctions/${id}/streams`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        setStreams(Array.isArray(data) ? data : data.data || []);
      }
    } catch (e) {
      console.error("loadStreams", e);
    }
  };

  const loadBids = async () => {
    try {
      const resp = await fetch(`${API_BASE}/auctions/${id}/bids`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        const raw = Array.isArray(data) ? data : data.data || data.bids || [];
        setBids(
          raw.map((b) => ({
            id: b.id,
            bidder: b.bidder?.name || b.user?.name || b.user_id || "—",
            amount: b.amount ?? b.price ?? b.bid_amount ?? 0,
            time: b.created_at || b.time || b.timestamp || null,
          }))
        );
      }
    } catch (e) {
      console.error("loadBids", e);
      // fallback sample
      setBids([{ id: 1, bidder: "أحمد", amount: 80500, time: "2025-11-01T18:22:00Z" }]);
    }
  };

  const handleSaveLink = async () => {
    if (!streamUrl.trim()) return;
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/auctions/${id}/streams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          platform: streamType,
          watch_url: streamUrl,
          embed_url: embedUrl || null,
          is_active: false,
        }),
      });
      if (resp.ok) {
        const resJson = await resp.json();
        const newS = resJson?.data || resJson;
        setStreams((s) => [...s, newS]);
        setStreamUrl("");
        setEmbedUrl("");
      } else {
        console.warn("save stream failed", resp.status);
      }
    } catch (e) {
      console.error("handleSaveLink", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleStreamActive = async (streamId, currentActive) => {
    try {
      const resp = await fetch(`${API_BASE}/auctions/${id}/streams/${streamId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ is_active: !currentActive }),
      });
      if (resp.ok) {
        setStreams((s) => s.map((st) => (st.id === streamId ? { ...st, is_active: !currentActive } : st)));
      }
    } catch (e) {
      console.error("toggleStreamActive", e);
    }
  };

  const deleteStream = async (streamId) => {
    if (!confirm("هل أنت متأكد من حذف هذا البث؟")) return;
    try {
      const resp = await fetch(`${API_BASE}/auctions/${id}/streams/${streamId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (resp.ok) setStreams((s) => s.filter((st) => st.id !== streamId));
    } catch (e) {
      console.error("deleteStream", e);
    }
  };

  const startLive = async () => {
    try {
      const resp = await fetch(`${API_BASE}/auctions/${id}/start`, { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      if (resp.ok) setIsLive(true);
    } catch (e) {
      console.error("startLive", e);
    }
  };

  const stopLive = async () => {
    try {
      const resp = await fetch(`${API_BASE}/auctions/${id}/finish`, { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      if (resp.ok) setIsLive(false);
    } catch (e) {
      console.error("stopLive", e);
    }
  };

  const platformIcon = (p) => {
    switch ((p || "").toLowerCase()) {
      case "youtube": return <FaYoutube />;
      case "facebook": return <FaFacebook />;
      case "instagram": return <FaInstagram />;
      case "tiktok": return <FaTiktok />;
      case "snapchat": return <FaSnapchat />;
      default: return <FaLink />;
    }
  };

  return (
    <div style={{ background: THEME.pageBg }} className="min-h-screen p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold" style={{ color: THEME.heading }}>التحكم في المزاد المباشر #{id}</h1>

        {/* TOP: Links form (single clean card) */}
        <div className="rounded-2xl bg-white border" style={{ borderColor: THEME.border, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: THEME.heading }}>روابط البث</h2>
              <div className="text-sm text-slate-500">أضف روابط المشاهدة والتضمين لكل منصة</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="url"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="Watch URL (رابط المشاهدة)"
                className="border p-3 rounded-xl outline-none w-full"
                style={{ borderColor: THEME.border }}
              />

              <input
                type="url"
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
                placeholder="Embed URL (اختياري)"
                className="border p-3 rounded-xl outline-none w-full"
                style={{ borderColor: THEME.border }}
              />

              <div className="flex gap-2 items-center">
                <select
                  value={streamType}
                  onChange={(e) => setStreamType(e.target.value)}
                  className="border p-3 rounded-xl w-full"
                  style={{ borderColor: THEME.border }}
                >
                  <option value="youtube">YouTube</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="snapchat">Snapchat</option>
                </select>

                <button
                  onClick={handleSaveLink}
                  disabled={loading}
                  className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm rounded-xl py-2.5 px-5 font-semibold transition-all"
                >
                  <FaSave /> حفظ الرابط
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN GRID: Left (controls + bids) | Right (video preview) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT: controls + bids (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* CONTROL CARD */}
            <div className="rounded-2xl bg-white border p-6" style={{ borderColor: THEME.border, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: THEME.heading }}>لوحة التحكم</h3>
                {isLive ? (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">🟢 مباشر الآن</span>
                ) : (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">غير مباشر</span>
                )}
              </div>

              <div className="flex gap-3 mb-4">
                <button onClick={startLive} className="flex-1 bg-green-600 text-white rounded-xl py-2.5 font-semibold hover:brightness-95 transition">بدء البث</button>
                <button onClick={stopLive} className="flex-1 bg-red-600 text-white rounded-xl py-2.5 font-semibold hover:brightness-95 transition">إيقاف البث</button>
              </div>

              <div className="text-sm text-slate-600">عدد المشتركين: <span className="font-semibold">{subscribersCount}</span></div>
            </div>

            {/* BIDS TABLE */}
            <div className="rounded-2xl bg-white border p-0 overflow-hidden" style={{ borderColor: THEME.border, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <div className="p-4 border-b" style={{ borderColor: THEME.border }}>
                <h4 className="text-lg font-semibold" style={{ color: THEME.heading }}>قائمة المزايدات</h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead style={{ background: THEME.headerBg }} className="text-sm text-right text-[#2D2A26]">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">المزايد</th>
                      <th className="p-3">المبلغ (ر.س)</th>
                      <th className="p-3">الوقت</th>
                      <th className="p-3">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bids.length === 0 ? (
                      <tr><td colSpan="5" className="p-6 text-center text-slate-500">لا توجد مزايدات حتى الآن</td></tr>
                    ) : bids.map((b, idx) => (
                      <tr key={b.id} className="even:bg-white odd:bg-[#FBFAF9]" style={{ borderTop: `1px solid ${THEME.border}` }}>
                        <td className="p-3 text-right">{idx + 1}</td>
                        <td className="p-3 text-right font-medium">{b.bidder}</td>
                        <td className={`p-3 text-right font-semibold ${Number(b.amount) < 0 ? "text-red-600" : "text-green-600"}`}>{Number(b.amount).toLocaleString()}</td>
                        <td className="p-3 text-right text-sm text-slate-500">{b.time ? new Date(b.time).toLocaleString("ar-SA") : "—"}</td>
                        <td className="p-3 text-right">
                          <button className="text-sm text-red-600 flex items-center gap-2" onClick={() => setBids((s) => s.filter(x => x.id !== b.id))}>
                            <FaTrash /> حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT: video preview (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-2xl bg-white border p-6" style={{ borderColor: THEME.border, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: THEME.heading }}>البث المباشر - المعاينة</h3>
                <div className="text-sm text-slate-500">عرض آخر بث مفعل</div>
              </div>

              {streams.filter(s => s.is_active).length > 0 ? (
                streams.filter(s => s.is_active).map((stream) => (
                  <div key={stream.id} className="bg-white rounded-xl border p-3" style={{ borderColor: THEME.border }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#FFF6E6] flex items-center justify-center text-xl">{platformIcon(stream.platform)}</div>
                        <div>
                          <div className="font-semibold">{(stream.platform || "Platform").toUpperCase()}</div>
                          <div className="text-sm text-slate-500">{stream.watch_url || "رابط المشاهدة غير متوفر"}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleStreamActive(stream.id, stream.is_active)} className="px-3 py-1 rounded-xl border" style={{ borderColor: THEME.border }}>
                          {stream.is_active ? "تعطيل" : "تفعيل"}
                        </button>
                        <button onClick={() => deleteStream(stream.id)} className="px-3 py-1 rounded-xl border text-red-600" style={{ borderColor: THEME.border }}>
                          حذف
                        </button>
                      </div>
                    </div>

                    {stream.embed_url ? (
                      <div className="aspect-video rounded-md overflow-hidden bg-black">
                        <iframe
                          src={stream.embed_url}
                          title={`embed-${stream.id}`}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="aspect-video rounded-md border-dashed border p-6 flex items-center justify-center" style={{ borderColor: THEME.border }}>
                        <div className="text-center">
                          <p className="text-slate-600 mb-3">لا يتوفر رابط التضمين لهذا البث</p>
                          <a href={stream.watch_url || "#"} target="_blank" rel="noreferrer" className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl py-2.5 px-5 transition-all shadow-sm">
                            شاهد على المنصة
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="h-96 rounded-lg bg-[#FBFAF9] border border-dashed flex items-center justify-center" style={{ borderColor: THEME.border }}>
                  <div className="text-center text-slate-500">
                    <div className="mb-3">لا يوجد بث نشط حالياً</div>
                    <div className="text-sm">فعّل أحد الروابط في الأعلى أو أضف رابط بث جديد</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
