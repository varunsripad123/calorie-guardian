import mongoose from 'mongoose';

export interface IFood extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: Date;
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FoodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: String,
      required: true,
      trim: true
    },
    calories: {
      type: Number,
      required: true
    },
    protein: {
      type: Number,
      default: 0
    },
    carbs: {
      type: Number,
      default: 0
    },
    fat: {
      type: Number,
      default: 0
    },
    date: {
      type: Date,
      default: Date.now
    },
    aiGenerated: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Create compound index for efficient queries
FoodSchema.index({ userId: 1, date: 1 });

const Food = mongoose.model<IFood>('Food', FoodSchema);

export default Food;