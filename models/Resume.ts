import {
  Schema,
  models,
  model,
  type Document,
  type Types,
} from "mongoose";

export interface ResumeDocument
  extends Document {
  userId: Types.ObjectId;

  fileName: string;

  contentType: string;

  size: number;

  data: Buffer;

  createdAt: Date;

  updatedAt: Date;
}

const ResumeSchema =
  new Schema<ResumeDocument>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true,
      },

      fileName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255,
      },

      contentType: {
        type: String,
        required: true,

        enum: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      },

      size: {
        type: Number,
        required: true,
        min: 1,
        max: 4 * 1024 * 1024,
      },

      data: {
        type: Buffer,
        required: true,
      },
    },

    {
      timestamps: true,
    }
  );

export default
  models.Resume ||
  model<ResumeDocument>(
    "Resume",
    ResumeSchema
  );