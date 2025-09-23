import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '../../../../lib/mongodb';
import Room from '../../../../models/Room';
import User from '../../../../models/User';

// POST /api/rooms/join - Join a public room by ID
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId } = await request.json();
    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }

    await connectDB();

    const room = await Room.findById(roomId);
    if (!room || !room.isActive) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.type !== 'public') {
      return NextResponse.json({ error: 'Room is not public' }, { status: 403 });
    }

    const isMember = room.members?.some(m => m.user?.toString() === session.user.id);
    if (isMember) {
      return NextResponse.json({ success: true, room }, { status: 200 });
    }

    room.members.push({ user: session.user.id, role: 'member', joinedAt: new Date() });
    await room.save();

    await User.findByIdAndUpdate(session.user.id, { $addToSet: { rooms: room._id } });

    await room.populate('members.user', 'name email avatar');

    return NextResponse.json({ success: true, room }, { status: 200 });
  } catch (error) {
    console.error('Error joining room:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}