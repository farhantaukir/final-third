import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const POSITIONS = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      required: true,
      enum: ['admin', 'coach', 'player'],
    },
    profilePicture: { type: String, default: '' },
    position: {
      type: String,
      default: '',
      validate: {
        validator(val) {
          if (!val) return true;
          return POSITIONS.includes(val);
        },
        message: 'Invalid position',
      },
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function comparePassword(plainText) {
  return bcrypt.compare(plainText, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
