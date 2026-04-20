INSERT INTO products(name, price, stock, description)
SELECT
    'Product ' || i,
    (random() * 1000)::numeric(10,2),
    (random() * 50)::int,
    'Demo product ' || i
FROM generate_series(1, 100) AS s(i);
