import mongoose, { Schema } from "mongoose";

const LogSchema = new Schema({
  field: String,
  value: Schema.Types.Mixed,
  userId: String,
  updatedAt: Date,
});

const SubmissionSchema = new Schema({
  submissionId: {
    type: String,
    default: function () {
      // Use the _id's string representation as a fallback unique ID
      return new mongoose.Types.ObjectId().toHexString();
    },
  },
  submittedBy: String,
  submittedAt: { type: Date, default: Date.now },
  answers: Schema.Types.Mixed,
  logs: [LogSchema],
});

const ResponseSchema = new Schema({
  formId: { type: String, required: true },
  userId: { type: String },
  answers: Schema.Types.Mixed,
  submissions: [SubmissionSchema],
});

export const ResponseModel = mongoose.model("Response", ResponseSchema);
