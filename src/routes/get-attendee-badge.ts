import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_erros/bad-request";

export async function getAttendeeBadge(app: FastifyInstance) {
   app.withTypeProvider<ZodTypeProvider>().get(
      "/attendees/:attendeeId/badge",
      {
         schema: {
            sumary: "Get an attendee badge",
            tags: ["attendees"],
            params: z.object({
               attendeeId: z.coerce.number(),
            }),
            response: {
               200: z.object({
                  badge: z.object({
                     name: z.string(),
                     email: z.string().email(),
                     eventTitle: z.string(),
                     checkInUrl: z.string().url(),
                  }),
               }),
            },
         },
      },
      async (request, reply) => {
         const { attendeeId } = request.params;

         // Find the attendee
         const attendee = await prisma.attendee.findUnique({
            where: {
               id: attendeeId,
            },
            select: {
               name: true,
               email: true,
               event: {
                  select: {
                     title: true,
                  },
               },
            },
         });

         // check if the participant exists
         if (attendee === null) {
            throw new BadRequest("Attendee not found");
         }

         const baseURL = `${request.protocol}://${request.hostname}`;

         const checkInUrl = new URL(
            `/attendees/${attendeeId}/checkin`,
            baseURL
         );

         return reply.status(200).send({
            badge: {
               name: attendee.name,
               email: attendee.email,
               eventTitle: attendee.event.title,
               checkInUrl: checkInUrl.toString(),
            },
         });
      }
   );
}
