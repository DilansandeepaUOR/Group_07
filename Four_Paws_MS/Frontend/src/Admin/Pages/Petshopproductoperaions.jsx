import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ProductOperations = () => {
  const { id } = useParams(); // get product_id from URL
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/adminpetshop/productsqr/${id}`
        );
        setProduct(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
      <img
        src={`http://localhost:3001${product.product_image}`}
        alt={product.name}
        className="w-48 h-48 object-cover mb-4"
      />
      <p><strong>Brand:</strong> {product.brand}</p>
      <p><strong>Category:</strong> {product.category_name}</p>
      <p><strong>Supplier:</strong> {product.supplier_name}</p>
      <p><strong>Quantity:</strong> {product.quantity_in_stock}</p>
      <p><strong>Price:</strong> Rs. {product.unit_price}</p>
      <p><strong>Description:</strong> {product.description}</p>
      <p><strong>Status:</strong> {product.status}</p>
    </div>
  );
};

export default ProductOperations;