import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import ListingRow from "../components/listings/ListingRow";
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, MapPinIcon, FolderIcon } from "@heroicons/react/24/outline";
import { listingAPI } from "../services/api";

export default function Listings() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    city: "",
    category: "",
  });
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statuses = [
    { label: "الكل", value: "" },
    { label: "قيد المراجعة", value: "pending" },
    { label: "تمت الموافقة", value: "approved" },
    { label: "مرفوض", value: "rejected" },
    { label: "مسودة", value: "draft" },
  ];

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.city) params.city = filters.city;
      if (filters.category) params.category = filters.category;

      const response = await listingAPI.getAdminListings(params);
      setListings(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-sandLight min-h-screen font-cairo">
        <div className="text-center">جاري التحميل...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6 bg-sandLight min-h-screen font-cairo">
        <div className="text-center text-red-500">خطأ: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-sandLight min-h-screen font-cairo">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-textDark">قائمة الإعلانات</h1>
        <div className="text-sm text-textSoft">
          إجمالي الإعلانات: {listings.length}
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-card border-sandDark">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-textSoft" />
              <Input
                placeholder="بحث بالعنوان أو البائع..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 bg-sandLight border-sandDark focus:border-primary"
              />
            </div>

            <Select
              value={filters.status}
              onValueChange={(v) => handleFilterChange('status', v)}
            >
              <SelectTrigger className="bg-sandLight border-sandDark focus:border-primary">
                <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-textSoft" />
              <Input
                placeholder="المدينة"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="pl-10 bg-sandLight border-sandDark focus:border-primary"
              />
            </div>

            <div className="relative">
              <FolderIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-textSoft" />
              <Input
                placeholder="القسم"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="pl-10 bg-sandLight border-sandDark focus:border-primary"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((item) => (
          <ListingRow
            key={item.id}
            item={{
              id: item.id,
              title: item.title,
              seller: item.seller?.name || 'غير محدد',
              category: item.category,
              city: item.city,
              status: item.approval_status,
              price: item.price_in_sar?.toString() || '0',
              phone: item.seller?.phone || '',
            }}
            onViewDetails={(id) => navigate(`/listings/${id}`)}
          />
        ))}
      </div>
      {listings.length === 0 && (
        <div className="p-8 text-center text-textSoft bg-white rounded-lg shadow-card border-sandDark">
          لا توجد إعلانات مطابقة للبحث.
        </div>
      )}
    </div>
  );
}
