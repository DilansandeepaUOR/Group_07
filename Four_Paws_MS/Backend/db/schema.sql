-- First, modify the sales table to add bill_id and changed_by
ALTER TABLE sales
ADD COLUMN bill_id INT,
ADD COLUMN changed_by INT,
ADD FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE SET NULL,
ADD FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL;

-- Create bills table
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
);

-- Create bill_items table
CREATE TABLE IF NOT EXISTS bill_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bill_id INT NOT NULL,
    medicine_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE RESTRICT
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bills_customer ON bills(customerName, customerPhone);
CREATE INDEX IF NOT EXISTS idx_bills_date ON bills(createdAt);
CREATE INDEX IF NOT EXISTS idx_bill_items_bill ON bill_items(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_items_medicine ON bill_items(medicine_id);
CREATE INDEX IF NOT EXISTS idx_sales_bill ON sales(bill_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(changed_at); 