export const PRODUCT = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Product 1',
  price: 100000,
}

export const QUANTITY = 10;

export const INVENTORY = {
  total_stock: 10,
  reserved_stock: 0,
}

export const ORDER = {
  id: '22222222-2222-2222-2222-222222222222',
  status: {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    CANCELLED: 'CANCELLED',
  },
  total_amount: 100,
};

export const USER = {
  id: '33333333-3333-3333-3333-333333333333',
  email: 'admin@example.com',
  password: 'admin',
  full_name: 'admin',
  role: 'USER',
};

export const PAYMENT = {
  id: '44444444-4444-4444-4444-444444444444',
}
