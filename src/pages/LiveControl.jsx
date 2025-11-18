import React, { useState } from "react";
import { useParams } from "react-router-dom";

export default function LiveControl() {
  const { id } = useParams();
  const [streamUrl, setStreamUrl] = useState("");
  const [streamType, setStreamType] = useState("youtube");
  const [savedLinks, setSavedLinks] = useState([]);
  const [subscribersCount, setSubscribersCount] = useState(150); // Example count
  const [isLive, setIsLive] = useState(false);

  const handleSaveLink = () => {
    if (streamUrl.trim()) {
      setSavedLinks([...savedLinks, { url: streamUrl, type: streamType }]);
      alert("تم حفظ الرابط بنجاح!");
    }
  };

  const startLive = () => {
    setIsLive(true);
  };

  const stopLive = () => {
    setIsLive(false);
  };

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">التحكم في المزاد المباشر #{id}</h1>

      {/* LIVE INFO */}
      <div className="bg-sandLight p-6 rounded-soft shadow-card border border-[#f3e1d3] mb-6">
        <h2 className="font-bold text-xl text-dark mb-3">رابط البث المباشر</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Link */}
          <input
            type="text"
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
            placeholder="ضع رابط اللايف هنا..."
            className="col-span-2 border p-3 rounded-lg outline-none"
          />

          {/* Type */}
          <select
            value={streamType}
            onChange={(e) => setStreamType(e.target.value)}
            className="border p-3 rounded-lg"
          >
            <option value="youtube">YouTube</option>
            <option value="instagram">Instagram</option>
          </select>
        </div>

        <button
          onClick={handleSaveLink}
          className="bg-primary-yellow text-white px-6 py-2 rounded-lg mt-4"
        >
          حفظ الرابط
        </button>
      </div>

      {/* MAIN LAYOUT: LEFT (40%) - CONTROLS & TABLE, RIGHT (60%) - VIDEO */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT SIDE: CONTROLS AND TABLE (40%) */}
        <div className="lg:col-span-2 space-y-6">
          {/* LIVE CONTROL */}
          <div className="bg-sandLight p-6 rounded-soft shadow-card border border-[#f3e1d3]">
            <h2 className="font-bold text-xl mb-4">لوحة التحكم</h2>

            <div className="flex gap-4">
              <button
                onClick={startLive}
                className="bg-green-600 text-white px-6 py-3 rounded-lg"
              >
                بدء البث
              </button>

              <button
                onClick={stopLive}
                className="bg-red-600 text-white px-6 py-3 rounded-lg"
              >
                إيقاف البث
              </button>
            </div>

            <div className="mt-4">
              <span className={`font-semibold ${isLive ? "text-red-600" : "text-green-600"}`}>
                {isLive ? "مباشر الآن" : "غير مباشر"}
              </span>
            </div>
          </div>

          {/* BIDS LIST */}
          <div className="bg-sandLight p-6 rounded-soft shadow-card border border-[#f3e1d3]">
            <h2 className="font-bold text-xl mb-4">البيدات</h2>

            {/* Subscribers Count */}
            <div className="mb-4">
              <span className="font-semibold">عدد المشتركين: {subscribersCount}</span>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-sandDark">
                <tr>
                  <th className="p-2">المزايد</th>
                  <th className="p-2">السعر</th>
                  <th className="p-2">الوقت</th>
                </tr>
              </thead>

              <tbody>
                {/* Dynamic bids */}
                <tr className="border-t">
                  <td className="p-2">أحمد</td>
                  <td className="p-2">80500</td>
                  <td className="p-2">10:22 PM</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SIDE: LIVE VIDEO (60%) */}
        <div className="lg:col-span-3">
          <div className="bg-sandLight p-6 rounded-soft shadow-card border border-[#f3e1d3] h-full">
            <h2 className="font-bold text-xl mb-4">البث المباشر</h2>

            <div className="bg-slate-200 h-96 rounded flex items-center justify-center">
              <p>نافذة البث المباشر</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
