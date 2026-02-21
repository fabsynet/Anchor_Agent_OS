import { z } from 'zod';

export const createNoteSchema = z.object({
  content: z.string().min(1, 'Note cannot be empty').max(5000),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
