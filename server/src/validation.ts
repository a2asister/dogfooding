import { z } from 'zod';

const BaseStyleSchema = z.object({
  backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
  textColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
  fontSize: z.number().min(8).max(72),
  fontWeight: z.number().min(100).max(900),
  paddingX: z.number().min(0).max(100),
  paddingY: z.number().min(0).max(100),
  borderRadius: z.number().min(0).max(100),
  borderWidth: z.number().min(0).max(20),
  borderColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
  boxShadow: z.string()
});

const HoverStyleSchema = z.object({
  backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
  textColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
  scale: z.number().min(0.5).max(2),
  boxShadow: z.string(),
  translateY: z.number().min(-50).max(50)
});

const ActiveStyleSchema = z.object({
  backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
  scale: z.number().min(0.5).max(2),
  translateY: z.number().min(-50).max(50)
});

const LoadingStyleSchema = z.object({
  backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
  spinnerColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
  spinnerSize: z.number().min(10).max(100)
});

const SuccessStyleSchema = z.object({
  backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
  textColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
  iconColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color')
});

const ErrorStyleSchema = z.object({
  backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
  textColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
  iconColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color')
});

const AnimationConfigSchema = z.object({
  type: z.enum(['spring', 'tween']),
  stiffness: z.number().min(10).max(1000),
  damping: z.number().min(1).max(100),
  mass: z.number().min(0.1).max(10),
  duration: z.number().min(0.1).max(5),
  ease: z.string()
});

export const ButtonAnimationConfigSchema = z.object({
  name: z.string().min(1).max(100),
  baseStyle: BaseStyleSchema,
  hoverStyle: HoverStyleSchema,
  activeStyle: ActiveStyleSchema,
  loadingStyle: LoadingStyleSchema,
  successStyle: SuccessStyleSchema,
  errorStyle: ErrorStyleSchema,
  animation: AnimationConfigSchema
});

export const BulkImportSchema = z.array(ButtonAnimationConfigSchema);

export const validateConfig = (data: unknown) => ButtonAnimationConfigSchema.safeParse(data);
export const validateBulkImport = (data: unknown) => BulkImportSchema.safeParse(data);
