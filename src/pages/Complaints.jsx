import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import api from "../services/api";

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await api.get("/complaints");
      setComplaints(response.data);
    } catch (err) {
      setError("فشل في تحميل الشكاوى والاقتراحات");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-right">الشكاوى والاقتراحات</h1>

      <div className="grid gap-4">
        {complaints.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">لا توجد شكاوى أو اقتراحات</p>
            </CardContent>
          </Card>
        ) : (
          complaints.map((complaint) => (
            <Card key={complaint.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge
                    variant={complaint.type === "complaint" ? "destructive" : "secondary"}
                  >
                    {complaint.type === "complaint" ? "شكوى" : "اقتراح"}
                  </Badge>
                  <div className="text-right">
                    <CardTitle className="text-lg">
                      {complaint.user?.name || "مستخدم غير معروف"}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {new Date(complaint.created_at).toLocaleDateString("ar-EG")}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-right">{complaint.message}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
