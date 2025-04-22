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
    totalRevenue: 0
  });
  const [topMedicines, setTopMedicines] = useState([]);
  const [activeChart, setActiveChart] = useState('bar'); // 'bar' or 'pie'
  const [timeRange, setTimeRange] = useState('monthly'); // 'monthly', 'quarterly', 'yearly'

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const handleDownloadPDF = () => {
    window.open("http://localhost:3001/pharmacy/api/reports/export/pdf", "_blank");
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // Fetch all data in parallel
        const [metricsResponse, revenueResponse, topMedicinesResponse] = await Promise.all([
          fetch("http://localhost:3001/pharmacy/api/metrics"),
          fetch(`http://localhost:3001/pharmacy/api/revenue?range=${timeRange}`),
          fetch("http://localhost:3001/pharmacy/api/medicines/top-selling?limit=5")
        ]);

        if (!metricsResponse.ok || !revenueResponse.ok || !topMedicinesResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [metrics, revenue, topMeds] = await Promise.all([
          metricsResponse.json(),
          revenueResponse.json(),
          topMedicinesResponse.json()
        ]);

        setKeyMetrics({
          totalUsers: metrics.totalUsers || 0,
          totalMedicine: metrics.totalMedicine || 0,
          totalRevenue: metrics.totalRevenue || 0
        });

        setRevenueData(revenue);
        setTopMedicines(topMeds.map(med => ({
          name: med.name,
          value: med.total_sold,
          revenue: med.total_revenue
        })));

      } catch (err) {
        console.error("Error fetching data", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [timeRange]);

  const toggleChartView = () => {
    setActiveChart(prev => prev === 'bar' ? 'pie' : 'bar');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reports & Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Metrics */}
        <div className="bg-white p-5 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Key Metrics</h2>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full mr-3">
                <Users className="text-blue-500" size={18} />
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Users</div>
                <div className="font-semibold text-gray-800">
                  {keyMetrics.totalUsers.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-full mr-3">
                <Package className="text-green-500" size={18} />
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Medicine</div>
                <div className="font-semibold text-gray-800">
                  {keyMetrics.totalMedicine.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-full mr-3">
                <DollarSign className="text-purple-500" size={18} />
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Revenue</div>
                <div className="font-semibold text-gray-800">
                  {formatCurrency(keyMetrics.totalRevenue)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart - Takes 2 columns on larger screens */}
        <div className="bg-white p-5 rounded-lg shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center">
              <BarChart2 className="mr-2" size={18} />
              Revenue Overview
            </h2>
            <div className="flex space-x-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 border border-gray-300"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
              <button
                onClick={toggleChartView}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
              >
                {activeChart === 'bar' ? (
                  <>
                    <PieChartIcon className="inline mr-1" size={14} />
                    Pie Chart
                  </>
                ) : (
                  <>
                    <BarChart2 className="inline mr-1" size={14} />
                    Bar Chart
                  </>
                )}
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 flex items-center"
              >
                <Download className="mr-1" size={14} />
                Export PDF
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="h-80 flex items-center justify-center bg-gray-50 rounded">
              <div className="text-gray-500">Loading revenue data...</div>
            </div>
          ) : error ? (
            <div className="h-80 flex items-center justify-center bg-gray-50 rounded text-red-500">
              Error: {error}
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {activeChart === 'bar' ? (
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      tick={{ fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value) => [formatCurrency(value), 'Revenue']}
                    />
                    <Legend />
                    <Bar 
                      dataKey="revenue" 
                      name="Revenue" 
                      fill="#10b981" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={revenueData.map(item => ({
                        name: item.period,
                        value: item.revenue
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {revenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value), 'Revenue']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Selling Medicines */}
        <div className="bg-white p-5 rounded-lg shadow-sm lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center">
              <PieChartIcon className="mr-2" size={18} />
              Top Selling Medicines
            </h2>
            <div className="text-sm text-gray-500">
              {topMedicines.length > 0 && `Total Sold: ${topMedicines.reduce((sum, med) => sum + med.value, 0).toLocaleString()} units`}
            </div>
          </div>
          <div className="h-80">
            {isLoading ? (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded">
                <div className="text-gray-500">Loading medicine data...</div>
              </div>
            ) : topMedicines.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topMedicines}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {topMedicines.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value} units sold`,
                      `Revenue: ${formatCurrency(props.payload.revenue)}`
                    ]}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded">
                <div className="text-gray-500">No sales data available</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}