const express = require("express");
const router = express.Router();
const db = require("../../db");
const bcrypt = require("bcrypt");
const validEMPRegister = require("../../validations/adregvalidator");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  next();
});

router.post("/addproduct", async (req, res) => {
  const {
    name,
    category_id,
    brand,
    description,
    quantity_in_stock,
    unit_price,
    supplier_id,
  } = req.body;

  try {
    //existance of email
    db.query(
      "SELECT * FROM pet_products WHERE name = ?",
      [name],
      async (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Database error" });
        }

        if (results.length > 0) {
          return res.status(409).json({ error: "Product already exists" });
        }
        const productsql =
          "INSERT INTO pet_products (name, category_id, brand, description, quantity_in_stock, unit_price, supplier_id) VALUES (?, ?, ?, ?, ?,?,?)";

        db.query(
          productsql,
          [
            name,
            category_id,
            brand,
            description,
            quantity_in_stock,
            unit_price,
            supplier_id,
          ],
          (err, result) => {
            if (err) {
              return res
                .status(500)
                .json({ error: "Error inserting product" });
            }

            if (result.affectedRows === 0) {
              return res.status(404).json({ error: "product not found!" });
            }

            res.status(201).json({ message: "product added successfully" });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/products", async (req, res) => {
  const productsql = "SELECT * FROM pet_products";
  try {
    db.query(productsql, (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Error retrieving products" });
      }

      //console.log("Database results:", results);

      if (results.length === 0) {
        return res.status(404).json({ error: "No Products Found" });
      }

      res.json(results);
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Error retrieving product" });
  }
});

router.put("/productupdate", async (req, res) => {
  const { product_id } = req.body;

  //console.log("ID:", employee_id); // Log the ID to check if it's being received correctly
  //console.log("Request Body:", req.body); // Log the request body to check the data being sent

  if (!product_id) {
    return res.status(400).json({ error: "ID query parameter is required" });
  }

  try {
    const {
        name,
        category_id,
        brand,
        description,
        quantity_in_stock,
        unit_price,
        supplier_id,
        status
      } = req.body;
    const productsql =
      "UPDATE pet_products SET name = ?, category_id = ?, brand = ?, description = ?, quantity_in_stock = ?, unit_price = ?, supplier_id = ?, status = ? WHERE product_id = ?";

    db.query(
        productsql,
      [
        name,
        category_id,
        brand,
        description,
        quantity_in_stock,
        unit_price,
        supplier_id,
        status,
        product_id,
      ],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Error inserting product" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Product not found" });
        }
      }
    );
    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Error updating Product" });
  }
});

router.delete("/productdelete", async (req, res) => {
  const { product_id } = req.query;

  if (!product_id) {
    return res.status(400).json({ error: "ID query parameter is required" });
  }

  const productsql = "DELETE FROM employee WHERE employee_id=?";
  try {
    db.query(productsql, [product_id], (error, result) => {
      if (error) {
        res.status(500).json({ message: "Error deleting product!" });
      }
    });

    res.status(200).json({ message: "product Deleted!!" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Error updating product" });
  }
});

module.exports = router;
