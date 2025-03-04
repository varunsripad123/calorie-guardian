import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  apiKey?: string;
  profile?: {
    weight: number;
    height: number;
    age: number;
    gender: 'male' | 'female' | 'other';
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very active';
    goal: 'lose' | 'maintain' | 'gain';
    nationality: string;
    dietaryPreferences: string[];
    maintenanceCalories: number;
    targetCalories: number;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    apiKey: {
      type: String,
      required: false
    },
    profile: {
      weight: Number,
      height: Number,
      age: Number,
      gender: {
        type: String,
        enum: ['male', 'female', 'other']
      },
      activityLevel: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'active', 'very active']
      },
      goal: {
        type: String,
        enum: ['lose', 'maintain', 'gain']
      },
      nationality: String,
      dietaryPreferences: [String],
      maintenanceCalories: Number,
      targetCalories: Number
    }
  },
  { timestamps: true }
);

// Hash the password before saving
UserSchema.pre('save', async function(next) {
  const user = this as unknown as IUser;
  
  // Only hash the password if it's modified or new
  if (!user.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', UserSchema);

export default User;