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
  const [activeChart, setActiveChart] = useState('bar');
  const [timeRange, setTimeRange] = useState('monthly');

  // Color scheme
  const colors = {
    darkBackground: 'rgba(34,41,47,255)',
    tealAccent: 'rgba(59,205,191,255)',
    yellowAccent: '#FFD700',
    lightText: '#f3f4f6',
    darkText: '#111827',
    cardBackground: 'rgba(44,51,57,255)'
  };

  const CHART_COLORS = [
    colors.tealAccent, 
    colors.yellowAccent, 
    '#FF8042', 
    '#8884d8', 
    '#00C49F'
  ];

  const handleDownloadPDF = () => {
    window.open("http://localhost:3001/pharmacy/api/reports/export/pdf", "_blank");
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
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
    <div style={{
      padding: "24px",
      backgroundColor: colors.darkBackground,
      minHeight: "100vh"
    }}>
      <h1 style={{ 
        fontSize: "1.5rem", 
        fontWeight: "bold", 
        marginBottom: "24px",
        color: colors.yellowAccent
      }}>
        Reports & Analytics
      </h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "24px"
      }}>
        {/* Key Metrics */}
        <div style={{
          backgroundColor: colors.cardBackground,
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ 
            fontSize: "1.125rem",
            fontWeight: "600",
            color: colors.lightText,
            marginBottom: "16px"
          }}>
            Key Metrics
          </h2>
          <div style={{ display: "grid", gap: "16px" }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              padding: "12px",
              backgroundColor: "rgba(59,205,191,0.1)",
              borderRadius: "8px"
            }}>
              <div style={{ 
                padding: "8px",
                backgroundColor: "rgba(59,205,191,0.2)",
                borderRadius: "50%",
                marginRight: "12px"
              }}>
                <Users color={colors.tealAccent} size={18} />
              </div>
              <div>
                <div style={{ 
                  fontSize: "0.875rem",
                  color: colors.tealAccent
                }}>
                  Total Users
                </div>
                <div style={{ 
                  fontWeight: "600",
                  color: colors.lightText
                }}>
                  {keyMetrics.totalUsers.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              padding: "12px",
              backgroundColor: "rgba(255,215,0,0.1)",
              borderRadius: "8px"
            }}>
              <div style={{ 
                padding: "8px",
                backgroundColor: "rgba(255,215,0,0.2)",
                borderRadius: "50%",
                marginRight: "12px"
              }}>
                <Package color={colors.yellowAccent} size={18} />
              </div>
              <div>
                <div style={{ 
                  fontSize: "0.875rem",
                  color: colors.yellowAccent
                }}>
                  Total Medicine
                </div>
                <div style={{ 
                  fontWeight: "600",
                  color: colors.lightText
                }}>
                  {keyMetrics.totalMedicine.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              padding: "12px",
              backgroundColor: "rgba(59,205,191,0.1)",
              borderRadius: "8px"
            }}>
              <div style={{ 
                padding: "8px",
                backgroundColor: "rgba(59,205,191,0.2)",
                borderRadius: "50%",
                marginRight: "12px"
              }}>
                <DollarSign color={colors.tealAccent} size={18} />
              </div>
              <div>
                <div style={{ 
                  fontSize: "0.875rem",
                  color: colors.tealAccent
                }}>
                  Total Revenue
                </div>
                <div style={{ 
                  fontWeight: "600",
                  color: colors.lightText
                }}>
                  {formatCurrency(keyMetrics.totalRevenue)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div style={{
          backgroundColor: colors.cardBackground,
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
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
              color: colors.lightText,
              display: "flex",
              alignItems: "center"
            }}>
              <BarChart2 style={{ marginRight: "8px" }} color={colors.tealAccent} size={18} />
              Revenue Overview
            </h2>
            <div style={{ display: "flex", gap: "8px" }}>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                style={{
                  padding: "6px 12px",
                  backgroundColor: colors.darkBackground,
                  color: colors.lightText,
                  borderRadius: "6px",
                  border: `1px solid ${colors.tealAccent}`,
                  fontSize: "0.875rem"
                }}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
              <button
                onClick={toggleChartView}
                style={{
                  padding: "6px 12px",
                  backgroundColor: colors.darkBackground,
                  color: colors.lightText,
                  borderRadius: "6px",
                  border: `1px solid ${colors.tealAccent}`,
                  fontSize: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                {activeChart === 'bar' ? (
                  <>
                    <PieChartIcon size={14} />
                    Pie Chart
                  </>
                ) : (
                  <>
                    <BarChart2 size={14} />
                    Bar Chart
                  </>
                )}
              </button>
              <button
                onClick={handleDownloadPDF}
                style={{
                  padding: "6px 12px",
                  backgroundColor: colors.yellowAccent,
                  color: colors.darkText,
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontWeight: "500"
                }}
              >
                <Download size={14} />
                Export PDF
              </button>
            </div>
          </div>

          {isLoading ? (
            <div style={{ 
              height: "320px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: "8px"
            }}>
              <div style={{ color: colors.tealAccent }}>Loading revenue data...</div>
            </div>
          ) : error ? (
            <div style={{ 
              height: "320px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: "8px",
              color: "#ef4444"
            }}>
              Error: {error}
            </div>
          ) : (
            <div style={{ height: "320px" }}>
              <ResponsiveContainer width="100%" height="100%">
                {activeChart === 'bar' ? (
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fill: colors.lightText }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    />
                    <YAxis 
                      tick={{ fill: colors.lightText }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: colors.cardBackground,
                        border: `1px solid ${colors.tealAccent}`,
                        borderRadius: '6px',
                        color: colors.lightText
                      }}
                      formatter={(value) => [formatCurrency(value), 'Revenue']}
                    />
                    <Legend />
                    <Bar 
                      dataKey="revenue" 
                      name="Revenue" 
                      fill={colors.tealAccent}
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
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CHART_COLORS[index % CHART_COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value), 'Revenue']}
                      contentStyle={{
                        backgroundColor: colors.cardBackground,
                        border: `1px solid ${colors.tealAccent}`,
                        borderRadius: '6px',
                        color: colors.lightText
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
        <div style={{
          backgroundColor: colors.cardBackground,
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
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
              color: colors.lightText,
              display: "flex",
              alignItems: "center"
            }}>
              <PieChartIcon style={{ marginRight: "8px" }} color={colors.yellowAccent} size={18} />
              Top Selling Medicines
            </h2>
            <div style={{ 
              fontSize: "0.875rem",
              color: colors.tealAccent
            }}>
              {topMedicines.length > 0 && `Total Sold: ${topMedicines.reduce((sum, med) => sum + med.value, 0).toLocaleString()} units`}
            </div>
          </div>
          <div style={{ height: "320px" }}>
            {isLoading ? (
              <div style={{ 
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "8px"
              }}>
                <div style={{ color: colors.tealAccent }}>Loading medicine data...</div>
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
                      backgroundColor: colors.cardBackground,
                      border: `1px solid ${colors.tealAccent}`,
                      borderRadius: '6px',
                      color: colors.lightText
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ 
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "8px"
              }}>
                <div style={{ color: colors.tealAccent }}>No sales data available</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}