import fastify from "fastify";
import fastifyCors from "@fastify/cors";

import {
   ZodTypeProvider,
   serializerCompiler,
   validatorCompiler,
} from "fastify-type-provider-zod";
import { createEvent } from "./routes/create-event";
import { resgisterForEvent } from "./routes/register-for-event";
import { getEvent } from "./routes/get-event";
import { getAttendeeBadge } from "./routes/get-attendee-badge";
import { checkIn } from "./routes/check-in";
import { getEventAttendees } from "./routes/get-event-attendees";
import { errorHandler } from "./utils/error-handle";

export const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, {
   origin: "*",
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createEvent);
app.register(resgisterForEvent);
app.register(getEvent);
app.register(getAttendeeBadge);
app.register(checkIn);
app.register(getEventAttendees);

app.setErrorHandler(errorHandler);

app.listen({ port: 3333, host: "0.0.0.0" }).then(() => {
   console.log("HTTP server running");
});
