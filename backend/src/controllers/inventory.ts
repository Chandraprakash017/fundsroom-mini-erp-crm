import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const getInventoryLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.stockMovement.findMany({
      include: { product: { select: { name: true, sku: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory logs' });
  }
};

export const recordMovement = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, type, quantity } = req.body;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (type !== 'IN' && type !== 'OUT') return res.status(400).json({ error: 'Invalid movement type' });

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (type === 'OUT' && product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const movement = await prisma.$transaction(async (tx) => {
      const log = await tx.stockMovement.create({
        data: {
          productId,
          type,
          quantity,
          createdBy: userId,
        },
      });

      await tx.product.update({
        where: { id: productId },
        data: {
          stock: type === 'IN' ? product.stock + quantity : product.stock - quantity,
        },
      });

      return log;
    });

    res.status(201).json(movement);
  } catch (error) {
    res.status(500).json({ error: 'Failed to record stock movement' });
  }
};
