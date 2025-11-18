import React from "react";

export default function ReviewPanel({ listing, onClose }) {
  return (
    <aside className="fixed left-0 top-0 h-full w-96 bg-sandLight shadow-card p-4 z-40 border border-[#f3e1d3]">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold">مراجعة إعلان #{listing.id}</h3>
        <button onClick={onClose} className="text-slate-600">
          إغلاق
        </button>
      </div>

      <img
        src={listing.thumb}
        alt=""
        className="w-full h-44 object-cover rounded mb-3"
      />

      <p className="text-sm text-slate-700 mb-4">{listing.description}</p>

      <div className="flex gap-2">
        <button className="px-3 py-1 bg-green-600 text-white rounded">
          قبول
        </button>
        <button className="px-3 py-1 bg-red-600 text-white rounded">
          رفض
        </button>
        <button className="px-3 py-1 border rounded">طلب تعديل</button>
      </div>
    </aside>
  );
}
