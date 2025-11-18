import React from "react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "../ui/card";
import {
  EyeIcon,
  DocumentTextIcon,
  UserIcon,
  TagIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

export default function ListingRow({ item, onViewDetails }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case "pending":
        return {
          label: "قيد المراجعة",
          color: "bg-yellow-100 text-yellow-800 border-yellow-300",
          icon: <ClockIcon className="h-4 w-4" />,
        };
      case "approved":
        return {
          label: "موافق عليه",
          color: "bg-green-100 text-green-800 border-green-300",
          icon: <CheckCircleIcon className="h-4 w-4" />,
        };
      case "rejected":
        return {
          label: "مرفوض",
          color: "bg-red-100 text-red-800 border-red-300",
          icon: <XCircleIcon className="h-4 w-4" />,
        };
      default:
        return {
          label: "مسودة",
          color: "bg-gray-100 text-gray-800 border-gray-300",
          icon: <PencilIcon className="h-4 w-4" />,
        };
    }
  };

  const statusConfig = getStatusConfig(item.status);

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color} shadow-sm`}
          >
            {statusConfig.icon}
            <span className="ml-2">{statusConfig.label}</span>
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <UserIcon className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700 text-sm">البائع: {item.seller}</span>
          </div>
          <div className="flex items-center space-x-2">
            <TagIcon className="h-5 w-5 text-purple-500" />
            <span className="text-gray-700 text-sm">الفئة: {item.category}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPinIcon className="h-5 w-5 text-red-500" />
            <span className="text-gray-700 text-sm">المدينة: {item.city}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
            <span className="font-bold text-green-600 text-sm">السعر: {item.price} ريال</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onViewDetails(item.id)}
          className="bg-blue-600 text-black border-blue-600 hover:bg-blue-700 hover:border-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm ml-auto"
        >
          <EyeIcon className="h-4 w-4" />
          <span>عرض التفاصيل</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
