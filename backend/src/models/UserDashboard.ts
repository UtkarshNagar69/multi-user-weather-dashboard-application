import mongoose, { Document, Schema } from 'mongoose';

export interface ICity {
  cityName: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  isFavorite: boolean;
  addedAt: Date;
}

export interface IUserDashboard extends Document {
  userId: mongoose.Types.ObjectId;
  cities: ICity[];
}

const CitySchema = new Schema<ICity>(
  {
    cityName: { type: String, required: true },
    countryCode: { type: String, default: '' },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    isFavorite: { type: Boolean, default: false },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserDashboardSchema = new Schema<IUserDashboard>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  cities: { type: [CitySchema], default: [] },
});

export default mongoose.model<IUserDashboard>('UserDashboard', UserDashboardSchema);
