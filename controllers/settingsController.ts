import { Request, Response } from 'express';
import { Settings } from '../models/schemas';

// Get settings for a project
export const getSettings = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    let settings = await Settings.findOne({ projectId });
    
    // Create default settings if not exists
    if (!settings) {
      settings = await Settings.create({ projectId });
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

// Update settings
export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { projectId, ...updates } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    const settings = await Settings.findOneAndUpdate(
      { projectId },
      { ...updates, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (req: Request, res: Response) => {
  try {
    const { projectId, notifications } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    const settings = await Settings.findOneAndUpdate(
      { projectId },
      { notifications, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
};

// Update integrations
export const updateIntegrations = async (req: Request, res: Response) => {
  try {
    const { projectId, integrations } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    const settings = await Settings.findOneAndUpdate(
      { projectId },
      { integrations, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update integrations' });
  }
};

// Update AI settings
export const updateAISettings = async (req: Request, res: Response) => {
  try {
    const { projectId, aiSettings } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    const settings = await Settings.findOneAndUpdate(
      { projectId },
      { aiSettings, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update AI settings' });
  }
};
