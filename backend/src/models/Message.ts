import { Schema, model, Document } from "mongoose";

export interface IMessage extends Document {
    conversationId: string;
    sender: string;
    senderName?: string;
    recipients: string[];
    text?: string;
    readBy: string[];
    createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
    conversationId: {
        type: String,
        index: true,
        required: true,
    },
    sender: {
        type: String,
        required: true,
    },
    senderName: {
        type: String,
    },
    recipients: [{
        type: String,
        index: true,
    }],
    text: {
        type: String,
    },
    readBy: [{
        type: String,
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

messageSchema.index({ conversationId: 1, createdAt: -1 });

export const Message = model<IMessage>("Message", messageSchema);

