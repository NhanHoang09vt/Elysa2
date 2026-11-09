import { Router } from 'express';
import { INITIAL_CLASSES, INITIAL_SKILLS } from '@elysia/game-data-schema';
import { WorldService } from '../services/world.service.js';

export const gameRouter = Router();
const worldService = new WorldService();

gameRouter.get('/classes', (_req, res) => {
  res.json({ success: true, data: INITIAL_CLASSES });
});

gameRouter.get('/skills', (_req, res) => {
  res.json({ success: true, data: INITIAL_SKILLS });
});

gameRouter.get('/regions', (_req, res) => {
  res.json({ success: true, data: worldService.getRegions() });
});

gameRouter.get('/monsters', (_req, res) => {
  res.json({ success: true, data: worldService.getMonsters() });
});

gameRouter.get('/monster-skills', (_req, res) => {
  res.json({ success: true, data: worldService.getMonsterSkills() });
});

gameRouter.get('/drop-tables', (_req, res) => {
  res.json({ success: true, data: worldService.getDropTables() });
});

gameRouter.get('/npcs', (_req, res) => {
  res.json({ success: true, data: worldService.getNpcs() });
});

gameRouter.get('/dialogues', (_req, res) => {
  res.json({ success: true, data: worldService.getDialogues() });
});

gameRouter.get('/spawns', (_req, res) => {
  res.json({ success: true, data: worldService.getSpawnPoints() });
});

gameRouter.get('/quests', (_req, res) => {
  res.json({ success: true, data: worldService.getQuests() });
});

gameRouter.get('/quest-chains', (_req, res) => {
  res.json({ success: true, data: worldService.getQuestChains() });
});

gameRouter.get('/world-config', (_req, res) => {
  res.json({ success: true, data: worldService.getWorldConfig() });
});
