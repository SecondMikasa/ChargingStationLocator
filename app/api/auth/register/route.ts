import { NextRequest, NextResponse } from 'next/server';
import { RegisterSchema } from '@/lib/validation';
import { hashPassword, createUser, normalizeEmail } from '@/lib/auth-utils';
import { getUserByEmail, addUser } from '@/lib/mock-data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request data
    const validationResult = RegisterSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validationResult.error
        },
        { status: 400 }
      );
    }

    const { name, email, password } = validationResult.data;
    const normalizedEmail = normalizeEmail(email);

    // Check if user already exists
    const existingUser = getUserByEmail(normalizedEmail);
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User with this email already exists' 
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = createUser({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user'
    });

    // Add user to mock database
    addUser({
      ...newUser,
      devices: [] // Initialize empty devices array
    });

    // Return success response (without password)
    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}