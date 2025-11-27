import * as dynamoose from "dynamoose";
import { Document } from "dynamoose/dist/Document";
import { CognitoIdentityServiceProvider } from "aws-sdk";

// Define the Technician model
class Technician extends Document {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  specialization: string;
  licenseNumber: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Create the Dynamoose schema
const TechnicianSchema = new dynamoose.Schema({
  id: {
    type: String,
    hashKey: true,
  },
  userId: {
    type: String,
    index: {
      global: true,
      name: "UserIdIndex",
    },
  },
  firstName: String,
  lastName: String,
  specialization: {
    type: String,
    index: {
      global: true,
      name: "SpecializationIndex",
    },
  },
  licenseNumber: String,
  createdAt: Date,
  updatedAt: {
    type: Date,
    required: false,
  },
});

// Create the Dynamoose model
const TechnicianModel = dynamoose.model<Technician>(
  process.env.TECHNICIAN_TABLE!,
  TechnicianSchema,
  {
    create: false,
  }
);

export class TechnicianService {
  private cognito: CognitoIdentityServiceProvider;

  constructor(private userPoolId: string) {
    this.cognito = new CognitoIdentityServiceProvider();
  }

  async create(
    data: Omit<Technician, "id" | "createdAt" | "updatedAt">
  ): Promise<Technician> {
    try {
      // Verify that the user exists in Cognito and has the 'technician' role
      const cognitoUser = await this.cognito
        .adminGetUser({
          UserPoolId: this.userPoolId,
          Username: data.userId,
        })
        .promise();

      const userRole = cognitoUser.UserAttributes?.find(
        (attr) => attr.Name === "custom:role"
      )?.Value;
      if (userRole !== "technician") {
        throw new Error("User is not authorized to be a technician");
      }

      // Create technician in DynamoDB
      const newTechnician = new TechnicianModel({
        ...data,
        id: data.userId,
        createdAt: new Date(),
      });

      await newTechnician.save();
      return newTechnician;
    } catch (error) {
      console.error("Error creating technician:", error);
      throw error;
    }
  }

  async get(id: string): Promise<Technician | null> {
    try {
      const technician = await TechnicianModel.get(id);
      return technician || null;
    } catch (error) {
      console.error("Error getting technician:", error);
      throw error;
    }
  }

  async update(
    id: string,
    data: Partial<Omit<Technician, "id" | "userId" | "createdAt">>
  ): Promise<Technician> {
    try {
      const updatedTechnician = await TechnicianModel.update(
        { id },
        { ...data, updatedAt: new Date() }
      );
      return updatedTechnician;
    } catch (error) {
      console.error("Error updating technician:", error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await TechnicianModel.delete(id);
    } catch (error) {
      console.error("Error deleting technician:", error);
      throw error;
    }
  }

  async list(filter?: Partial<Technician>): Promise<Technician[]> {
    try {
      let scan = TechnicianModel.scan();

      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          scan = scan.filter(key).eq(value);
        });
      }

      const technicians = await scan.exec();
      return technicians;
    } catch (error) {
      console.error("Error listing technicians:", error);
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<Technician | null> {
    try {
      const technicians = await TechnicianModel.query("userId").eq(userId).exec();
      return technicians[0] || null;
    } catch (error) {
      console.error("Error finding technician by User ID:", error);
      throw error;
    }
  }

  async findBySpecialization(specialization: string): Promise<Technician[]> {
    try {
      const technicians = await TechnicianModel.query("specialization")
        .eq(specialization)
        .exec();
      return technicians;
    } catch (error) {
      console.error("Error finding technicians by specialization:", error);
      throw error;
    }
  }
}
