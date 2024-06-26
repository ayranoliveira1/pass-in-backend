import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_erros/bad-request";

export async function getEvent(app: FastifyInstance) {
   // Get an event
   app.withTypeProvider<ZodTypeProvider>().get(
      "/events/:eventId",
      {
         schema: {
            summary: "Get an event",
            tags: ["events"],
            params: z.object({
               eventId: z.string().uuid(),
            }),
            response: {
               200: z.object({
                  event: z.object({
                     id: z.string().uuid(),
                     title: z.string(),
                     slug: z.string(),
                     details: z.string().nullable(),
                     maximumAttendees: z.number().int().nullable(),
                     attendeesCount: z.number().int(),
                  }),
               }),
            },
         },
      },
      async (request, reply) => {
         const { eventId } = request.params;

         const event = await prisma.event.findUnique({
            where: {
               id: eventId,
            },

            select: {
               id: true,
               title: true,
               details: true,
               slug: true,
               maximumAttendees: true,
               _count: {
                  select: {
                     attendees: true,
                  },
               },
            },
         });

         // Check if event exists
         if (event === null) {
            throw new BadRequest("Event not found");
         }

         // Return event
         return reply.status(200).send({
            event: {
               id: event.id,
               title: event.title,
               details: event.details,
               slug: event.slug,
               maximumAttendees: event.maximumAttendees,
               attendeesCount: event._count.attendees,
            },
         });
      }
   );
}
