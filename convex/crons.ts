import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("poll ePoslovanje AIS", { minutes: 60 }, internal.payments.pollAis, {});

export default crons;
