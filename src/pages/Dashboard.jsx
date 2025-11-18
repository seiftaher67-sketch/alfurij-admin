import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Truck, DollarSign, Users, TrendingUp, TrendingDown } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-sandLight via-gray-light to-sandLight">
      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-textDark mb-10 text-center">نظرة عامة على لوحة التحكم</h1>

          {/* Top Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <InfoCard icon={DollarSign} title="إجمالي المبيعات" value="$2K" change="-6%" trend="down" />
            <InfoCard icon={Users} title="عدد المستخدمين الجدد" value="412" change="+22%" trend="up" />
            <InfoCard icon={Truck} title="عدد الشاحنات المدرجة" value="128" change="+8%" trend="up" />
            <InfoCard icon={BarChart3} title="المعاملات اليومية" value="89" change="+15%" trend="up" />
          </div>

          {/* Middle Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Sales Chart */}
            <Card className="rounded-soft bg-gradient-to-br from-white to-sandLight shadow-card h-80 p-6 hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold text-textDark mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                المبيعات حسب النوع
              </h3>
              <div className="flex items-end gap-6 h-52 justify-center mt-6">
                <Bar height={30} label="AAC" color="bg-red-400" />
                <Bar height={60} label="MP3" color="bg-blue-400" />
                <Bar height={120} label="MP4" color="bg-green-400" />
                <Bar height={180} label="MPEG" color="bg-purple-400" />
              </div>
            </Card>

            {/* Best Sellers with Progress */}
            <Card className="rounded-soft bg-gradient-to-br from-white to-sandLight shadow-card h-80 p-6 hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold text-textDark mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                الأكثر بيعًا
              </h3>
              <ul className="text-textSoft space-y-4">
                <li className="flex justify-between items-center">
                  <span className="font-medium">شاحنات نقل</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">2108</span>
                    <ProgressBar value={85} />
                  </div>
                </li>
                <li className="flex justify-between items-center">
                  <span className="font-medium">شاحنات خفيفة</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">944</span>
                    <ProgressBar value={40} />
                  </div>
                </li>
                <li className="flex justify-between items-center">
                  <span className="font-medium">معدات ثقيلة</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">221</span>
                    <ProgressBar value={10} />
                  </div>
                </li>
                <li className="flex justify-between items-center">
                  <span className="font-medium">أخرى</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">41</span>
                    <ProgressBar value={2} />
                  </div>
                </li>
              </ul>
            </Card>
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <Card className="rounded-soft bg-gradient-to-r from-primary to-primaryDark text-white shadow-card p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold mb-2">معدل النمو</h4>
                  <p className="text-3xl font-bold">+12.5%</p>
                </div>
                <TrendingUp className="w-12 h-12 opacity-80" />
              </div>
            </Card>
            <Card className="rounded-soft bg-gradient-to-r from-green-500 to-green-600 text-white shadow-card p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold mb-2">رضا العملاء</h4>
                  <p className="text-3xl font-bold">94%</p>
                </div>
                <Users className="w-12 h-12 opacity-80" />
              </div>
            </Card>
            <Card className="rounded-soft bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-card p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold mb-2">المعاملات النشطة</h4>
                  <p className="text-3xl font-bold">156</p>
                </div>
                <BarChart3 className="w-12 h-12 opacity-80" />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

// ——————————————————————————
// Info Card Component
// ——————————————————————————
function InfoCard({ icon: Icon, title, value, change, trend }) {
  const isPositive = trend === "up";
  return (
    <Card className="rounded-soft bg-gradient-to-br from-white to-sandLight shadow-card p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="bg-white p-4 rounded-xl">
            <Icon className="w-8 h-8 text-black" />
          </div>
          <div className="flex-1">
            <h3 className="text-textDark text-lg font-semibold mb-1">{title}</h3>
            <p className="text-3xl font-bold text-textSoft mb-1">{value}</p>
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {change}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ——————————————————————————
// Bar Chart Component
// ——————————————————————————
function Bar({ height, label, color = "bg-sandDark" }) {
  return (
    <div className="flex flex-col items-center text-textSoft group">
      <div
        className={`w-12 ${color} rounded-t-xl shadow-md group-hover:shadow-lg transition-all duration-300`}
        style={{ height: `${height}px` }}
      ></div>
      <span className="text-sm mt-2 font-medium">{label}</span>
    </div>
  );
}

// ——————————————————————————
// Progress Bar Component
// ——————————————————————————
function ProgressBar({ value }) {
  return (
    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-primary to-primaryDark rounded-full transition-all duration-500"
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
}
