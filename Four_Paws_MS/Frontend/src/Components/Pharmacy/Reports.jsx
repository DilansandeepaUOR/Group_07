"use client"

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from "recharts";
import { PieChart as PieChartIcon, Table as TableIcon } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";

export default function ReportsSection() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topMedicines, setTopMedicines] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  const [period, setPeriod] = useState('day');
  const [revenue, setRevenue] = useState(0);
  const [loadingRevenue, setLoadingRevenue] = useState(false);
  const [errorRevenue, setErrorRevenue] = useState(null);

  const [detailedSales, setDetailedSales] = useState([]);
  const [loadingDetailed, setLoadingDetailed] = useState(false);
  const [errorDetailed, setErrorDetailed] = useState(null);

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
    fetchDetailedSales();
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
      setRevenue(0);
    } finally {
      setLoadingRevenue(false);
    }
  };

  const fetchDetailedSales = async () => {
    setLoadingDetailed(true);
    try {
      const res = await fetch(`http://localhost:3001/pharmacy/api/detailed-sales?period=${period}`);
      if (!res.ok) {
        throw new Error('Failed to fetch detailed sales');
      }
      const data = await res.json();
      setDetailedSales(data);
      setErrorDetailed(null);
    } catch (err) {
      setErrorDetailed(err.message);
      setDetailedSales([]);
    } finally {
      setLoadingDetailed(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Report title
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("Pharmacy Sales Report", 105, 15, { align: 'center' });
    
    // Period and date
    doc.setFontSize(12);
    doc.text(`Period: ${periods.find(p => p.value === period)?.label}`, 20, 30);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 20, 40);
    
    // Revenue summary
    doc.setFontSize(14);
    doc.setTextColor(113, 201, 206); // #71C9CE
    doc.text("Revenue Summary", 20, 55);
    
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.autoTable({
      startY: 60,
      head: [["Period", "Total Revenue"]],
      body: [
        [
          periods.find(p => p.value === period)?.label,
          `LKR ${revenue.toFixed(2)}`
        ]
      ],
      headStyles: {
        fillColor: [113, 201, 206],
        textColor: [255, 255, 255]
      },
      margin: { top: 60 }
    });

    // Top selling medicines
    doc.setFontSize(14);
    doc.setTextColor(113, 201, 206);
    doc.text("Top Selling Medicines", 20, doc.autoTable.previous.finalY + 20);
    
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 25,
      head: [["Medicine", "Units Sold", "Revenue"]],
      body: topMedicines.map(item => [
        item.name,
        item.value,
        `LKR ${item.revenue.toFixed(2)}`
      ]),
      headStyles: {
        fillColor: [113, 201, 206],
        textColor: [255, 255, 255]
      }
    });

    // Detailed sales
    doc.setFontSize(14);
    doc.setTextColor(113, 201, 206);
    doc.text("Detailed Sales", 20, doc.autoTable.previous.finalY + 20);
    
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 25,
      head: [["Medicine", "Unit Price", "Quantity Sold", "Revenue"]],
      body: detailedSales.map(item => [
        item.name,
        `LKR ${item.price.toFixed(2)}`,
        item.quantity_sold,
        `LKR ${item.total_revenue.toFixed(2)}`
      ]),
      headStyles: {
        fillColor: [113, 201, 206],
        textColor: [255, 255, 255]
      },
      columnStyles: {
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 }
      }
    });

    doc.save(`Pharmacy_Sales_Report_${period}.pdf`);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
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
    <div className="bg-gradient-to-b from-[#E0F7FA] to-[#B2EBF2] p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Reports & Analytics</h1>

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
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
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
            </div>
            
          </div>

          <div className="p-6 bg-white/50 rounded-lg shadow-inner flex justify-center items-center min-h-32 mb-6">
            {loadingRevenue ? (
              <div className="text-[#71C9CE]">Loading revenue...</div>
            ) : errorRevenue ? (
              <div className="text-red-500">Error: {errorRevenue}</div>
            ) : (
              <div className="text-2xl font-bold text-[#71C9CE]">
                Total Revenue: {formatCurrency(revenue)}
              </div>
            )}
          </div>

          {/* Detailed Sales Table */}
          <div className="bg-white/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TableIcon className="mr-2 text-[#71C9CE]" size={18} />
              Detailed Sales
            </h3>
            
            {loadingDetailed ? (
              <div className="text-center py-4 text-[#71C9CE]">Loading sales data...</div>
            ) : errorDetailed ? (
              <div className="text-center py-4 text-red-500">Error: {errorDetailed}</div>
            ) : detailedSales.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#71C9CE]/30">
                  <thead className="bg-[#71C9CE]/20">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Medicine</th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Unit Price</th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Quantity</th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#71C9CE]/20">
                    {detailedSales.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 text-sm text-gray-800">{item.name}</td>
                        <td className="px-4 py-2 text-sm text-right text-gray-800">{formatCurrency(item.price)}</td>
                        <td className="px-4 py-2 text-sm text-right text-gray-800">{item.quantity_sold}</td>
                        <td className="px-4 py-2 text-sm text-right text-gray-800">{formatCurrency(item.total_revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#71C9CE]/10">
                    <tr>
                      <td className="px-4 py-2 text-sm font-semibold text-gray-800">Total</td>
                      <td className="px-4 py-2 text-sm text-right text-gray-800"></td>
                      <td className="px-4 py-2 text-sm text-right font-semibold text-gray-800">
                        {detailedSales.reduce((sum, item) => sum + item.quantity_sold, 0)}
                      </td>
                      <td className="px-4 py-2 text-sm text-right font-semibold text-gray-800">
                        {formatCurrency(detailedSales.reduce((sum, item) => sum + item.total_revenue, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-[#71C9CE]">No sales data available for this period</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}