import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";
import { Download, PieChart as PieChartIcon, BarChart2, Users, Package, DollarSign } from "react-feather";

export default function ReportsSection() {
  const [revenueData, setRevenueData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keyMetrics, setKeyMetrics] = useState({
    totalUsers: 0,
    totalMedicine: 0,
    totalRevenue: 0,
    monthlyGrowth: 0
  });



  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const handleDownloadPDF = () => {
    window.open("http://localhost:3001/pharmacy/api/revenue/export/pdf", "_blank");
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // Fetch monthly revenue data
        const revenueResponse = await fetch("http://localhost:3001/pharmacy/api/revenue/monthly");
        if (!revenueResponse.ok) throw new Error('Failed to fetch revenue data');
        const revenueData = await revenueResponse.json();
        
        // Format data for chart
        const formattedData = revenueData.map(item => ({
          month: new Date(item.year, item.month - 1).toLocaleString('default', { month: 'short', year: 'numeric' }),
          revenue: item.total_revenue,
          salesCount: item.sales_count
        }));
        
        setRevenueData(formattedData);

        // Fetch key metrics
        const metricsResponse = await fetch("http://localhost:3001/pharmacy/api/metrics");
        if (!metricsResponse.ok) throw new Error('Failed to fetch metrics');
        const metrics = await metricsResponse.json();
        setKeyMetrics(metrics);

      } catch (err) {
        console.error("Error fetching data", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <div style={{ padding: "24px", backgroundColor: "#f9fafb" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "24px", color: "#1f2937" }}>
        Pharmacy Analytics Dashboard
      </h1>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "24px" 
      }}>
        {/* Monthly Revenue Section */}
        <div style={{ 
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          gridColumn: "span 2"
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "16px" 
          }}>
            <h2 style={{ 
              fontSize: "1.125rem", 
              fontWeight: "600", 
              color: "#374151",
              display: "flex",
              alignItems: "center"
            }}>
              <BarChart2 style={{ marginRight: "8px" }} size={18} />
              Monthly Revenue Analysis
            </h2>
            <button
              onClick={handleDownloadPDF}
              style={{
                backgroundColor: "#10b981",
                color: "white",
                padding: "8px 16px",
                borderRadius: "6px",
                fontWeight: "500",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center"
              }}
            >
              <Download style={{ marginRight: "8px" }} size={14} />
              Export Report
            </button>
          </div>

          {isLoading ? (
            <div style={{ 
              height: "300px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              backgroundColor: "#f3f4f6",
              borderRadius: "4px"
            }}>
              <div style={{ color: "#6b7280" }}>Loading revenue data...</div>
            </div>
          ) : error ? (
            <div style={{ 
              height: "300px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              backgroundColor: "#f3f4f6",
              borderRadius: "4px",
              color: "#ef4444"
            }}>
              Error: {error}
            </div>
          ) : (
            <div style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value, name) => {
                      if (name === 'Revenue ($)') return [`$${value.toLocaleString()}`, name];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue ($)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="salesCount" name="Sales Count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div style={{ 
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          gridColumn: "span 2"
        }}>
          <h2 style={{ 
            fontSize: "1.125rem", 
            fontWeight: "600", 
            color: "#374151",
            marginBottom: "16px"
          }}>
            Pharmacy Performance Metrics
          </h2>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px" 
          }}>
            {/* Total Users */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              padding: "12px",
              backgroundColor: "#f3f4f6",
              borderRadius: "8px"
            }}>
              <div style={{ 
                padding: "8px", 
                backgroundColor: "#bfdbfe", 
                borderRadius: "50%",
                marginRight: "12px"
              }}>
                <Users color="#3b82f6" size={18} />
              </div>
              <div>
                <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Total Customers</div>
                <div style={{ fontWeight: "600", color: "#1f2937" }}>
                  {keyMetrics.totalUsers.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Total Medicine */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              padding: "12px",
              backgroundColor: "#f3f4f6",
              borderRadius: "8px"
            }}>
              <div style={{ 
                padding: "8px", 
                backgroundColor: "#a7f3d0", 
                borderRadius: "50%",
                marginRight: "12px"
              }}>
                <Package color="#10b981" size={18} />
              </div>
              <div>
                <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Medicines in Stock</div>
                <div style={{ fontWeight: "600", color: "#1f2937" }}>
                  {keyMetrics.totalMedicine.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              padding: "12px",
              backgroundColor: "#f3f4f6",
              borderRadius: "8px"
            }}>
              <div style={{ 
                padding: "8px", 
                backgroundColor: "#ddd6fe", 
                borderRadius: "50%",
                marginRight: "12px"
              }}>
                <DollarSign color="#8b5cf6" size={18} />
              </div>
              <div>
                <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Total Revenue</div>
                <div style={{ fontWeight: "600", color: "#1f2937" }}>
                  ${keyMetrics.totalRevenue.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Monthly Growth */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              padding: "12px",
              backgroundColor: "#f3f4f6",
              borderRadius: "8px"
            }}>
              <div style={{ 
                padding: "8px", 
                backgroundColor: keyMetrics.monthlyGrowth >= 0 ? "#a7f3d0" : "#fecaca", 
                borderRadius: "50%",
                marginRight: "12px"
              }}>
                <BarChart2 color={keyMetrics.monthlyGrowth >= 0 ? "#10b981" : "#ef4444"} size={18} />
              </div>
              <div>
                <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Monthly Growth</div>
                <div style={{ 
                  fontWeight: "600", 
                  color: keyMetrics.monthlyGrowth >= 0 ? "#10b981" : "#ef4444"
                }}>
                  {keyMetrics.monthlyGrowth >= 0 ? '+' : ''}{keyMetrics.monthlyGrowth}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Selling Medicines */}
        <div style={{ 
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          gridColumn: "1 / -1"
        }}>
          <h2 style={{ 
            fontSize: "1.125rem", 
            fontWeight: "600", 
            color: "#374151",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center"
          }}>
            <PieChartIcon style={{ marginRight: "8px" }} size={18} />
            Top Selling Medicines
          </h2>
          {isLoading ? (
            <div style={{ 
              height: "300px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              backgroundColor: "#f3f4f6",
              borderRadius: "4px"
            }}>
              <div style={{ color: "#6b7280" }}>Loading medicine data...</div>
            </div>
          ) : error ? (
            <div style={{ 
              height: "300px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              backgroundColor: "#f3f4f6",
              borderRadius: "4px",
              color: "#ef4444"
            }}>
              Error: {error}
            </div>
          ) : (
            <div style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={keyMetrics.topSellingMedicines || []}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={100}
                    tick={{ fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value) => [`${value} units sold`, 'Quantity']}
                  />
                  <Legend />
                  <Bar dataKey="quantity" name="Units Sold" fill="#8884d8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}