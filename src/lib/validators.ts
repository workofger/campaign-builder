import { z } from 'zod';

export const objectiveStepSchema = z.object({
  name: z.string().min(1, 'El nombre de la campaña es requerido'),
  objective: z.object({
    type: z.string(),
    label: z.string(),
  }).nullable().refine((val) => val !== null, 'Selecciona un objetivo'),
});

export const audienceStepSchema = z.object({
  audience: z.object({
    locations: z.array(z.string()).min(1, 'Selecciona al menos una ubicación'),
    vehicleTypes: z.array(z.string()).min(1, 'Selecciona al menos un tipo de vehículo'),
    ageRange: z.tuple([z.number().min(18), z.number().max(65)]).refine(
      ([min, max]) => min < max,
      'La edad mínima debe ser menor que la máxima'
    ),
    gender: z.enum(['all', 'male', 'female']),
    interests: z.array(z.string()),
  }),
});

export const budgetStepSchema = z.object({
  budget: z.object({
    type: z.enum(['daily', 'lifetime']),
    amount: z.number().min(50, 'El presupuesto mínimo es $50 MXN').max(1000000),
    startDate: z.string().min(1, 'La fecha de inicio es requerida'),
    endDate: z.string().min(1, 'La fecha de fin es requerida'),
    bidStrategy: z.enum(['lowest_cost', 'cost_cap', 'bid_cap']),
  }).refine(
    (b) => new Date(b.endDate) > new Date(b.startDate),
    'La fecha de fin debe ser posterior a la fecha de inicio'
  ),
});

export const creativeStepSchema = z.object({
  creative: z.object({
    headline: z.string().min(1, 'El headline es requerido'),
    primaryText: z.string().min(1, 'El texto principal es requerido'),
    cta: z.string(),
    format: z.string(),
    selectedImage: z.string().min(1, 'Selecciona una imagen').optional(),
  }),
});

export type ValidationErrors = string[];

export function validate(schema: z.ZodType, data: unknown): ValidationErrors {
  const result = schema.safeParse(data);
  if (result.success) return [];
  return result.error.issues.map((e) => e.message);
}
