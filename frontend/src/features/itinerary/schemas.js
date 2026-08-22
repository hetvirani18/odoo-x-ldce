import { z } from 'zod';

export const createStopSchema = z.object({
    city_id: z.number({ required_error: 'City is required' }),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    order_index: z.number().int().optional(),
}).refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
    message: 'End date must be on or after start date',
    path: ['end_date'],
});

export const updateStopSchema = z.object({
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    order_index: z.number().int().optional(),
    city_id: z.number().optional(),
});

export const addActivitySchema = z.object({
    activity_id: z.number({ required_error: 'Activity is required' }),
    scheduled_date: z.string().min(1, 'Scheduled date is required'),
    scheduled_time: z.string().optional().nullable(),
});
