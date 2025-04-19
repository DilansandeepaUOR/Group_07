const express = require("express");
const router = express.Router();
const db = require("../../db");
const upload=require("../../validations/imgvalidator");
const QRCode = require('qrcode');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  next();
});


//Manage products
router.post("/addproduct", upload.single("image") ,async (req, res) => {
  const {
    name,
    category_id,
    brand,
    description,
    quantity_in_stock,
    unit_price,
    supplier_id,
  } = req.body;

  const imagePath = req.file ? `/uploads/productpics/${req.file.filename}` : null;

  try {
    //existance of product
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
          "INSERT INTO pet_products (name, category_id, brand, description, quantity_in_stock, unit_price, supplier_id, product_image) VALUES (?, ?, ?, ?, ?,?,?,?)";

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
            imagePath
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
  const productsql = "SELECT p.*, c.category_name, s.name AS supplier_name FROM pet_products p LEFT JOIN pet_categories c ON p.category_id = c.category_id LEFT JOIN pet_suppliers s ON p.supplier_id = s.supplier_id;";
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

router.put("/productupdate", upload.single("image") ,async (req, res) => {
  const { product_id } = req.query;

  console.log("ID:", product_id); // Log the ID to check if it's being received correctly
  console.log("Request Body:", req.body); // Log the request body to check the data being sent

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
        status,
        oldImage
      } = req.body;
      const imagePath = req.file ? `/uploads/productpics/${req.file.filename}` : oldImage;
    const productsql =
      "UPDATE pet_products SET name = ?, category_id = ?, brand = ?, description = ?, quantity_in_stock = ?, unit_price = ?, supplier_id = ?, status = ?, product_image = ? WHERE product_id = ?";

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
        imagePath,
        product_id,
        
      ],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Error inserting product" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Product not found" });
        }
        res.status(200).json({ message: "Product updated successfully" });
      }
    );
    
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

  const productsql = "DELETE FROM pet_products WHERE product_id=?";
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




//Manage categories
router.post("/addcategory", async (req, res) => {
  const {
    category_name,
  } = req.body;

  try {
    //existance of category
    db.query(
      "SELECT * FROM pet_categories WHERE category_name = ?",
      [category_name],
      async (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Database error" });
        }

        if (results.length > 0) {
          return res.status(409).json({ error: "Category already exists" });
        }
        const categorysql =
          "INSERT INTO pet_categories (category_name) VALUES (?)";

        db.query(
          categorysql,
          [
            category_name,
          ],
          (err, result) => {
            if (err) {
              return res
                .status(500)
                .json({ error: "Error inserting Category" });
            }

            if (result.affectedRows === 0) {
              return res.status(404).json({ error: "Category not found!" });
            }

            res.status(201).json({ message: "Category added successfully" });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/categories", async (req, res) => {
  const categorysql = "SELECT * FROM pet_categories";
  try {
    db.query(categorysql, (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Error retrieving Categories" });
      }

      //console.log("Database results:", results);

      if (results.length === 0) {
        return res.status(404).json({ error: "No Categories Found" });
      }

      res.json(results);
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Error retrieving Category" });
  }
});

router.put("/categoryupdate", async (req, res) => {
  const { category_id } = req.body;

  //console.log("ID:", Category_id); // Log the ID to check if it's being received correctly
  //console.log("Request Body:", req.body); // Log the request body to check the data being sent

  if (!category_id) {
    return res.status(400).json({ error: "ID query parameter is required" });
  }

  try {
    const {
      category_name,
        status
      } = req.body;
    const categorysql =
      "UPDATE pet_categories SET category_name = ?, status = ? WHERE category_id = ?";

    db.query(
      categorysql,
      [
        category_name,
        status,
        category_id,
      ],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Error inserting Category" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Category not found" });
        }
      }
    );
    res.status(200).json({ message: "Category updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Error updating Category" });
  }
});

router.delete("/categorydelete", async (req, res) => {
  const { category_id } = req.query;

  if (!category_id) {
    return res.status(400).json({ error: "ID query parameter is required" });
  }

  const categorysql = "DELETE FROM pet_categories WHERE category_id=?";
  try {
    db.query(categorysql, [category_id], (error, result) => {
      if (error) {
        res.status(500).json({ message: "Error deleting category!" });
      }
    });

    res.status(200).json({ message: "category Deleted!!" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Error updating category" });
  }
});





//Manage suppliers
router.post("/addsupplier", async (req, res) => {
  const {
    name,
    contact_info,
    address,
  } = req.body;

  try {
    //existance of product
    db.query(
      "SELECT * FROM pet_suppliers WHERE name = ?",
      [name],
      async (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Database error" });
        }

        if (results.length > 0) {
          return res.status(409).json({ error: "Supplier already exists" });
        }
        const suppliersql =
          "INSERT INTO pet_suppliers (name, contact_info, address) VALUES ( ?,?,?)";

        db.query(
          suppliersql,
          [
            name,
            contact_info,
            address
          ],
          (err, result) => {
            if (err) {
              return res
                .status(500)
                .json({ error: "Error inserting supplier" });
            }

            if (result.affectedRows === 0) {
              return res.status(404).json({ error: "supplier not found!" });
            }

            res.status(201).json({ message: "supplier added successfully" });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/suppliers", async (req, res) => {
  const suppliersql = "SELECT * FROM pet_suppliers";
  try {
    db.query(suppliersql, (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Error retrieving suppliers" });
      }

      //console.log("Database results:", results);

      if (results.length === 0) {
        return res.status(404).json({ error: "No suppliers Found" });
      }

      res.json(results);
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Error retrieving suppliers" });
  }
});

router.put("/supplierupdate", async (req, res) => {
  const { supplier_id } = req.body;

 // console.log("ID:", supplier_id); // Log the ID to check if it's being received correctly
 // console.log("Request Body:", req.body); // Log the request body to check the data being sent

  if (!supplier_id) {
    return res.status(400).json({ error: "ID query parameter is required" });
  }

  try {
    const {
        name,
        contact_info,
        address,
        status
      } = req.body;
    const suppliersql =
      "UPDATE pet_suppliers SET name = ?, contact_info =?, address = ?, status = ? WHERE supplier_id = ?";

    db.query(
      suppliersql,
      [
        name,
        contact_info,
        address,
        status,
        supplier_id,  
      ],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Error inserting supplier" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "supplier not found" });
        }
        res.status(200).json({ message: "supplier updated successfully" });
      }
    );
    
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Error updating supplier" });
  }
});

router.delete("/supplierdelete", async (req, res) => {
  const { supplier_id } = req.query;

  if (!supplier_id) {
    return res.status(400).json({ error: "ID query parameter is required" });
  }

  const suppliersql = "DELETE FROM pet_suppliers WHERE supplier_id=?";
  try {
    db.query(suppliersql, [supplier_id], (error, result) => {
      if (error) {
        res.status(500).json({ message: "Error deleting supplier!" });
      }
    });

    res.status(200).json({ message: "supplier Deleted!!" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Error updating supplier" });
  }
});

module.exports = router;
