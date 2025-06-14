import { Request, Response } from "express";
import { FormModel } from "../models/nosql/form.model";
import { PrismaClient, FormRole, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export const createForm = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { title, fields, accessEmails } = req.body;

    if (!title || !Array.isArray(fields)) {
      res.status(400).json({ message: "Invalid form data" });
      return;
    }

    // Step 1: Create in MongoDB
    const mongoForm = await FormModel.create({
      title,
      fields,
      createdBy: user.id,
    });

    // Step 2: Create in PostgreSQL with synced ID
    const pgForm = await prisma.form.create({
      data: {
        id: mongoForm._id.toString(), // Use Mongo ID as the UUID for consistency
        title,
        createdBy: user.id,
      },
    });

    // Step 3: Add ACL
    const aclEntries: Prisma.FormAccessCreateManyInput[] = [
      {
        formId: pgForm.id,
        userId: user.id,
        role: FormRole.OWNER,
      },
    ];

    const validEmails = Array.isArray(accessEmails)
      ? accessEmails.filter(
          (email) => typeof email === "string" && email.includes("@")
        )
      : [];

    if (validEmails.length > 0) {
      const usersToGrant = await prisma.user.findMany({
        where: {
          email: { in: validEmails },
        },
      });

      usersToGrant.forEach((u) => {
        if (u.id !== user.id) {
          aclEntries.push({
            formId: pgForm.id,
            userId: u.id,
            role: FormRole.EDITOR,
          });
        }
      });
    }

    await prisma.formAccess.createMany({ data: aclEntries });

    res.status(201).json({
      message: "Form created successfully",
      formId: pgForm.id,
      formUrl: `/forms/${pgForm.id}`,
    });
  } catch (err) {
    console.error("Form creation error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
