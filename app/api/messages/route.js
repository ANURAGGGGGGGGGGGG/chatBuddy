import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '../../../lib/mongodb';
import Message from '../../../models/Message';
import Room from '../../../models/Room';

// GET /api/messages - Fetch messages for a room
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const skip = (page - 1) * limit;

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }

    await connectDB();

    // Check if user is a member of the room
    const room = await Room.findById(roomId).lean();
    const isMember = room && Array.isArray(room.members) && room.members.some(m => m.user?.toString() === session.user.id);
    if (!room || !isMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch messages with pagination
    const messages = await Message.find({
      room: roomId,
      isDeleted: false
    })
    .populate('sender', 'name email avatar')
    .populate('replyTo', 'content sender')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

    // Mark messages as read for the current user
    const unreadMessageIds = messages
      .filter(msg => !msg.readBy.some(read => read.user.toString() === session.user.id))
      .map(msg => msg._id);

    if (unreadMessageIds.length > 0) {
      await Message.updateMany(
        { _id: { $in: unreadMessageIds } },
        {
          $addToSet: {
            readBy: {
              user: session.user.id,
              readAt: new Date()
            }
          }
        }
      );
    }

    return NextResponse.json({
      messages: messages.reverse(), // Reverse to show oldest first
      hasMore: messages.length === limit
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/messages - Send a new message
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId, content, type = 'text', replyTo, attachments } = await request.json();

    if (!roomId || !content?.trim()) {
      return NextResponse.json({ error: 'Room ID and content are required' }, { status: 400 });
    }

    await connectDB();

    // Check if user is a member of the room
    const room = await Room.findById(roomId).lean();
    const isMember = room && Array.isArray(room.members) && room.members.some(m => m.user?.toString() === session.user.id);
    if (!room || !isMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create new message
    const message = new Message({
      content: content.trim(),
      sender: session.user.id,
      room: roomId,
      type,
      replyTo: replyTo || null,
      attachments: attachments || [],
      readBy: [{
        user: session.user.id,
        readAt: new Date()
      }]
    });

    await message.save();

    // Update room's last message and activity
    await Room.findByIdAndUpdate(roomId, {
      lastMessage: message._id,
      lastActivity: new Date()
    });

    // Populate the message for response
    await message.populate('sender', 'name email avatar');
    if (replyTo) {
      await message.populate('replyTo', 'content sender');
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/messages - Update a message (edit)
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId, content } = await request.json();

    if (!messageId || !content?.trim()) {
      return NextResponse.json({ error: 'Message ID and content are required' }, { status: 400 });
    }

    await connectDB();

    // Find and update message (only sender can edit)
    const message = await Message.findOneAndUpdate(
      {
        _id: messageId,
        sender: session.user.id,
        isDeleted: false
      },
      {
        content: content.trim(),
        isEdited: true,
        editedAt: new Date()
      },
      { new: true }
    ).populate('sender', 'name email avatar');

    if (!message) {
      return NextResponse.json({ error: 'Message not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/messages - Delete a message
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    await connectDB();

    // Soft delete message (only sender can delete)
    const message = await Message.findOneAndUpdate(
      {
        _id: messageId,
        sender: session.user.id,
        isDeleted: false
      },
      {
        isDeleted: true,
        deletedAt: new Date()
      },
      { new: true }
    );

    if (!message) {
      return NextResponse.json({ error: 'Message not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}