import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '../../../lib/mongodb';
import Room from '../../../models/Room';
import User from '../../../models/User';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find rooms where the user is a member
    const rooms = await Room.find({
      'members.user': session.user.id,
      isActive: true
    })
    .populate('members.user', 'name email avatar')
    .populate('lastMessage')
    .sort({ lastActivity: -1 })
    .lean();

    return NextResponse.json({
      success: true,
      rooms: rooms
    });

  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, description, type = 'public' } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Room name is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Create new room
    const room = new Room({
      name: name.trim(),
      description: description?.trim(),
      type,
      creator: session.user.id,
      members: [{
        user: session.user.id,
        role: 'admin',
        joinedAt: new Date()
      }]
    });

    await room.save();

    // Add room to user's rooms array
    await User.findByIdAndUpdate(session.user.id, {
      $addToSet: { rooms: room._id }
    });

    // Populate the room data
    await room.populate('members.user', 'name email avatar');

    return NextResponse.json({
      success: true,
      message: 'Room created successfully',
      room: room
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating room:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: errors.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}