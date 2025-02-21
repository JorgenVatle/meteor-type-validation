import * as v from 'valibot';

// Basic user schema
const UserSchema = v.object({
    id: v.string(),
    email: v.string(),
    username: v.string(),
    age: v.nullable(v.number()),
    isActive: v.boolean(),
    createdAt: v.number(),
});

// Address sub-schema
const AddressSchema = v.object({
    street: v.string(),
    city: v.string(),
    state: v.string(),
    postalCode: v.string(),
    country: v.string(),
});

// Role enumeration
const UserRoleSchema = v.picklist(['admin', 'user', 'guest']);

// Product schema with variants
const ProductVariantSchema = v.object({
    id: v.string(),
    sku: v.string(),
    color: v.string(),
    size: v.union([
        v.literal('XS'),
        v.literal('S'),
        v.literal('M'),
        v.literal('L'),
        v.literal('XL'),
    ]),
    stock: v.number(),
});

const ProductSchema = v.object({
    id: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    category: v.array(v.string()),
    variants: v.array(ProductVariantSchema),
    metadata: v.optional(v.object({
        tags: v.array(v.string()),
        featured: v.boolean(),
        searchKeywords: v.array(v.string()),
    })),
});

// Order schema combining multiple types
const OrderSchema = v.object({
    id: v.string(),
    user: UserSchema,
    items: v.array(v.object({
        product: ProductSchema,
        quantity: v.number(),
        priceAtTime: v.number(),
    })),
    shippingAddress: AddressSchema,
    billingAddress: AddressSchema,
    status: v.picklist(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
    paymentStatus: v.picklist(['pending', 'paid', 'failed', 'refunded']),
    total: v.number(),
    tax: v.number(),
    shipping: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
});

export type User = v.InferOutput<typeof UserSchema>;
export type Address = v.InferOutput<typeof AddressSchema>;
export type UserRole = v.InferOutput<typeof UserRoleSchema>;
export type ProductVariant = v.InferOutput<typeof ProductVariantSchema>;
export type Product = v.InferOutput<typeof ProductSchema>;
export type Order = v.InferOutput<typeof OrderSchema>;

export {
    UserSchema,
    AddressSchema,
    UserRoleSchema,
    ProductVariantSchema,
    ProductSchema,
    OrderSchema,
};