import { prisma } from "../db.js";

export class StoreService {
  /**
   * Seed Standard Product Categories if empty
   */
  static async seedStandardCategories() {
    const count = await prisma.productCategory.count();
    if (count > 0) return;

    const categories = [
      { name: "Rudraksha", slug: "rudraksha", description: "Authentic Nepali and Indonesian beads from 1 to 21 Mukhi." },
      { name: "Gemstones", slug: "gemstones", description: "Natural, lab-certified Jyotish gemstones for planetary remediation." },
      { name: "Gemstone Rings", slug: "gemstone-rings", description: "Precious gold and silver rings consecrated per Vedic rituals." },
      { name: "Spiritual Bracelets", slug: "spiritual-bracelets", description: "Healing crystal and gemstone wrist wear for energy balance." },
      { name: "Rudraksha Mala", slug: "rudraksha-mala", description: "108+1 japa and kanti malas for meditation and spiritual elevation." },
      { name: "Crystal Products", slug: "crystal-products", description: "Quartz, amethyst, sphatik and selenite pyamids and figurines." },
      { name: "Yantra", slug: "yantra", description: "Sacred copper, brass and gold-plated geometric energy plates." },
      { name: "Kavach", slug: "kavach", description: "Protective talismans and energized pendants." },
      { name: "Puja Samagri", slug: "puja-samagri", description: "Pure cow ghee, camphor, havan herbs, roli, chandan and gangajal." },
      { name: "Religious Idols", slug: "religious-idols", description: "Ashtadhatu, brass, marble and panchdhatu murtis of deities." },
      { name: "Spiritual Books", slug: "spiritual-books", description: "Vedic scriptures, Upanishads, Bhagavad Gita, and astrological classics." },
      { name: "Incense and Dhoop", slug: "incense-and-dhoop", description: "Natural organic agarbatti, guggul, loban and herbal dhoop cones." },
      { name: "Brass Puja Accessories", slug: "brass-puja-accessories", description: "Panchpatra, achamani, ghanti, shankha stand and thalis." },
      { name: "Diya and Lamps", slug: "diya-and-lamps", description: "Akhand jyot diyas, brass deepams, and festive oil lamps." },
      { name: "Spiritual Gift Hampers", slug: "spiritual-gift-hampers", description: "Festive and auspicious celebration collections." },
      { name: "Festival Products", slug: "festival-products", description: "Exclusive seasonal festival items and decorative essentials." }
    ];

    for (let i = 0; i < categories.length; i++) {
      const c = categories[i];
      await prisma.productCategory.upsert({
        where: { slug: c.slug },
        update: {},
        create: {
          name: c.name,
          slug: c.slug,
          description: c.description,
          displayOrder: i + 1,
          isActive: true
        }
      });
    }
  }

  /**
   * List Products with Filtering & Sorting
   */
  static async listProducts(query: {
    categorySlug?: string;
    search?: string;
    material?: string;
    minPricePaise?: bigint;
    maxPricePaise?: bigint;
    isFeatured?: boolean;
    sort?: "price_asc" | "price_desc" | "newest" | "popularity";
    limit?: number;
    offset?: number;
  }) {
    const where: any = { isActive: true };

    if (query.categorySlug) {
      where.category = { slug: query.categorySlug };
    }
    if (query.material) {
      where.material = query.material;
    }
    if (query.isFeatured !== undefined) {
      where.isFeatured = query.isFeatured;
    }
    if (query.minPricePaise !== undefined || query.maxPricePaise !== undefined) {
      where.salePricePaise = {};
      if (query.minPricePaise !== undefined) where.salePricePaise.gte = query.minPricePaise;
      if (query.maxPricePaise !== undefined) where.salePricePaise.lte = query.maxPricePaise;
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { shortDescription: { contains: query.search } },
        { sku: { contains: query.search } }
      ];
    }

    let orderBy: any = { createdAt: "desc" };
    if (query.sort === "price_asc") orderBy = { salePricePaise: "asc" };
    if (query.sort === "price_desc") orderBy = { salePricePaise: "desc" };

    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        take: query.limit || 20,
        skip: query.offset || 0,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          variants: { where: { isActive: true } }
        }
      })
    ]);

    return { total, items };
  }

  /**
   * Get Product Details by Slug or ID
   */
  static async getProductDetails(identifier: string) {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
        isActive: true
      },
      include: {
        category: true,
        variants: { where: { isActive: true } },
        reviews: {
          where: { isApproved: true },
          take: 10,
          orderBy: { createdAt: "desc" },
          include: { customer: { select: { fullName: true } } }
        }
      }
    });
    return product;
  }

  /**
   * Cart: Get or Create Customer Cart
   */
  static async getCart(customerId: string) {
    let cart = await prisma.cart.findUnique({
      where: { customerId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true, coverImageUrl: true, salePricePaise: true, stockQuantity: true } },
            variant: { select: { id: true, title: true, salePricePaise: true, stockQuantity: true } }
          }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { customerId },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, slug: true, coverImageUrl: true, salePricePaise: true, stockQuantity: true } },
              variant: { select: { id: true, title: true, salePricePaise: true, stockQuantity: true } }
            }
          }
        }
      });
    }

    const itemCount = cart.items.reduce((acc: number, it: any) => acc + it.quantity, 0);
    const subtotalPaise = cart.items.reduce((acc: bigint, it: any) => {
      const p = it.product.salePricePaise > 0n ? it.product.salePricePaise : it.product.regularPricePaise || 0n;
      return acc + (p * BigInt(it.quantity));
    }, 0n);

    return {
      ...cart,
      itemCount,
      subtotalPaise: subtotalPaise.toString(),
      subtotalInr: (Number(subtotalPaise) / 100).toFixed(2)
    };
  }

  /**
   * Cart: Add Item to Cart
   */
  static async addToCart(customerId: string, productId: string, quantity = 1, variantId?: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) throw new Error("PRODUCT_NOT_FOUND");

    const cart = await this.getCart(customerId);
    const existing = cart.items.find((item: any) => item.productId === productId && item.variantId === (variantId || null));

    const pricePaise = product.salePricePaise > 0n ? product.salePricePaise : product.regularPricePaise;

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId,
          quantity,
          pricePaiseAtAdd: pricePaise
        }
      });
    }

    return this.getCart(customerId);
  }

  /**
   * Cart: Update or Remove Cart Item
   */
  static async updateCartItem(cartItemId: string, quantity: number) {
    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: cartItemId } });
    } else {
      await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity }
      });
    }
  }

  /**
   * Checkout & Create Store Order with Atomic Stock Reservation
   */
  static async createOrder(params: {
    customerId: string;
    items: Array<{ productId: string; variantId?: string; quantity: number }>;
    shippingAddress: { fullName: string; phone: string; addressLine1: string; city: string; state: string; pincode: string };
    billingAddress?: any;
    couponCode?: string;
  }) {
    if (!params.items || params.items.length === 0) {
      throw new Error("CART_EMPTY");
    }

    const orderNumber = `NA-ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

    return prisma.$transaction(async (tx: any) => {
      let subtotalPaise = 0n;
      let taxAmountPaise = 0n;
      const orderItemsData: any[] = [];

      for (const it of params.items) {
        const product = await tx.product.findUnique({ where: { id: it.productId } });
        if (!product || !product.isActive) {
          throw new Error(`PRODUCT_UNAVAILABLE_${it.productId}`);
        }

        // Check and reserve stock atomically
        if (product.stockQuantity < it.quantity) {
          throw new Error(`INSUFFICIENT_STOCK_${product.name}`);
        }

        // Decrement stock, increment reserved
        await tx.product.update({
          where: { id: product.id },
          data: { stockQuantity: { decrement: it.quantity } }
        });

        // Record inventory movement
        await tx.inventoryMovement.create({
          data: {
            productId: product.id,
            variantId: it.variantId,
            type: "RESERVE",
            quantity: it.quantity,
            reason: `Order ${orderNumber} stock reservation`
          }
        });

        const itemPrice = product.salePricePaise > 0n ? product.salePricePaise : product.regularPricePaise;
        const lineTotal = itemPrice * BigInt(it.quantity);
        const lineTax = (lineTotal * BigInt(product.taxRateBps || 1800)) / 10000n;

        subtotalPaise += lineTotal;
        taxAmountPaise += lineTax;

        orderItemsData.push({
          productId: product.id,
          variantId: it.variantId,
          productName: product.name,
          sku: product.sku,
          pricePaise: itemPrice,
          quantity: it.quantity,
          taxAmountPaise: lineTax,
          totalPaise: lineTotal + lineTax
        });
      }

      // Shipping calculation: Free over ₹999, else ₹99
      const shippingAmountPaise = subtotalPaise >= 99900n ? 0n : 9900n;
      const totalAmountPaise = subtotalPaise + taxAmountPaise + shippingAmountPaise;

      const order = await tx.storeOrder.create({
        data: {
          orderNumber,
          customerId: params.customerId,
          status: "CONFIRMED", // Order placed
          subtotalPaise,
          taxAmountPaise,
          shippingAmountPaise,
          discountAmountPaise: 0n,
          totalAmountPaise,
          shippingAddressJson: params.shippingAddress as any,
          billingAddressJson: (params.billingAddress || params.shippingAddress) as any,
          couponCode: params.couponCode,
          items: {
            create: orderItemsData
          }
        },
        include: { items: true }
      });

      // Clear customer's cart
      const cart = await tx.cart.findUnique({ where: { customerId: params.customerId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      return order;
    });
  }

  /**
   * Update Order Shipment & Tracking
   */
  static async updateShipment(orderId: string, params: {
    status: "PROCESSING" | "PACKED" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
    shippingProvider?: string;
    awbNumber?: string;
    trackingUrl?: string;
  }) {
    return prisma.storeOrder.update({
      where: { id: orderId },
      data: {
        status: params.status,
        shippingProvider: params.shippingProvider,
        awbNumber: params.awbNumber,
        trackingUrl: params.trackingUrl
      }
    });
  }

  /**
   * Create Return or Exchange Request
   */
  static async createReturnRequest(params: {
    orderId: string;
    orderItemId?: string;
    customerId: string;
    type: "RETURN" | "EXCHANGE";
    reason: string;
    evidenceImages?: string[];
  }) {
    const order = await prisma.storeOrder.findUnique({
      where: { id: params.orderId },
      include: { items: true }
    });
    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (order.customerId !== params.customerId) throw new Error("UNAUTHORIZED");

    return prisma.productReturnRequest.create({
      data: {
        orderId: params.orderId,
        orderItemId: params.orderItemId,
        customerId: params.customerId,
        type: params.type,
        reason: params.reason,
        evidenceImagesJson: params.evidenceImages as any,
        status: "REQUESTED",
        refundAmountPaise: order.totalAmountPaise
      }
    });
  }
}
