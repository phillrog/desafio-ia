import { APIGatewayProxyHandler } from "aws-lambda";
import { BookingService } from "../services/bookingService";

const bookingService = new BookingService();

export const create: APIGatewayProxyHandler = async (event) => {
  try {
    const data = JSON.parse(event.body!);
    const booking = await bookingService.create(data);
    return {
      statusCode: 201,
      body: JSON.stringify(booking),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not create booking" }),
    };
  }
};

export const get: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters!.id!;
    const booking = await bookingService.get(id);
    if (!booking) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Booking not found" }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(booking),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not retrieve booking" }),
    };
  }
};

export const update: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters!.id!;
    const data = JSON.parse(event.body!);
    const booking = await bookingService.update(id, data);
    return {
      statusCode: 200,
      body: JSON.stringify(booking),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not update booking" }),
    };
  }
};

export const del: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters!.id!;
    await bookingService.delete(id);
    return {
      statusCode: 204,
      body: "",
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not delete booking" }),
    };
  }
};

export const list: APIGatewayProxyHandler = async (event) => {
  try {
    const { clientId, technicianId, startDate, endDate } =
      event.queryStringParameters || {};
    let bookings;

    if (clientId) {
      bookings = await bookingService.findByClientId(
        clientId,
        startDate,
        endDate
      );
    } else if (technicianId) {
      bookings = await bookingService.findByTechnicianId(
        technicianId,
        startDate,
        endDate
      );
    } else {
      bookings = await bookingService.list();
    }

    return {
      statusCode: 200,
      body: JSON.stringify(bookings),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not list bookings" }),
    };
  }
};
