import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { checkGrammar } from '@/lib/langchain';
import { connectToDatabase, UserModel } from '@/lib/mongodb';
import { GrammarCheckRequestSchema } from '@/types';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();

    try {
      const validatedData = GrammarCheckRequestSchema.parse(body);

      // Perform grammar check
      const result = await checkGrammar(validatedData);

      // Update user's check count
      await connectToDatabase();
      await UserModel.findOneAndUpdate(
        { email: session.user.email },
        { $inc: { checksPerformed: 1 } }
      );

      return NextResponse.json(result);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid request data', details: validationError.errors },
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (error) {
    console.error('Grammar check API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
