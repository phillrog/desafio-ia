import * as dynamoose from "dynamoose";
import { Document } from "dynamoose/dist/Document";
import pkg2 from "uuid";
const { v4: uuidv4 } = pkg2;
// Define the Booking model
class Booking extends Document {
  id: string;
  clientId: string;
  technicianId: string;
  dateTime: string;
  status: "Agendado" | "Encerrado" | "Cancelado";
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Create the Dynamoose schema
const BookingSchema = new dynamoose.Schema({
  id: {
    type: String,
    hashKey: true,
  },
  clientId: {
    type: String,
    index: {
      global: true,
      name: "ClientIdIndex",
      rangeKey: "dateTime",
    },
  },
  technicianId: {
    type: String,
    index: {
      global: true,
      name: "TechnicianIdIndex",
      rangeKey: "dateTime",
    },
  },
  dateTime: String,
  status: {
    type: String,
    enum: ["Agendado", "Encerrado", "Cancelado"],
  },
  notes: {
    type: String,
    required: false,
  },
  createdAt: Date,
  updatedAt: {
    type: Date,
    required: false,
  },
});

// Create the Dynamoose model
const BookingModel = dynamoose.model<Booking>(
  process.env.BOOKING_TABLE!,
  BookingSchema,
  {
    create: false,
  }
);

export class BookingService {
  async create(
    data: Omit<Booking, "id" | "createdAt" | "updatedAt">
  ): Promise<Booking> {
    try {
      console.log("Service criando");
      const newBooking = new BookingModel({
        ...data,
        id: uuidv4(),
        createdAt: new Date(),
        status: data.status || "Agendado",
      });

      await newBooking.save();
      return newBooking;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  }

  async get(id: string): Promise<Booking | null> {
    try {
      const booking = await BookingModel.get(id);
      return booking || null;
    } catch (error) {
      console.error("Error getting booking:", error);
      throw error;
    }
  }

  async update(
    id: string,
    data: Partial<Omit<Booking, "id" | "createdAt">>
  ): Promise<Booking> {
    try {
      const updatedBooking = await BookingModel.update(
        { id },
        { ...data, updatedAt: new Date() }
      );
      return updatedBooking;
    } catch (error) {
      console.error("Error updating booking:", error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await BookingModel.delete(id);
    } catch (error) {
      console.error("Error deleting booking:", error);
      throw error;
    }
  }

  async list(filter?: Partial<Booking>): Promise<Booking[]> {
    try {
      let scan = BookingModel.scan();

      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          scan = scan.filter(key).eq(value);
        });
      }

      const bookings = await scan.exec();
      return bookings;
    } catch (error) {
      console.error("Error listing bookings:", error);
      throw error;
    }
  }

  async findByClientId(
    clientId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Booking[]> {
    try {
      let query = BookingModel.query("clientId").eq(clientId);

      if (startDate && endDate) {
        query = query.where("dateTime").between(startDate, endDate);
      } else if (startDate) {
        query = query.where("dateTime").ge(startDate);
      } else if (endDate) {
        query = query.where("dateTime").le(endDate);
      }

      const bookings = await query.exec();
      return bookings;
    } catch (error) {
      console.error("Error finding bookings by Client ID:", error);
      throw error;
    }
  }

  async findByTechnicianId(
    technicianId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Booking[]> {
    try {
      let query = BookingModel.query("technicianId").eq(technicianId);

      if (startDate && endDate) {
        query = query.where("dateTime").between(startDate, endDate);
      } else if (startDate) {
        query = query.where("dateTime").ge(startDate);
      } else if (endDate) {
        query = query.where("dateTime").le(endDate);
      }

      const bookings = await query.exec();
      return bookings;
    } catch (error) {
      console.error("Error finding bookings by Technician ID:", error);
      throw error;
    }
  }
}
