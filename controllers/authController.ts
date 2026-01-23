import { Request, Response } from 'express';
import { User } from '../models/schemas';

// Login (Member/QA via Invite Code)
export const login = async (req: Request, res: Response) => {
  try {
    const { inviteCode } = req.body;
    
    // Simulating Invite Code validation
    // In a real app, invite codes would be stored in the DB linked to a project/role
    // For this MVP, we use the simple logic requested
    
    let role = 'member';
    if (inviteCode && inviteCode.toLowerCase().includes('qa')) {
        role = 'qa';
    }

    // Find or Create a Mock User for this session
    // In a real flow, this would verify a token. Here we simulate a user found via invite.
    let user = await User.findOne({ email: `${role}@octoops.dev` });
    
    if (!user) {
        user = await User.create({
            name: role === 'qa' ? 'QA Specialist' : 'Team Developer',
            email: `${role}@octoops.dev`,
            role: role,
            avatar: role === 'qa' ? '👩‍🎨' : '👨‍💻'
        });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

// Signup (Project Owner)
export const signupOwner = async (req: Request, res: Response) => {
  try {
    const { name, email, projectName } = req.body;

    let user = await User.findOne({ email });
    if (user) {
        return res.status(400).json({ error: 'User already exists' });
    }

    user = await User.create({
        name,
        email,
        role: 'owner',
        avatar: '👩‍💼'
    });

    res.status(201).json({ user, projectName }); // Project creation happens in next step
  } catch (error) {
    res.status(500).json({ error: 'Signup failed' });
  }
};
