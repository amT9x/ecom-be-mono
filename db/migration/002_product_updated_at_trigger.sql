-- =========================================
-- FUNCTION: auto update updated_at
-- =========================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = clock_timestamp();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =========================================
-- TRIGGER: products updated_at
-- =========================================
DROP TRIGGER IF EXISTS trg_products_updated_at ON products;

CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
