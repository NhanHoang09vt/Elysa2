import { Router } from 'express';
import { CharacterService } from '../services/character.service.js';
import { AuthRequest } from '../middleware/auth.js';

export const characterRouter = Router();
const characterService = new CharacterService();

characterRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const chars = await characterService.getCharactersByUserId(req.user?.id);
    res.json({ success: true, data: chars });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

characterRouter.post('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id || 'USR_ANONYMOUS';
    const character = await characterService.createCharacter(userId, req.body);
    res.status(201).json({ success: true, data: character });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message, error: err.message });
  }
});

characterRouter.get('/:id', async (req, res) => {
  try {
    const char = await characterService.getCharacterById(req.params.id);
    if (!char) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy nhân vật.' });
    }
    res.json({ success: true, data: char });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

characterRouter.patch('/:id', async (req, res) => {
  try {
    const updated = await characterService.updateCharacter(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

characterRouter.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id || 'USR_ANONYMOUS';
    await characterService.deleteCharacter(req.params.id, userId);
    res.json({ success: true, message: 'Đã xóa nhân vật thành công.' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
