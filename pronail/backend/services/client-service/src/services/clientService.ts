import * as dynamoose from "dynamoose";
import { Document } from "dynamoose/dist/Document";
import { CognitoIdentityServiceProvider } from "aws-sdk";

// Define the Client model
class Client extends Document {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender?: "male" | "female" | "other";
  contactNumber?: string;
  nailHistory?: Array<{
    condition: string;
    diagnosisDate: Date;
    notes?: string;
  }>;
  createdAt: Date;
  updatedAt?: Date;
}

// Create the Dynamoose schema
const ClientSchema = new dynamoose.Schema({
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
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: false,
  },
  contactNumber: {
    type: String,
    required: false,
  },
  nailHistory: {
    type: Array,
    schema: [
      {
        type: Object,
        schema: {
          condition: String,
          diagnosisDate: Date,
          notes: {
            type: String,
            required: false,
          },
        },
      },
    ],
    required: false,
  },
  createdAt: Date,
  updatedAt: {
    type: Date,
    required: false,
  },
});

// Create the Dynamoose model
const ClientModel = dynamoose.model<Client>(
  process.env.CLIENT_TABLE!,
  ClientSchema,
  {
    create: false,
  }
);

export class ClientService {
  private cognito: CognitoIdentityServiceProvider;

  constructor(private userPoolId: string) {
    this.cognito = new CognitoIdentityServiceProvider();
  }

  async create(
    data: Omit<Client, "id" | "createdAt" | "updatedAt">
  ): Promise<Client> {
    try {
      // Verify that the user exists in Cognito and has the 'client' role
      const cognitoUser = await this.cognito
        .adminGetUser({
          UserPoolId: this.userPoolId,
          Username: data.userId,
        })
        .promise();

      const userRole = cognitoUser.UserAttributes?.find(
        (attr) => attr.Name === "custom:role"
      )?.Value;
      if (userRole !== "client") {
        throw new Error("User is not authorized to be a client");
      }

      // Create client in DynamoDB
      const newClient = new ClientModel({
        ...data,
        id: data.userId,
        createdAt: new Date(),
      });

      await newClient.save();
      return newClient;
    } catch (error) {
      console.error("Error creating client:", error);
      throw error;
    }
  }

  async get(id: string): Promise<Client | null> {
    try {
      const client = await ClientModel.get(id);
      return client || null;
    } catch (error) {
      console.error("Error getting client:", error);
      throw error;
    }
  }

  async update(
    id: string,
    data: Partial<Omit<Client, "id" | "userId" | "createdAt">>
  ): Promise<Client> {
    try {
      const updatedClient = await ClientModel.update(
        { id },
        { ...data, updatedAt: new Date() }
      );
      return updatedClient;
    } catch (error) {
      console.error("Error updating client:", error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await ClientModel.delete(id);
    } catch (error) {
      console.error("Error deleting client:", error);
      throw error;
    }
  }

  async list(filter?: Partial<Client>): Promise<Client[]> {
    try {
      let scan = ClientModel.scan();

      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          scan = scan.filter(key).eq(value);
        });
      }

      const clients = await scan.exec();
      return clients;
    } catch (error) {
      console.error("Error listing clients:", error);
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<Client | null> {
    try {
      const clients = await ClientModel.query("userId").eq(userId).exec();
      return clients[0] || null;
    } catch (error) {
      console.error("Error finding client by User ID:", error);
      throw error;
    }
  }

  async addNailHistoryEntry(
    id: string,
    entry: { condition: string; diagnosisDate: Date; notes?: string }
  ): Promise<Client> {
    try {
      const client = await this.get(id);
      if (!client) {
        throw new Error("Client not found");
      }
      let nailHistory;
      if (client.nailHistory) {
        nailHistory = [...client.nailHistory, entry];
      } else {
        nailHistory = [entry];
      }
      const updatedClient = await ClientModel.update(
        { id },
        {
          nailHistory,
          updatedAt: new Date(),
        }
      );

      return updatedClient;
    } catch (error) {
      console.error("Error adding nail history entry:", error);
      throw error;
    }
  }
}
