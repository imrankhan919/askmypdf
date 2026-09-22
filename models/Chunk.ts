import mongoose, { InferSchemaType, Model, Schema } from "mongoose";

const chunkSchema = new Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export type ChunkType = InferSchemaType<typeof chunkSchema>;

export const Chunk =
  (mongoose.models.Chunk as Model<ChunkType>) ||
  mongoose.model<ChunkType>("Chunk", chunkSchema);
