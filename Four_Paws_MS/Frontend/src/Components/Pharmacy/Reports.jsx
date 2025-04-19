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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const handleDownloadPDF = () => {
    window.open("http://localhost:3001/pharmacy/api/revenue/export/pdf", "_blank");
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // Fetch all medicines first to get current stock and prices
        const medsResponse = await fetch("http://localhost:3001/pharmacy/api/medicines");
        if (!medsResponse.ok) throw new Error('Failed to fetch medicines');
        const medicines = await medsResponse.json();

        // Calculate metrics from medicines data
        const totalMedicine = medicines.length;
        const totalRevenue = medicines.reduce((sum, med) => sum + (med.price * med.stock), 0);

        // Create mock sales data based on current stock (for demo purposes)
        const mockSales = medicines.map(med => ({
          medicine_id: med.id,
          medicine_name: med.name,
          price: med.price,
          quantity: Math.max(1, Math.floor(med.stock * 0.2)), // Assume 20% of stock was sold
          created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
        }));

        // Calculate monthly revenue
        const monthlyRevenue = calculateMonthlyRevenue(mockSales);
        setRevenueData(monthlyRevenue);

        // Get top selling medicines
        const topMedicines = getTopSellingMedicines(mockSales);
        setTopMedicines(topMedicines);

        // Set key metrics
        setKeyMetrics({
          totalUsers: 0, // Placeholder until you have users table
          totalMedicine,
          totalRevenue
        });

      } catch (err) {
        console.error("Error fetching data", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const calculateMonthlyRevenue = (salesData) => {
    const monthlyData = {};
    
    salesData.forEach(sale => {
      const date = new Date(sale.created_at);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: monthName,
          monthKey: monthYear,
          revenue: 0
        };
      }
      
      monthlyData[monthYear].revenue += sale.price * sale.quantity;
    });
    
    // Sort by month and ensure we have at least 6 months of data for the chart
    const sortedData = Object.values(monthlyData).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
    
    // Fill in missing months with zero revenue if we have less than 6 months
    if (sortedData.length < 6) {
      const months = [];
      const currentDate = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setMonth(date.getMonth() - i);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        if (!sortedData.find(item => item.monthKey === monthYear)) {
          months.push({
            month: monthName,
            monthKey: monthYear,
            revenue: 0
          });
        }
      }
      return [...sortedData, ...months].sort((a, b) => a.monthKey.localeCompare(b.monthKey));
    }
    
    return sortedData;
  };

  const getTopSellingMedicines = (salesData) => {
    const medicineSales = {};
    
    salesData.forEach(sale => {
      if (!medicineSales[sale.medicine_id]) {
        medicineSales[sale.medicine_id] = {
          name: sale.medicine_name,
          value: 0
        };
      }
      medicineSales[sale.medicine_id].value += sale.quantity;
    });
    
    // Get top 5 medicines
    return Object.values(medicineSales)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const toggleChartView = () => {
    setActiveChart(prev => prev === 'bar' ? 'pie' : 'bar');
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
                  ${keyMetrics.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
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
              Monthly Revenue
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={toggleChartView}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
              >
                {activeChart === 'bar' ? 'Show Pie Chart' : 'Show Bar Chart'}
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
                      formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                    />
                    <Legend />
                    <Bar 
                      dataKey="revenue" 
                      name="Revenue ($)" 
                      fill="#10b981" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={revenueData.map(item => ({
                        name: item.month,
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
                      formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
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
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <PieChartIcon className="mr-2" size={18} />
            Top Selling Medicines
          </h2>
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
                    formatter={(value) => [`${value} units sold`, 'Quantity']}
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