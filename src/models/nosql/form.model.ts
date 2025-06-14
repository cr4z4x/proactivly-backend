import mongoose, { Schema } from "mongoose";

const FieldSchema = new Schema({
  label: String,
  type: String,
  options: [String],
  required: Boolean,
});

const FormSchema = new Schema({
  title: { type: String, required: true },
  slug: {
    type: String,
    unique: true,
    default: function () {
      // Generate a simple slug based on title and timestamp
      return (
        this.title?.toLowerCase().replace(/\s+/g, "-").substring(0, 30) +
        "-" +
        Date.now().toString(36)
      );
    },
  },
  createdBy: { type: String, required: true },
  fields: [FieldSchema],
  createdAt: { type: Date, default: Date.now },
});

export const FormModel = mongoose.model("Form", FormSchema);
