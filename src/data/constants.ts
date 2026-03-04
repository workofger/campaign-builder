import type { CampaignObjective, CampaignConfig } from '@/types/campaign';

export const LOGO_BASE = 'https://lrzcturtxtzhdzqacefy.supabase.co/storage/v1/object/public/Imagenes/';
export const LOGOS = {
  fullColor: `${LOGO_BASE}FULL,%20COLOR@2x.png`,
  fullBicolor: `${LOGO_BASE}FULL,%20BICOLOR@2x.png`,
  fullBlack: `${LOGO_BASE}FULL,%20NEG@2x.png`,
  isoYellow: `${LOGO_BASE}ISO,%20COLOR@2x.png`,
  isoBlack: `${LOGO_BASE}ISO,%20NEG@2x.png`,
} as const;

export const OBJECTIVES: CampaignObjective[] = [
  {
    type: 'driver_recruitment',
    label: 'Reclutamiento de conductores',
    description: 'Atrae nuevos conductores independientes para unirse a la plataforma Partrunner.',
    icon: '🚗',
    recommendedBudget: 500,
    recommendedDuration: 14,
  },
  {
    type: 'fleet_acquisition',
    label: 'Adquisición de flotillas',
    description: 'Conecta con dueños de flotillas para partnerships de transporte empresarial.',
    icon: '🚛',
    recommendedBudget: 1000,
    recommendedDuration: 30,
  },
  {
    type: 'reactivation',
    label: 'Reactivación',
    description: 'Recupera conductores inactivos con ofertas especiales y nuevas oportunidades.',
    icon: '🔄',
    recommendedBudget: 300,
    recommendedDuration: 7,
  },
  {
    type: 'brand_awareness',
    label: 'Brand awareness',
    description: 'Aumenta el reconocimiento de marca Partrunner en mercados objetivo.',
    icon: '⭐',
    recommendedBudget: 800,
    recommendedDuration: 21,
  },
];

export const MEXICAN_STATES = [
  'CDMX', 'Estado de México', 'Jalisco', 'Nuevo León', 'Puebla',
  'Guanajuato', 'Querétaro', 'Veracruz', 'Chihuahua', 'Baja California',
  'Sonora', 'Coahuila', 'Tamaulipas', 'Michoacán', 'Aguascalientes',
  'San Luis Potosí', 'Hidalgo', 'Morelos', 'Tabasco', 'Yucatán',
  'Quintana Roo', 'Sinaloa', 'Oaxaca', 'Guerrero', 'Chiapas',
  'Durango', 'Zacatecas', 'Nayarit', 'Tlaxcala', 'Campeche',
  'Colima', 'Baja California Sur',
];

export const VEHICLE_TYPES = ['Moto', 'Sedan', 'Van', 'Camión', 'Rabón', 'Tortón', 'Tráiler'];

export const INTERESTS = [
  'Logística', 'Entregas a domicilio', 'Conducción', 'Trabajo independiente',
  'Transporte de carga', 'Mudanzas', 'Última milla', 'E-commerce',
  'Emprendimiento', 'Ingresos extra',
];

export const CTA_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'apply_now', label: 'Aplicar ahora' },
  { value: 'learn_more', label: 'Más información' },
  { value: 'sign_up', label: 'Registrarse' },
  { value: 'contact_us', label: 'Contáctanos' },
  { value: 'send_whatsapp', label: 'Enviar WhatsApp' },
];

export const WIZARD_STEPS = [
  { key: 'objective' as const, label: 'Objetivo', number: 1 },
  { key: 'audience' as const, label: 'Audiencia', number: 2 },
  { key: 'budget' as const, label: 'Presupuesto', number: 3 },
  { key: 'creative' as const, label: 'Creativo', number: 4 },
  { key: 'review' as const, label: 'Revisión', number: 5 },
];

export function createDefaultConfig(): CampaignConfig {
  return {
    id: crypto.randomUUID(),
    name: '',
    objective: null,
    audience: {
      locations: [],
      vehicleTypes: [],
      ageRange: [21, 55],
      gender: 'all',
      interests: [],
    },
    budget: {
      type: 'daily',
      amount: 500,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      bidStrategy: 'lowest_cost',
    },
    creative: {
      headline: '',
      primaryText: '',
      description: '',
      cta: 'apply_now',
      format: 'single_image',
      images: [],
    },
    useAdvantage: true,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

