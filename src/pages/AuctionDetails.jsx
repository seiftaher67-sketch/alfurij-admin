import React from 'react';
import { useParams } from 'react-router-dom';

export default function AuctionDetails() {
  const { id } = useParams();

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">تفاصيل المزاد #{id}</h1>

      <div className="bg-sandLight p-6 border border-[#f3e1d3] rounded-soft shadow-card space-y-4">

        <h2 className="font-bold">المشاركين</h2>
        <ul className="list-disc pr-5 text-gray-600">
          <li>أحمد (3 بيدات)</li>
          <li>سلمان (6 بيدات)</li>
        </ul>

        <h2 className="font-bold">البيدات</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td className="p-2 border">أحمد</td>
              <td className="p-2 border">80500</td>
            </tr>
          </tbody>
        </table>

        <h2 className="font-bold">المدة الزمنية</h2>
        <p>البداية: 2025-11-20 10:00</p>
        <p>النهاية: 2025-11-23 22:00</p>
      </div>
    </div>
  );
}
