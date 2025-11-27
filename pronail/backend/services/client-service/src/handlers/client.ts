import { APIGatewayProxyHandler } from "aws-lambda";
import { ClientService } from "../services/clientService";

const clientService = new ClientService(process.env.USER_POOL_ID!);

export const create: APIGatewayProxyHandler = async (event) => {
  try {
    const data = JSON.parse(event.body!);
    const client = await clientService.create(data);
    return {
      statusCode: 201,
      body: JSON.stringify(client),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not create client" }),
    };
  }
};

export const get: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters!.id!;
    const client = await clientService.get(id);
    if (!client) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Client not found" }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(client),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not retrieve client" }),
    };
  }
};

export const update: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters!.id!;
    const data = JSON.parse(event.body!);
    const client = await clientService.update(id, data);
    return {
      statusCode: 200,
      body: JSON.stringify(client),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not update client" }),
    };
  }
};

export const del: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters!.id!;
    await clientService.delete(id);
    return {
      statusCode: 204,
      body: "",
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not delete client" }),
    };
  }
};

export const list: APIGatewayProxyHandler = async (event) => {
  try {
    const clients = await clientService.list();
    return {
      statusCode: 200,
      body: JSON.stringify(clients),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not list clients" }),
    };
  }
};

export const addNailHistory: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters!.id!;
    const entry = JSON.parse(event.body!);
    const client = await clientService.addNailHistoryEntry(id, entry);
    return {
      statusCode: 200,
      body: JSON.stringify(client),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not add nail history entry" }),
    };
  }
};
