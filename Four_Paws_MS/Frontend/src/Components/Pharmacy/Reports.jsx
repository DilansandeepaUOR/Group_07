"use client"

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ReportsSection() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topMedicines, setTopMedicines] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  const [period, setPeriod] = useState('day');
  const [revenue, setRevenue] = useState(null);
  const [loadingRevenue, setLoadingRevenue] = useState(false);
  const [errorRevenue, setErrorRevenue] = useState(null);

  const CHART_COLORS = [
    '#71C9CE',  // Teal accent
    '#A6E3E9',  // Light teal
    '#FFD700',  // Yellow
    '#FF8042',  // Orange
    '#8884d8'   // Purple
  ];

  const periods = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
  ];

  useEffect(() => {
    const fetchTopSelling = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('http://localhost:3001/pharmacy/api/sales');
        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }
        const resData = await res.json();
        const data = resData[0] || [];
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format from API");
        }
        const transformedData = data.map(med => ({
          name: med.name || "Unknown Medicine",
          value: Math.abs(med.total_sold || 0),
          revenue: med.total_revenue || 0
        }));
        setTopMedicines(transformedData);
        setError(null);
      } catch (err) {
        setError(err.message);
        setTopMedicines([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopSelling();
  }, []);

  useEffect(() => {
    fetchRevenue();
  }, [period]);

  const fetchRevenue = async () => {
    setLoadingRevenue(true);
    try {
      const res = await fetch(`http://localhost:3001/pharmacy/api/sales-revenue?period=${period}`);
      if (!res.ok) {
        throw new Error('Failed to fetch revenue');
      }
      const data = await res.json();
      setRevenue(data.revenue || 0);
      setErrorRevenue(null);
    } catch (err) {
      setErrorRevenue(err.message);
      setRevenue(null);
    } finally {
      setLoadingRevenue(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Sales Revenue Report", 20, 20);

    doc.setFontSize(12);
    doc.text(`Period: ${periods.find(p => p.value === period)?.label}`, 20, 35);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 20, 45);

    doc.autoTable({
      startY: 60,
      head: [["Period", "Total Revenue"]],
      body: [
        [
          periods.find(p => p.value === period)?.label,
          `LKR ${revenue.toFixed(2)}`
        ]
      ],
    });

    doc.save(`Sales_Revenue_${period}.pdf`);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(value);
  };

  const renderActiveShape = (props) => {
    const {
      cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value
    } = props;
    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#333">{payload.name}</text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#555">{`${value} units`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey + 20} textAnchor={textAnchor} fill="#555">{(percent * 100).toFixed(2)}%</text>
      </g>
    );
  };

  return (
    <div className="bg-gradient-to-b from-[#E0F7FA] to-[#B2EBF2] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Reports & Analytics</h1>

        {/* Top Selling Medicines */}
        <div className="bg-white/30 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6 border border-[#71C9CE]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <PieChartIcon className="mr-2 text-[#71C9CE]" size={20} />
              Top Selling Medicines
            </h2>
            {topMedicines.length > 0 && (
              <div className="text-sm text-[#71C9CE] font-medium">
                Total Sold: {topMedicines.reduce((sum, med) => sum + med.value, 0).toLocaleString()} units
              </div>
            )}
          </div>

          <div className="h-80">
            {isLoading ? (
              <div className="h-full flex items-center justify-center bg-white/20 rounded-lg">
                <div className="text-[#71C9CE]">Loading medicine data...</div>
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center bg-white/20 rounded-lg text-red-500">
                Error: {error}
              </div>
            ) : topMedicines.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={topMedicines}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    animationDuration={800}
                  >
                    {topMedicines.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${value} units sold`,
                      `Revenue: ${formatCurrency(props.payload.revenue)}`
                    ]}
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      border: `1px solid #71C9CE`,
                      borderRadius: '6px',
                      color: '#333'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center bg-white/20 rounded-lg">
                <div className="text-[#71C9CE]">No sales data available</div>
              </div>
            )}
          </div>
        </div>

        {/* Sales Revenue Report */}
        <div className="bg-white/30 backdrop-blur-md rounded-lg shadow-lg p-6 border border-[#71C9CE]">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px] bg-white/70">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {periods.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={exportPDF}
              className="bg-[#71C9CE] hover:bg-[#A6E3E9] text-gray-900"
            >
              Export as PDF
            </Button>
          </div>

          <div className="p-6 bg-white/50 rounded-lg shadow-inner flex justify-center items-center min-h-32">
            {loadingRevenue ? (
              <div className="text-[#71C9CE]">Loading revenue...</div>
            ) : errorRevenue ? (
              <div className="text-red-500">Error: {errorRevenue}</div>
            ) : (
              <div className="text-2xl font-bold text-[#71C9CE]">
                Total Revenue: LKR {revenue?.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}