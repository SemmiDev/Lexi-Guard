import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import History from '@/models/History';
import { connectToDatabase } from '@/lib/mongodb';
import { z } from 'zod';

const HistorySchema = z.object({
    originalText: z.string().min(1, 'Original text is required'),
    correctedText: z.string().min(1, 'Corrected text is required'),
    suggestions: z.array(
        z.object({
            original: z.string(),
            suggestion: z.string(),
            explanation: z.string(),
        })
    ),
});

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectToDatabase();

        const body = await req.json();
        const validatedData = HistorySchema.parse(body);

        const history = new History({
            user: session.user.id,
            originalText: validatedData.originalText,
            correctedText: validatedData.correctedText,
            suggestions: validatedData.suggestions,
        });

        await history.save();

        return NextResponse.json({ message: 'History saved successfully', id: history._id }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Invalid request data", details: error.errors },
                { status: 400 }
            );
        }
        console.error("Error saving history:", error);
        return NextResponse.json(
            { message: "Error saving history", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectToDatabase();

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10'))); // Limit max items to prevent abuse

        const skip = (page - 1) * limit;
        const history = await History.find({ user: session.user.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await History.countDocuments({ user: session.user.id });

        return NextResponse.json({
            history,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasMore: skip + history.length < total
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching history:", error);
        return NextResponse.json(
            { message: "Error fetching history", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectToDatabase();

        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ message: 'Missing ID' }, { status: 400 });
        }

        const deleted = await History.findOneAndDelete({ _id: id, user: session.user.id });

        if (!deleted) {
            return NextResponse.json({ message: 'Item not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ message: 'History item deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error("Error deleting history:", error);
        return NextResponse.json(
            { message: "Error deleting history", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
