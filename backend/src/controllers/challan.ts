import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const getChallans = async (req: Request, res: Response) => {
  try {
    const challans = await prisma.challan.findMany({
      include: {
        customer: { select: { name: true } },
        items: { include: { product: { select: { name: true, sku: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(challans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch challans' });
  }
};

export const createChallan = async (req: AuthRequest, res: Response) => {
  try {
    const { customerId, items } = req.body;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Generate challan number
    const count = await prisma.challan.count();
    const challanNumber = `CHL-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const challan = await prisma.challan.create({
      data: {
        challanNumber,
        customerId,
        createdBy: userId,
        status: 'DRAFT',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });

    res.status(201).json(challan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create challan' });
  }
};

export const confirmChallan = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const challan = await prisma.challan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!challan) return res.status(404).json({ error: 'Challan not found' });
    if (challan.status !== 'DRAFT') return res.status(400).json({ error: 'Only DRAFT challans can be confirmed' });

    await prisma.$transaction(async (tx) => {
      // Deduct stock and log movement
      for (const item of challan.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ID: ${item.productId}`);
        }

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: product.stock - item.quantity },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'OUT',
            quantity: item.quantity,
            createdBy: userId,
          },
        });
      }

      await tx.challan.update({
        where: { id },
        data: { status: 'CONFIRMED' },
      });
    });

    res.status(200).json({ message: 'Challan confirmed successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to confirm challan' });
  }
};

export const cancelChallan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const challan = await prisma.challan.findUnique({ where: { id } });

    if (!challan) return res.status(404).json({ error: 'Challan not found' });
    if (challan.status !== 'DRAFT') return res.status(400).json({ error: 'Only DRAFT challans can be cancelled' });

    await prisma.challan.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.status(200).json({ message: 'Challan cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel challan' });
  }
};
