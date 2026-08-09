import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({
      include: { notes: true },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { notes: true },
    });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, company } = req.body;
    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const customer = await prisma.customer.create({
      data: { name, email, phone, company },
    });
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, company } = req.body;
    const customer = await prisma.customer.update({
      where: { id },
      data: { name, email, phone, company },
    });
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.followUpNote.deleteMany({ where: { customerId: id } });
    await prisma.customer.delete({ where: { id } });
    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};

export const addFollowUpNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const note = await prisma.followUpNote.create({
      data: { content, customerId: id },
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add follow-up note' });
  }
};
