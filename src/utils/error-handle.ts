import { FastifyInstance } from "fastify";
import { BadRequest } from "../routes/_erros/bad-request";
import { ZodError } from "zod";

type FastifyErrorHandle = FastifyInstance["errorHandler"];

// Error handler
export const errorHandler: FastifyErrorHandle = (error, request, reply) => {
   // Validation
   if (error instanceof ZodError) {
      return reply.status(400).send({
         message: "Error during validation",
         errors: error.flatten().fieldErrors,
      });
   }

   // Bad request
   if (error instanceof BadRequest) {
      return reply.status(400).send({
         message: error.message,
      });
   }

   // return internal server error
   return reply.status(500).send({
      message: "Internal server error",
   });
};
