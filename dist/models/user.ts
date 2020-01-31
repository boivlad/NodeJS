import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  login?: string,
  email?: string,
  password?: string,
  phone?: string,
  status?: boolean,
}

const UserSchema: mongoose.Schema = new mongoose.Schema({
  login: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
  },

  status: {
    type: Boolean,
    default: false,
  }
});

mongoose.model('User', UserSchema);
