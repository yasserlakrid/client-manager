-- Create database tables for Client Manager
CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'coworker')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(50) PRIMARY KEY,
    account_id VARCHAR(50) NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) DEFAULT '',
    phone VARCHAR(255) DEFAULT '',
    company VARCHAR(255) DEFAULT '',
    status VARCHAR(50) DEFAULT 'Active',
    value NUMERIC DEFAULT 0,
    total_payment NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(50) PRIMARY KEY,
    client_id VARCHAR(50) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    date VARCHAR(50) NOT NULL,
    time VARCHAR(50) DEFAULT 'Flexible',
    treatment VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Scheduled'
);

CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(50) PRIMARY KEY,
    client_id VARCHAR(50) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    receipt_number VARCHAR(50) NOT NULL,
    amount NUMERIC NOT NULL,
    date VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Paid'
);

CREATE TABLE IF NOT EXISTS timeline (
    id VARCHAR(50) PRIMARY KEY,
    client_id VARCHAR(50) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    date VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS network (
    id VARCHAR(50) PRIMARY KEY,
    admin_id VARCHAR(50) NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    admin_name VARCHAR(255) NOT NULL,
    coworker_id VARCHAR(50) NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    coworker_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS admin_income (
    id VARCHAR(50) PRIMARY KEY,
    admin_id VARCHAR(50) NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    coworker_id VARCHAR(50) NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    coworker_name VARCHAR(255) NOT NULL,
    coworker_email VARCHAR(255) NOT NULL,
    total_income NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS admin_income_payments (
    id VARCHAR(50) PRIMARY KEY,
    admin_income_id VARCHAR(50) NOT NULL REFERENCES admin_income(id) ON DELETE CASCADE,
    date VARCHAR(50) NOT NULL,
    amount NUMERIC NOT NULL,
    client_id VARCHAR(50) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    receipt_number VARCHAR(50) NOT NULL,
    payment_id VARCHAR(50) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
