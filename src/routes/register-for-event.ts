import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function resgisterForEvent(app: FastifyInstance) {
   app.withTypeProvider<ZodTypeProvider>().post(
      "/events/:eventId/attendees",
      {
         schema: {
            body: z.object({
               name: z.string().min(4),
               email: z.string().email(),
            }),
            params: z.object({
               eventId: z.string().uuid(),
            }),
            response: {
               201: z.object({
                  attendeeId: z.number(),
               }),
            },
         },
      },
      async (request, reply) => {
         const { eventId } = request.params;
         const { name, email } = request.body;

         // Check if email is already registered
         const attendeeFromEmail = await prisma.attendee.findUnique({
            where: {
               eventId_email: {
                  email,
                  eventId,
               },
            },
         });

         if (attendeeFromEmail !== null) {
            throw new Error("This email is already registered for this event");
         }

         // Check if maximum number of attendees is reached
         const [event, amountOfAttendeesForEvent] = await Promise.all([
            prisma.event.findUnique({
               where: {
                  id: eventId,
               },
            }),

            prisma.attendee.count({
               where: {
                  eventId,
               },
            }),
         ]);

         if (
            event?.maximumAttendees &&
            amountOfAttendeesForEvent >= event.maximumAttendees
         ) {
            throw new Error("Maximum number of attendees reached");
         }

         // Create new attendee
         const attendee = await prisma.attendee.create({
            data: {
               name,
               email,
               eventId,
            },
         });

         return reply.status(201).send({ attendeeId: attendee.id });
      }
   );
}