export default function ReportsSection() {
    return (
      <>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "16px" }}>Reports</h1>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "16px",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
              gridColumn: "span 2",
            }}
          >
            <h2 style={{ fontWeight: "600", marginBottom: "8px" }}>Monthly Revenue</h2>
            <div
              style={{
                height: "200px",
                backgroundColor: "#f3f4f6",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Chart Placeholder
            </div>
          </div>
          <div
            style={{
              backgroundColor: "white",
              padding: "16px",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
            }}
          >
            <h2 style={{ fontWeight: "600", marginBottom: "8px" }}>Key Metrics</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li style={{ padding: "8px 0", borderBottom: "1px solid #e5e7eb" }}>Total Users: 12,543</li>
              <li style={{ padding: "8px 0", borderBottom: "1px solid #e5e7eb" }}>Total Medicine: 8,354</li>
              <li style={{ padding: "8px 0", borderBottom: "1px solid #e5e7eb" }}>Revenue: $45,234</li>
              
            </ul>
          </div>
          <div
            style={{
              backgroundColor: "white",
              padding: "16px",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
              gridColumn: "span 3",
            }}
          >
            <h2 style={{ fontWeight: "600", marginBottom: "8px" }}>Traffic Sources</h2>
            <div
              style={{
                height: "200px",
                backgroundColor: "#f3f4f6",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Pie Chart Placeholder
            </div>
          </div>
        </div>
      </>
    )
  }
  
  