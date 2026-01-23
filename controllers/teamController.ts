import { Request, Response } from 'express';
import { User, TeamInvite, Project } from '../models/schemas';
import crypto from 'crypto';

// Get all team members for a project
export const getTeamMembers = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    const project = await Project.findById(projectId).populate('team');
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Get pending invites
    const pendingInvites = await TeamInvite.find({
      projectId,
      status: 'pending'
    }).populate('invitedBy', 'name email');
    
    res.json({
      members: project.team,
      pendingInvites
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
};

// Invite a team member
export const inviteTeamMember = async (req: Request, res: Response) => {
  try {
    const { email, role, projectId, invitedBy } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      // Check if already in project
      const project = await Project.findById(projectId);
      if (project?.team.includes(user._id)) {
        return res.status(400).json({ error: 'User is already a team member' });
      }
    }
    
    // Generate unique invite code
    const inviteCode = crypto.randomBytes(16).toString('hex');
    
    // Create invite
    const invite = await TeamInvite.create({
      email,
      role,
      projectId,
      invitedBy,
      inviteCode,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    
    const populatedInvite = await TeamInvite.findById(invite._id)
      .populate('invitedBy', 'name email');
    
    // TODO: Send email with invite code
    
    res.status(201).json(populatedInvite);
  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ error: 'Failed to invite team member' });
  }
};

// Accept team invitation
export const acceptInvite = async (req: Request, res: Response) => {
  try {
    const { inviteCode, userName } = req.body;
    
    const invite = await TeamInvite.findOne({ inviteCode, status: 'pending' });
    
    if (!invite) {
      return res.status(404).json({ error: 'Invalid or expired invite code' });
    }
    
    // Check if expired
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      invite.status = 'expired';
      await invite.save();
      return res.status(400).json({ error: 'Invite code has expired' });
    }
    
    // Create or update user
    let user = await User.findOne({ email: invite.email });
    
    if (!user) {
      user = await User.create({
        name: userName || invite.email.split('@')[0],
        email: invite.email,
        role: invite.role,
        status: 'active',
        invitedBy: invite.invitedBy,
        invitedAt: invite.createdAt,
        acceptedAt: new Date(),
        avatar: invite.role === 'qa' ? '👩‍🎨' : '👨‍💻'
      });
    }
    
    // Add user to project team
    await Project.findByIdAndUpdate(invite.projectId, {
      $addToSet: { team: user._id }
    });
    
    // Update invite status
    invite.status = 'accepted';
    invite.acceptedAt = new Date();
    await invite.save();
    
    res.json({ user, message: 'Invitation accepted successfully' });
  } catch (error) {
    console.error('Accept invite error:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
};

// Remove team member
export const removeTeamMember = async (req: Request, res: Response) => {
  try {
    const { userId, projectId } = req.body;
    
    const project = await Project.findByIdAndUpdate(
      projectId,
      { $pull: { team: userId } },
      { new: true }
    ).populate('team');
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project.team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove team member' });
  }
};

// Update member role
export const updateMemberRole = async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update member role' });
  }
};

// Cancel/Revoke invitation
export const cancelInvite = async (req: Request, res: Response) => {
  try {
    const { inviteId } = req.params;
    
    const invite = await TeamInvite.findByIdAndUpdate(
      inviteId,
      { status: 'rejected' },
      { new: true }
    );
    
    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }
    
    res.json({ message: 'Invitation cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel invitation' });
  }
};
