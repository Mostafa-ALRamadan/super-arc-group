import { z } from 'zod';

export const createContactSchema = (t: (key: string, params?: any) => string) => z.object({
  name: z.string()
    .min(2, t('form.minLength', { min: 2 }))
    .refine((val) => val.trim().length > 0, t('form.required')),
  email: z.string()
    .email(t('form.invalidEmail'))
    .refine((val) => val.trim().length > 0, t('form.required')),
  phone: z.string()
    .min(6, t('form.minLength', { min: 6 }))
    .refine((val) => val.trim().length > 0, t('form.required')),
  subject: z.string()
    .min(3, t('form.minLength', { min: 3 }))
    .refine((val) => val.trim().length > 0, t('form.required')),
  message: z.string()
    .min(10, t('form.minLength', { min: 10 }))
    .refine((val) => val.trim().length > 0, t('form.required')),
});

export type ContactFormData = z.infer<ReturnType<typeof createContactSchema>>;
