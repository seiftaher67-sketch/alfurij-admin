import React from "react";
import BannersManager from "../components/banners/BannersManager";

export default function Banners() {
  return (
    <div>
      <h1 className="text-2xl font-bold">إدارة البانرات</h1>
      <p className="mt-2">إضافة وتعديل البانرات الإعلانية.</p>
      <BannersManager />
    </div>
  );
}
