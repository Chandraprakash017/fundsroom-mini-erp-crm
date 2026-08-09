import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalCustomers = await prisma.customer.count();
    const totalProducts = await prisma.product.count();
    
    const products = await prisma.product.findMany({ select: { stock: true } });
    const currentStock = products.reduce((acc, product) => acc + product.stock, 0);

    const draftChallans = await prisma.challan.count({ where: { status: 'DRAFT' } });
    const confirmedChallans = await prisma.challan.count({ where: { status: 'CONFIRMED' } });

    res.status(200).json({
      totalCustomers,
      totalProducts,
      currentStock,
      draftChallans,
      confirmedChallans,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
