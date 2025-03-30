"use client"

import { useState } from "react"

export default function ProductsSection() {
  const [activeTab, setActiveTab] = useState("medicine-list")
  const [searchTerm, setSearchTerm] = useState("")

  // Sample data
  const medicines = [
    { id: 1, name: "Paracetamol", category: "Pain Relief", price: "$5.99", stock: 145, status: "In Stock" },
    { id: 2, name: "Amoxicillin", category: "Antibiotics", price: "$12.99", stock: 78, status: "In Stock" },
    { id: 3, name: "Lisinopril", category: "Blood Pressure", price: "$8.49", stock: 30, status: "In Stock" },
    { id: 4, name: "Metformin", category: "Diabetes", price: "$7.99", stock: 0, status: "Out of Stock" },
    { id: 5, name: "Atorvastatin", category: "Cholesterol", price: "$15.99", stock: 15, status: "In Stock" },
    { id: 6, name: "Albuterol", category: "Respiratory", price: "$25.99", stock: 5, status: "Low Stock" },
  ]

  // Filter medicines based on search term
  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <style jsx>{`
        .container {
          padding: 1.5rem;
          background-color: #f9fafb;
        }
        
        .title {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 1.25rem;
        }
        
        .searchAddContainer {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          gap: 1rem;
        }
        
        .searchInput {
          flex: 1;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          max-width: 24rem;
        }
        
        .primaryButton {
          background-color: #4f46e5;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .primaryButton:hover {
          background-color: #4338ca;
        }
        
        .primaryButton:disabled {
          background-color: #c7d2fe;
          cursor: not-allowed;
          opacity: 0.7;
        }
        
        .tableWrapper {
          overflow-x: auto;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          background-color: white;
          padding: 1rem;
        }
        
        .medicineTable {
          width: 100%;
          border-collapse: collapse;
        }
        
        .medicineTable th {
          background-color: #f8fafc;
          padding: 0.75rem 1rem;
          text-align: left;
          font-weight: 600;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .medicineTable td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e2e8f0;
          color: #334155;
        }
        
        .statusBadge {
          padding: 0.25rem 0.5rem;
          border-radius: 0.75rem;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .inStock {
          background-color: #dcfce7;
          color: #166534;
        }
        
        .lowStock {
          background-color: #fef9c3;
          color: #854d0e;
        }
        
        .outOfStock {
          background-color: #fee2e2;
          color: #991b1b;
        }
        
        .actionButton {
          padding: 0.25rem 0.5rem;
          border: none;
          border-radius: 0.25rem;
          cursor: pointer;
          margin-right: 0.5rem;
        }
        
        .editButton {
          background-color: #e0f2fe;
          color: #0369a1;
        }
        
        .deleteButton {
          background-color: #fee2e2;
          color: #b91c1c;
        }
        
        .paginationContainer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1.25rem;
          color:rgb(59, 121, 207);
        }
        
        .paginationButtons {
          display: flex;
          gap: 0.5rem;
        }

        .paginationButton {
          background-color: #4f46e5;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .paginationButton:hover {
          background-color: #4338ca;
        }
      `}</style>

      <div className="container">
        <h1 className="title">List Of Medicine</h1>

        <div className="searchAddContainer">
          <input
            type="text"
            placeholder="Search medicines..."
            className="searchInput"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="primaryButton">Add Medicine</button>
        </div>

        <div className="tableWrapper">
          <table className="medicineTable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedicines.map((medicine) => (
                <tr key={medicine.id}>
                  <td>{medicine.id}</td>
                  <td>{medicine.name}</td>
                  <td>{medicine.category}</td>
                  <td>{medicine.price}</td>
                  <td>{medicine.stock}</td>
                  <td>
                    <span className={`statusBadge ${
                      medicine.status === "In Stock" ? 'inStock' :
                      medicine.status === "Low Stock" ? 'lowStock' :
                      'outOfStock'
                    }`}>
                      {medicine.status}
                    </span>
                  </td>
                  <td>
                    <button className="actionButton editButton">Edit</button>
                    <button className="actionButton deleteButton">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="paginationContainer">
          <div>Showing 1 to {filteredMedicines.length} of {filteredMedicines.length} entries</div>
          <div className="paginationButtons">
          <button className="primaryButton">Previous</button>
          <button className="primaryButton">Next</button>
          </div>
        </div>
      </div>
    </>
  )
}