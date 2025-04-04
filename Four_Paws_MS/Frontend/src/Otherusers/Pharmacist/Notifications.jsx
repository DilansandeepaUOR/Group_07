export default function NotificationsSection() {
    const notifications = [
      {
        id: 1,
        title: "New Order Received",
        description: "Order #12345 has been placed and is awaiting processing.",
        time: "5 minutes ago",
        read: false,
      },
      {
        id: 2,
        title: "Payment Successful",
        description: "Payment for order #12342 has been successfully processed.",
        time: "1 hour ago",
        read: false,
      },
      {
        id: 3,
        title: "New User Registration",
        description: "A new user has registered on your platform.",
        time: "3 hours ago",
        read: true,
      },
      {
        id: 4,
        title: "Low Stock Alert",
        description: "Product 'Wireless Headphones' is running low on stock (5 remaining).",
        time: "5 hours ago",
        read: true,
      },
      {
        id: 5,
        title: "System Update",
        description: "The system will undergo maintenance on Sunday at 2:00 AM.",
        time: "1 day ago",
        read: true,
      },
      {
        id: 6,
        title: "New Feature Available",
        description: "Check out our new reporting dashboard with enhanced analytics.",
        time: "2 days ago",
        read: true,
      },
    ]
  
    return (
      <>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "16px" }}>Notifications</h1>
        <div
          style={{
            backgroundColor: "white",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", alignItems: "center" }}>
            <h2 style={{ fontWeight: "600" }}>Recent Notifications</h2>
            <button
              style={{
                backgroundColor: "#f3f4f6",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Mark all as read
            </button>
          </div>
          <div>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  padding: "12px",
                  borderBottom: "1px solid #e5e7eb",
                  backgroundColor: notification.read ? "transparent" : "#f3f4f6",
                  borderLeft: notification.read ? "none" : "3px solid #4f46e5",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <h3 style={{ fontWeight: "600", marginBottom: "4px" }}>{notification.title}</h3>
                  <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{notification.time}</span>
                </div>
                <p style={{ color: "#4b5563", marginBottom: "8px" }}>{notification.description}</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    style={{
                      backgroundColor: "#f9fafb",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      border: "1px solid #e5e7eb",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                    }}
                  >
                    View
                  </button>
                  {!notification.read && (
                    <button
                      style={{
                        backgroundColor: "#f9fafb",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        border: "1px solid #e5e7eb",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                      }}
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <button
              style={{
                backgroundColor: "#f9fafb",
                padding: "8px 16px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                cursor: "pointer",
              }}
            >
              Load more
            </button>
          </div>
        </div>
      </>
    )
  }
  
  