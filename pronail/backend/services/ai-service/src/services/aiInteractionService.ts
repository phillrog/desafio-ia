import * as dynamoose from "dynamoose";
import { Document } from "dynamoose/dist/Document";
import { Polly, Translate, S3 } from "aws-sdk";
import axios from "axios";
import pkg2 from "uuid";
const { v4: uuidv4 } = pkg2;
import { OpenAI } from "openai";
import { BookingService } from "../../../booking-service/src/services/bookingService";
import { TechnicianService } from "../../../technician-service/src/services/technicianService";

class AIInteraction extends Document {
  id: string;
  userId: string;
  interactionType: "virtualAssistant";
  content: string;
  audioUrl?: string;
  response?: string;
  createdAt: Date;
}

const AIInteractionSchema = new dynamoose.Schema({
  id: {
    type: String,
    hashKey: true,
  },
  userId: {
    type: String,
    index: {
      global: true,
      name: "UserIdIndex",
      rangeKey: "interactionType",
    },
  },
  interactionType: {
    type: String,
    enum: ["virtualAssistant"],
  },
  content: String,
  audioUrl: {
    type: String,
    required: false,
  },
  response: {
    type: String,
    required: false,
  },
  createdAt: Date,
});

const AIInteractionModel = dynamoose.model<AIInteraction>(
  process.env.AI_INTERACTION_TABLE!,
  AIInteractionSchema,
  {
    create: false,
  }
);

export class AIInteractionService {
  private polly: Polly;
  private translate: Translate;
  private openai: OpenAI;
  private s3: S3;
  private bookingService: BookingService;
  private technicianService: TechnicianService;
  private conversationContext: {
    technicianId?: string;
    dateTime?: string;
  };

  constructor() {
    this.polly = new Polly();
    this.translate = new Translate({ region: "us-east-1" });
    this.s3 = new S3();
    this.openai = new OpenAI({
      apiKey: process.env.OPEN_AI_KEY!,
    });
    this.bookingService = new BookingService();
    this.technicianService = new TechnicianService("useless");
    this.conversationContext = {};
  }

  async create(
    data: Omit<AIInteraction, "id" | "createdAt">
  ): Promise<AIInteraction> {
    try {
      const serializedContent =
        typeof data.content === "object"
          ? JSON.stringify(data.content)
          : String(data.content);

      const newInteraction = new AIInteractionModel({
        ...data,
        content: serializedContent,
        id: uuidv4(),
        createdAt: new Date(),
      });

      await newInteraction.save();
      return newInteraction;
    } catch (error) {
      console.error("Error creating AI interaction:", error);
      throw error;
    }
  }

  async get(id: string): Promise<AIInteraction | null> {
    try {
      const interaction = await AIInteractionModel.get(id);
      return interaction || null;
    } catch (error) {
      console.error("Error getting AI interaction:", error);
      throw error;
    }
  }

  async list(
    userId?: string,
    interactionType?: AIInteraction["interactionType"]
  ): Promise<AIInteraction[]> {
    try {
      let query = AIInteractionModel.scan();

      if (userId) {
        query = query.filter("userId").eq(userId);
      }

      if (interactionType) {
        query = query.filter("interactionType").eq(interactionType);
      }

      const interactions = await query.exec();
      return interactions;
    } catch (error) {
      console.error("Error listing AI interactions:", error);
      throw error;
    }
  }

  async handleVirtualAssistant(
    messages: Array<{ role: string; content: string }>,
    clientId: string
  ): Promise<string> {
    try {
      const tools: any = [
        {
          type: "function",
          function: {
            name: "get_available_technicians",
            description: "Get a list of available technicians",
            parameters: {
              type: "object",
              properties: {},
              required: [],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "create_booking",
            description: "Create a new booking",
            parameters: {
              type: "object",
              properties: {
                technicianId: { type: "string" },
                dateTime: { type: "string", format: "date-time" },
              },
              required: ["technicianId", "dateTime"],
            },
          },
        },
      ];

      const systemMessage = {
        role: "system",
        content:
          "You are an AI assistant for a beautycare application. You can answer general nail questions, hair , face, provide health advice, and assist with scheduling bookings. Always prioritize client safety and refer to professional beauty advice when appropriate. When listing available technicians, always include their ID, name, specialty, and registration number. When the user confirms they want to schedule an booking, you MUST use the create_booking function with the technician's ID (not registration number) and the specified time. Do not pretend to create an booking without calling the function.",
      };
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [systemMessage, ...messages],
        tools: tools,
        tool_choice: "auto",
      });

      const assistantMessage = response.choices[0].message;

      if (assistantMessage.tool_calls) {
        const toolCall = assistantMessage.tool_calls[0];
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        let functionResult = "";
        if (functionName === "get_available_technicians") {
          console.log("Get available technicians");
          const technicians = await this.technicianService.list();
          functionResult = `Available technicians: ${JSON.stringify(
            technicians.map((technician) => ({
              id: technician.id,
              name: technician.firstName,
              specialty: technician.specialization,
            }))
          )}`;
        } else if (functionName === "create_booking") {
          console.log("Called create_booking", clientId);
          console.log("Args", functionArgs);

          const { technicianId, dateTime } = functionArgs;

          if (!technicianId || !dateTime) {
            functionResult = "Insufficient information to create booking";
          } else {
            const booking = await this.createBooking(
              clientId,
              technicianId,
              dateTime
            );
            functionResult = `Booking created: ${JSON.stringify(
              booking
            )}`;
          }
        }

        const finalResponse = await this.openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            systemMessage,
            ...messages,
            { role: "function", name: functionName, content: functionResult },
            {
              role: "user",
              content:
                "Please provide a friendly and informative response based on this information. If an booking was created, confirm the details to the user.",
            },
          ],
        });

        return (
          finalResponse.choices[0].message.content ||
          "I apologize, but I'm unable to process your request at the moment."
        );
      }

      return (
        assistantMessage.content ||
        "I apologize, but I'm unable to process your request at the moment."
      );
    } catch (error) {
      console.error("Error handling virtual assistant query:", error);
      throw error;
    }
  }

  private async createBooking(
    clientId: string,
    technicianId: string,
    dateTime: string
  ): Promise<any> {
    try {
      console.log("Service - creating booking");
      console.log("ClientId:", clientId);
      console.log("TechnicianId:", technicianId);
      console.log("DateTime:", dateTime);

      const booking = await this.bookingService.create({
        clientId,
        technicianId,
        dateTime: new Date(dateTime).toISOString(),
        status: "scheduled",
      });
      console.log("Booking created successfully:", booking);
      return booking;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  }  
}

async function runThread(apiKey: string, assistantId: string, message: string) {
  const client = new OpenAI({
    apiKey: apiKey,
  });
  const maxRetries: number = 3;
  const retryDelay: number = 2;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const run = await client.beta.threads.createAndRun({
        thread: {
          messages: [{ role: "user", content: message }],
        },
        assistant_id: assistantId,
      });

      let runStatus = run.status;
      while (runStatus === "queued" || runStatus === "in_progress") {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const runLoop = await client.beta.threads.runs.retrieve(
          run.thread_id,
          run.id
        );
        console.log(runLoop.status);
        runStatus = runLoop.status;

        if (runStatus === "failed") {
          console.log(runLoop);
          throw new Error("Run failed");
        }
      }
      const messages = await client.beta.threads.messages.list(run.thread_id);

      return messages.data[0].content[0].text.value;
    } catch (e) {
      console.log(`Attempt ${attempt + 1} failed: ${e}`);
      if (attempt < maxRetries - 1) {
        console.log(`Retrying in ${retryDelay} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay * 1000));
      } else {
        console.log("Max retries reached. Aborting.");
        throw e;
      }
    }
  }
}
