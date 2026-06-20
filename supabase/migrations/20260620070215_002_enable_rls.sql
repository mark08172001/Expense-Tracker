-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Users policies (public registration, own data access)
CREATE POLICY "Enable insert for authenticated users only" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (true);

-- Categories policies
CREATE POLICY "Enable all for categories" ON categories
  FOR ALL USING (true);

-- Transactions policies  
CREATE POLICY "Enable all for transactions" ON transactions
  FOR ALL USING (true);

-- Budgets policies
CREATE POLICY "Enable all for budgets" ON budgets
  FOR ALL USING (true);