import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '../../../../lib/mongodb';
import Room from '../../../../models/Room';

// GET /api/rooms/public - List active public rooms (discoverable)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const rooms = await Room.find({
      type: 'public',
      isActive: true
    })
      .select('-__v')
      .sort({ lastActivity: -1 })
      .lean();

    return NextResponse.json({ success: true, rooms });
  } catch (error) {
    console.error('Error fetching public rooms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}