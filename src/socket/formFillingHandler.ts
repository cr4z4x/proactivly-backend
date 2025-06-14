import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { FormModel } from "../models/nosql/form.model";
import { ResponseModel } from "../models/nosql/response.model";
import redisClient from "../redis/redisClient";

const prisma = new PrismaClient();
const formResponses: Record<string, any> = {};

export function registerFormFillingHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      socket.emit("error", { message: "Token missing" });
      socket.disconnect();
      return;
    }

    let userId: string;
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      userId = decoded.id;
    } catch {
      socket.emit("error", { message: "Invalid token" });
      socket.disconnect();
      return;
    }

    socket.on("join-form", async ({ formId }) => {
      try {
        const access = await prisma.formAccess.findFirst({
          where: { formId, userId },
        });
        if (!access) return socket.emit("error", { message: "Access denied" });

        const form = await FormModel.findById(formId);
        if (!form) return socket.emit("error", { message: "Form not found" });

        let response = await ResponseModel.findOne({ formId });
        if (!response) {
          response = await ResponseModel.create({
            formId,
            userId,
            answers: {},
            submissions: [],
          });
        }

        formResponses[formId] = response.answers || {};
        socket.join(formId);

        socket.emit("form-init", {
          schema: form.fields,
          answers: response.answers,
          userId,
        });
      } catch (err) {
        console.error("join-form error:", err);
        socket.emit("error", { message: "Failed to join form" });
      }
    });

    socket.on("lock-field", async ({ formId, field }) => {
      const lockKey = `lock:${formId}:${field}`;
      const existing = await redisClient.get(lockKey);

      if (!existing || existing === userId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        await redisClient.set(lockKey, userId, { EX: 3 });

        io.to(formId).emit("lock-field", {
          field,
          userId,
          name: user?.name || "Someone",
        });
      } else {
        const owner = await prisma.user.findUnique({ where: { id: existing } });
        socket.emit("field-locked", {
          field,
          by: existing,
          name: owner?.name || "Someone",
        });
      }
    });

    socket.on("update-answer", async ({ formId, field, value }) => {
      const lockKey = `lock:${formId}:${field}`;
      const owner = await redisClient.get(lockKey);

      if (owner !== userId) {
        return socket.emit("field-locked", { field, by: owner });
      }

      formResponses[formId] ||= {};
      formResponses[formId][field] = value;

      await redisClient.set(lockKey, userId, { EX: 3 });
      socket.to(formId).emit("update-answer", { field, value });

      await ResponseModel.findOneAndUpdate(
        { formId },
        {
          $set: { [`answers.${field}`]: value },
          $push: {
            logs: {
              field,
              value,
              userId,
              updatedAt: new Date(),
            },
          },
        },
        { upsert: true }
      );
    });

    socket.on("submit-form", async ({ formId }) => {
      try {
        const response = await ResponseModel.findOne({ formId });
        if (!response)
          return socket.emit("error", { message: "Form not found" });

        const submissionId = new Date().toISOString();

        const snapshot = {
          submissionId,
          submittedAt: new Date(),
          submittedBy: userId,
          answers: { ...response.answers },
          logs:
            (response as any).logs?.filter(
              (log: any) => log.userId === userId
            ) || [],
        };

        await ResponseModel.findOneAndUpdate(
          { formId },
          {
            $push: { submissions: snapshot },
            $set: { logs: [] },
          },
          { upsert: true }
        );

        socket.emit("submission-success", { message: "Form submitted" });
        socket.to(formId).emit("submission-notification", { userId });
      } catch (err) {
        console.error("submit-form error:", err);
        socket.emit("error", { message: "Submission failed" });
      }
    });
  });
}
