const mysql = require('mysql2/promise');

async function updateSchema() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'four_paws_ms',
    multipleStatements: true
  });

  try {
    // Create bills table first since it's referenced by others
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id INT PRIMARY KEY AUTO_INCREMENT,
        customerName VARCHAR(100) NOT NULL,
        customerPhone VARCHAR(20),
        petDetails TEXT,
        total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        discount DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
        amountPaid DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        status ENUM('PENDING', 'COMPLETED', 'CANCELLED') DEFAULT 'COMPLETED',
        createdBy INT,
        FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('Bills table created or already exists');

    // Create bill_items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bill_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        bill_id INT NOT NULL,
        medicine_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
        FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE RESTRICT
      )
    `);
    console.log('Bill items table created or already exists');

    // Check if changed_by column exists in sales table before adding
    const [columns] = await connection.query('SHOW COLUMNS FROM sales');
    const columnNames = columns.map(col => col.Field);

    // Check if bill_id exists and remove it if it does
    if (columnNames.includes('bill_id')) {
      // Drop the foreign key constraint first
      const [foreignKeys] = await connection.query(`
        SELECT CONSTRAINT_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = 'four_paws_ms'
        AND TABLE_NAME = 'sales'
        AND COLUMN_NAME = 'bill_id'
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `);

      if (foreignKeys.length > 0) {
        await connection.query(`ALTER TABLE sales DROP FOREIGN KEY ${foreignKeys[0].CONSTRAINT_NAME}`);
      }
      
      // Then drop the column
      await connection.query('ALTER TABLE sales DROP COLUMN bill_id');
      console.log('Removed bill_id from sales table');
    }

    if (!columnNames.includes('changed_by')) {
      await connection.query('ALTER TABLE sales ADD COLUMN changed_by INT');
      await connection.query('ALTER TABLE sales ADD FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL');
      console.log('Added changed_by to sales table');
    }

    // Create indexes
    await connection.query(`
      CREATE INDEX IF NOT EXISTS idx_bills_customer ON bills(customerName, customerPhone);
      CREATE INDEX IF NOT EXISTS idx_bills_date ON bills(createdAt);
      CREATE INDEX IF NOT EXISTS idx_bill_items_bill ON bill_items(bill_id);
      CREATE INDEX IF NOT EXISTS idx_bill_items_medicine ON bill_items(medicine_id);
      CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(changed_at);
    `);
    console.log('Indexes created or already exist');

    console.log('Database schema updated successfully!');
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    await connection.end();
  }
}

updateSchema().catch(console.error); 