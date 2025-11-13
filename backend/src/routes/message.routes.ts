import { Router } from 'express';
import { getMessagesByConversation, markMessagesRead } from '../controllers/message.controller';
import authMiddleware from '../middlewares/auth.middleware';

const router = Router();

// Obtener historial de una conversación (protegido)
router.get('/:conversationId', authMiddleware, getMessagesByConversation);

// Marcar mensajes como leídos
router.post('/mark-read', authMiddleware, markMessagesRead);

export default router;
