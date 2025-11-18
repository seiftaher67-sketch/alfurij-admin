import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Truck, DollarSign, Users } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="w-full min-h-screen flex bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-dark mb-8">نظرة عامة</h1>

        {/* Top Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <InfoCard icon={DollarSign} title="إجمالي المبيعات" value="$2K" change="-6%" />
          <InfoCard icon={Users} title="عدد المستخدمين الجدد" value="412" change="+22%" />
          <InfoCard icon={Truck} title="عدد الشاحنات المدرجة" value="128" change="+8%" />
        </div>

        {/* Middle Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Placeholder */}
          <Card className="rounded-soft bg-sandLight shadow-card h-72 flex items-center justify-center text-textSoft">
            <span>📊 سيتم وضع رسم بياني هنا</span>
          </Card>

          {/* Sales Chart */}
          <Card className="rounded-soft bg-sandLight shadow-card h-72 p-4">
            <h3 className="text-lg font-semibold text-textDark mb-3">المبيعات حسب النوع</h3>
            <div className="flex items-end gap-4 h-52 justify-center mt-4">
              <Bar height={30} label="AAC" />
              <Bar height={60} label="MP3" />
              <Bar height={120} label="MP4" />
              <Bar height={180} label="MPEG" />
            </div>
          </Card>

          {/* Best Sellers */}
          <Card className="rounded-soft bg-sandLight shadow-card h-72 p-4">
            <h3 className="text-lg font-semibold text-textDark mb-4">الأكثر بيعًا</h3>
            <ul className="text-textSoft space-y-2">
              <li className="flex justify-between"><span>شاحنات نقل</span><span>2108</span></li>
              <li className="flex justify-between"><span>شاحنات خفيفة</span><span>944</span></li>
              <li className="flex justify-between"><span>معدات ثقيلة</span><span>221</span></li>
              <li className="flex justify-between"><span>أخرى</span><span>41</span></li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
}

// ——————————————————————————
// Info Card Component
// ——————————————————————————
function InfoCard({ icon: Icon, title, value, change }) {
  return (
    <Card className="rounded-soft bg-sandLight shadow-card p-6">
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="bg-sandDark p-4 rounded-xl shadow-sm">
            <Icon className="w-7 h-7 text-primaryDark" />
          </div>
          <div>
            <h3 className="text-textDark text-lg font-semibold">{title}</h3>
            <p className="text-2xl font-bold text-textSoft">{value}</p>
            <span className="text-sm text-red-500">{change}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ——————————————————————————
// Bar Chart Placeholder Component
// ——————————————————————————
function Bar({ height, label }) {
  return (
    <div className="flex flex-col items-center text-textSoft">
      <div
        className="w-10 bg-sandDark rounded-t-xl shadow-md"
        style={{ height: `${height}px` }}
      ></div>
      <span className="text-sm mt-2">{label}</span>
    </div>
  );
}
