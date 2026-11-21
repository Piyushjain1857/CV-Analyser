import express from 'express';
import {
  sendMessage,
  getChatHistory,
  clearChatHistory,
} from '../controllers/chatController.js';

const router = express.Router();

router.post('/', sendMessage);
router.post('/message', sendMessage);
router.get('/history', getChatHistory);
router.get('/history/:resumeId', getChatHistory);
router.delete('/history', clearChatHistory);
router.delete('/history/:resumeId', clearChatHistory);

export default router;
