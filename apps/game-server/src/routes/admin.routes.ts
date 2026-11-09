import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ItemService } from '../services/item.service.js';
import { JsonStore } from '../database/jsonStore.js';
import { ENV } from '../config/env.js';

export const adminRouter = Router();
const itemService = new ItemService();
const store = JsonStore.getInstance();

// Configure Multer for asset uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = ENV.UPLOADS_DIR;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// --- DASHBOARD STATS ---
adminRouter.get('/dashboard', (_req, res) => {
  res.json({
    success: true,
    data: {
      totalUsers: store.users.length,
      onlinePlayers: 1,
      totalCharacters: store.characters.length,
      totalItems: store.items.length,
      totalWeapons: store.weapons.length,
      serverStatus: 'running',
    },
  });
});

// --- ADMIN ITEMS ---
adminRouter.get('/items', async (req, res) => {
  try {
    const result = await itemService.getItems(req.query);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.get('/items/:id', async (req, res) => {
  try {
    const item = await itemService.getItemById(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: 'Không tìm thấy vật phẩm.' });
    res.json({ success: true, data: item });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.post('/items', async (req, res) => {
  try {
    const item = await itemService.createItem(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message, error: err.message });
  }
});

adminRouter.patch('/items/:id', async (req, res) => {
  try {
    const item = await itemService.updateItem(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message, error: err.message });
  }
});

adminRouter.delete('/items/:id', async (req, res) => {
  try {
    await itemService.deleteItem(req.params.id);
    res.json({ success: true, message: 'Đã xóa vật phẩm thành công.' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

adminRouter.post('/items/:id/duplicate', async (req, res) => {
  try {
    const item = await itemService.duplicateItem(req.params.id);
    res.status(201).json({ success: true, data: item });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message, error: err.message });
  }
});

adminRouter.post('/items/:id/archive', async (req, res) => {
  try {
    const item = await itemService.archiveItem(req.params.id);
    res.json({ success: true, data: item });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

adminRouter.post('/items/:id/publish', async (req, res) => {
  try {
    const item = await itemService.publishItem(req.params.id);
    res.json({ success: true, data: item });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message, error: err.message });
  }
});

// --- ADMIN WEAPONS ---
adminRouter.get('/weapons', async (req, res) => {
  try {
    const result = await itemService.getWeapons(req.query);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.get('/weapons/:id', async (req, res) => {
  try {
    const weapon = await itemService.getWeaponById(req.params.id);
    if (!weapon) return res.status(404).json({ success: false, error: 'Không tìm thấy vũ khí.' });
    res.json({ success: true, data: weapon });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.post('/weapons', async (req, res) => {
  try {
    const weapon = await itemService.createWeapon(req.body);
    res.status(201).json({ success: true, data: weapon });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message, error: err.message });
  }
});

adminRouter.patch('/weapons/:id', async (req, res) => {
  try {
    const weapon = await itemService.updateWeapon(req.params.id, req.body);
    res.json({ success: true, data: weapon });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message, error: err.message });
  }
});

adminRouter.delete('/weapons/:id', async (req, res) => {
  try {
    await itemService.deleteWeapon(req.params.id);
    res.json({ success: true, message: 'Đã xóa vũ khí thành công.' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

adminRouter.post('/weapons/:id/duplicate', async (req, res) => {
  try {
    const weapon = await itemService.duplicateWeapon(req.params.id);
    res.status(201).json({ success: true, data: weapon });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message, error: err.message });
  }
});

adminRouter.post('/weapons/:id/archive', async (req, res) => {
  try {
    const weapon = await itemService.archiveWeapon(req.params.id);
    res.json({ success: true, data: weapon });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

adminRouter.post('/weapons/:id/publish', async (req, res) => {
  try {
    const weapon = await itemService.publishWeapon(req.params.id);
    res.json({ success: true, data: weapon });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message, error: err.message });
  }
});

// --- ASSET UPLOADS ---
adminRouter.post('/assets/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Vui lòng chọn file hình ảnh để upload.' });
  }
  const assetUrl = `/assets/${req.file.filename}`;
  res.json({
    success: true,
    data: {
      assetId: `ASSET_${Date.now()}`,
      url: assetUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
});

adminRouter.post('/assets/:id/replace', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Vui lòng chọn file mới để thay thế.' });
  }
  res.json({
    success: true,
    data: {
      assetId: req.params.id,
      url: `/assets/${req.file.filename}`,
      version: 2,
    },
  });
});

adminRouter.post('/assets/:id/rollback', (req, res) => {
  res.json({
    success: true,
    data: {
      assetId: req.params.id,
      version: req.body.versionNumber || 1,
      message: 'Rollback phiên bản thành công.',
    },
  });
});
