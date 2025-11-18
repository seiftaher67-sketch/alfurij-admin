import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  List,
  Gavel,
  Truck,
  Bell,
  DollarSign,
  LogOut,
} from "lucide-react";

const menu = [
  { to: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { to: "/listings", label: "القوائم", icon: List },
  { to: "/auctions", label: "المزادات", icon: Gavel },
  {
    label: "إضافة شاحنة",
    icon: Truck,
    subItems: [
      { to: "/add-truck", label: "إضافة إعلان" },
      { to: "/add-model", label: "إضافة موديل" },
      { to: "/banners", label: "إضافة بانر" },
    ],
  },
  { to: "/notifications", label: "الإشعارات", icon: Bell },
  { to: "/financial-transactions", label: "المعاملات المالية", icon: DollarSign },
];

export default function Sidebar({ onLogout }) {
  const [expandedItem, setExpandedItem] = useState(null);

  const toggleExpand = (index) => {
    setExpandedItem(expandedItem === index ? null : index);
  };

  return (
    <aside className="w-64 bg-gradient-to-br from-yellow-500 via-gray-400 to-yellow-500 border-r border-gray-300 p-4">
      {/* Logo Section */}
      <div className="flex items-center justify-start mb-8">
        <div className="bg-primary p-3 rounded-2xl ">
          <img src="/Alfouriaj-01 1 (1).png" alt="Logo" className="h-16 w-auto" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-lg font-bold text-black-500 mb-8 text-center tracking-wide">
        Al-Furij Dashboard
      </h2>

      {/* Navigation */}
      <nav className="flex flex-col gap-2">
        {menu.map((item, index) => (
          <div key={index}>
            {item.subItems ? (
              <div>
                <button
                  onClick={() => toggleExpand(index)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ease-in-out text-white hover:bg-yellow-500 hover:shadow-lg hover:scale-105 group w-full text-left ${expandedItem === index ? 'bg-yellow-500' : ''}`}
                >
                  <div className="p-2 rounded-xl transition-colors duration-300 bg-primary group-hover:bg-dark group-hover:text-white">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                  <span className="ml-auto">{expandedItem === index ? "▼" : "▶"}</span>
                </button>
                {expandedItem === index && (
                  <div className="ml-8 mt-2 flex flex-col gap-1">
                    {item.subItems.map((subItem) => (
                      <NavLink
                        key={subItem.to}
                        to={subItem.to}
                        className={({ isActive }) =>
                          `flex items-center gap-4 px-4 py-2 rounded-xl transition-all duration-300 ease-in-out text-white hover:bg-primary hover:shadow-md hover:scale-105 group ${isActive ? "bg-primary font-semibold shadow-md scale-105" : ""}`
                        }
                      >
                        <span className="font-medium text-sm">{subItem.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ease-in-out
                  text-white hover:bg-primary hover:shadow-lg hover:scale-105
                  group
                  ${isActive ? "bg-primary font-semibold shadow-lg scale-105" : ""}`
                }
              >
                <div className="p-2 rounded-xl transition-colors duration-300 bg-primary group-hover:bg-dark group-hover:text-white">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="mt-8">
        <button
          onClick={onLogout}
          className="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ease-in-out text-white hover:bg-red-500 hover:shadow-lg hover:scale-105 group w-full"
        >
          <div className="p-2 rounded-xl transition-colors duration-300 bg-primary group-hover:bg-dark group-hover:text-white">
            <LogOut className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium">تسجيل الخروج</span>
        </button>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-600">
        <p className="text-xs text-gray-400 text-center">
          © 2024 Al-Furij
        </p>
      </div>
    </aside>
  );
}
