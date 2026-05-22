export const createProductSchema = {
  body: {
    type: 'object',
    required: ['name', 'price'],
    properties: {
      name: { type: 'string' },
      price: { type: 'number' },
      stock: { type: 'number' },
    },
  },
};
