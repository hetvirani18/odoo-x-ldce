import { z } from 'zod';

export const createTripSchema = z.object({
    name: z.string().min(1, 'Trip name is required').max(100),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    description: z.string().max(1000).optional().nullable(),
    cover_photo_url: z.string().url('Invalid URL').optional().nullable(),
    is_public: z.boolean().optional().default(false),
}).refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
    message: 'End date must be on or after start date',
    path: ['end_date'],
});

export const updateTripSchema = z.object({
    name: z.string().min(1, 'Trip name is required').max(100).optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    description: z.string().max(1000).optional().nullable(),
    cover_photo_url: z.string().url('Invalid URL').optional().nullable(),
    is_public: z.boolean().optional(),
});
