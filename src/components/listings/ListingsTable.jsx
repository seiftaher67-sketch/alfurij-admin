import React, { useState } from "react";
import ReviewPanel from "./ReviewPanel";

export default function ListingsTable({ listings = [] }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="bg-sandLight rounded-soft shadow-card p-4 border border-[#f3e1d3]">
      <table className="w-full table-auto text-sm">
        <thead>
          <tr className="text-left">
            <th className="p-2">#</th>
            <th className="p-2">صور</th>
            <th className="p-2">العنوان</th>
            <th className="p-2">النوع</th>
            <th className="p-2">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((l) => (
            <tr key={l.id} className="border-t">
              <td className="p-2">{l.id}</td>
              <td className="p-2">
                <img
                  src={l.thumb}
                  alt=""
                  className="w-28 h-16 object-cover rounded"
                />
              </td>
              <td className="p-2">{l.title}</td>
              <td className="p-2">{l.type}</td>
              <td className="p-2">
                <button
                  onClick={() => setSelected(l)}
                  className="px-3 py-1 bg-brand-500 text-white rounded"
                >
                  مراجعة
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <ReviewPanel listing={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
