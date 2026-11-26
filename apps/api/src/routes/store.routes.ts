import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { StoreService } from "../services/store.service.js";
import { prisma } from "../db.js";

export const storeRouter = Router();

// 1. Get Product Categories
storeRouter.get("/categories", async (req: Request, res: Response) => {
  try {
    await StoreService.seedStandardCategories();
    const categories = await prisma.productCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      include: { _count: { select: { products: true } } }
    });
    res.json({ success: true, data: categories });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. List Products with Filtering & Sorting
storeRouter.get("/products", async (req: Request, res: Response) => {
  try {
    const { category, search, material, minPrice, maxPrice, sort, limit, offset } = req.query;
    const result = await StoreService.listProducts({
      categorySlug: category as string,
      search: search as string,
      material: material as string,
      minPricePaise: minPrice ? BigInt(Number(minPrice) * 100) : undefined,
      maxPricePaise: maxPrice ? BigInt(Number(maxPrice) * 100) : undefined,
      sort: sort as any,
      limit: limit ? Number(limit) : 24,
      offset: offset ? Number(offset) : 0
    });

    res.json({ success: true, data: result.items, total: result.total });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Get Product Details by Slug or ID
storeRouter.get("/products/:slug", async (req: Request, res: Response) => {
  try {
    const product = await StoreService.getProductDetails(req.params.slug as string);
    if (!product) {
      return res.status(404).json({ success: false, error: "PRODUCT_NOT_FOUND" });
    }
    res.json({ success: true, data: product });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Get Customer Cart
storeRouter.get("/cart", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId || (req as any).user.id;
    const cart = await StoreService.getCart(userId);
    res.json({ success: true, data: cart });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Add Item to Cart
storeRouter.post("/cart/add", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId || (req as any).user.id;
    const { productId, quantity, variantId } = req.body;
    if (!productId) return res.status(400).json({ success: false, error: "PRODUCT_ID_REQUIRED" });

    const cart = await StoreService.addToCart(userId, productId, Number(quantity) || 1, variantId);
    res.json({ success: true, data: cart });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 6. Update Cart Item Quantity
storeRouter.patch("/cart/items/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { quantity } = req.body;
    await StoreService.updateCartItem(req.params.id as string, Number(quantity) || 0);
    const userId = (req as any).user.userId || (req as any).user.id;
    const cart = await StoreService.getCart(userId);
    res.json({ success: true, data: cart });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 7. Checkout & Create Order
storeRouter.post("/orders", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId || (req as any).user.id;
    const { items, shippingAddress, billingAddress, couponCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: "ITEMS_REQUIRED" });
    }
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.pincode) {
      return res.status(400).json({ success: false, error: "SHIPPING_ADDRESS_INCOMPLETE" });
    }

    const order = await StoreService.createOrder({
      customerId: userId,
      items,
      shippingAddress,
      billingAddress,
      couponCode
    });

    res.status(201).json({ success: true, data: order });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 8. Get Customer Orders
storeRouter.get("/my-orders", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId || (req as any).user.id;
    const orders = await prisma.storeOrder.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true, coverImageUrl: true } }
          }
        }
      }
    });

    res.json({ success: true, data: orders });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Get Specific Order Details
storeRouter.get("/orders/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId || (req as any).user.id;
    const userRole = (req as any).user.role;

    const order = await prisma.storeOrder.findUnique({
      where: { id: req.params.id as string },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true, coverImageUrl: true } }
          }
        },
        returns: true
      }
    });

    if (!order) return res.status(404).json({ success: false, error: "ORDER_NOT_FOUND" });
    if (order.customerId !== userId && userRole !== "SUPER_ADMIN") {
      return res.status(403).json({ success: false, error: "FORBIDDEN" });
    }

    res.json({ success: true, data: order });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Request Return or Exchange
storeRouter.post("/orders/:id/return", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId || (req as any).user.id;
    const { orderItemId, type, reason, evidenceImages } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, error: "REASON_REQUIRED" });
    }

    const returnReq = await StoreService.createReturnRequest({
      orderId: req.params.id as string,
      orderItemId,
      customerId: userId,
      type: type || "RETURN",
      reason,
      evidenceImages
    });

    res.status(201).json({ success: true, data: returnReq });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
