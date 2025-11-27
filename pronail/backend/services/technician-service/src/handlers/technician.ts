import { APIGatewayProxyHandler } from "aws-lambda";
import { TechnicianService } from "../services/technicianService";

const technicianService = new TechnicianService(process.env.USER_POOL_ID!);

export const create: APIGatewayProxyHandler = async (event) => {
  try {
    const data = JSON.parse(event.body!);
    const technician = await technicianService.create(data);
    return {
      statusCode: 201,
      body: JSON.stringify(technician),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not create technician" }),
    };
  }
};

export const get: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters!.id!;
    const technician = await technicianService.get(id);
    if (!technician) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Technician not found" }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(technician),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not retrieve technician" }),
    };
  }
};

export const update: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters!.id!;
    const data = JSON.parse(event.body!);
    const technician = await technicianService.update(id, data);
    return {
      statusCode: 200,
      body: JSON.stringify(technician),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not update technician" }),
    };
  }
};

export const del: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters!.id!;
    await technicianService.delete(id);
    return {
      statusCode: 204,
      body: "",
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not delete technician" }),
    };
  }
};

export const list: APIGatewayProxyHandler = async (event) => {
  try {
    const specialization = event.queryStringParameters?.specialization;
    let technicians;
    if (specialization) {
      technicians = await technicianService.findBySpecialization(specialization);
    } else {
      technicians = await technicianService.list();
    }
    return {
      statusCode: 200,
      body: JSON.stringify(technicians),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not list technicians" }),
    };
  }
};
