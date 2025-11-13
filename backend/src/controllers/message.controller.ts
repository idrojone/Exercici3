import { Request, Response } from "express";
import { Message } from "../models/Message";
import User from "../models/User";

export const getMessagesByConversation = async (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const skip = parseInt(req.query.skip as string) || 0;
    try {
        const messages = await Message.find({ conversationId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        messages.reverse(); 
        return res.json({ ok: true, messages });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, error: "Internal error" });
    }
};

export const markMessagesRead = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const { messageIds } = req.body;
    if (!userId || !Array.isArray(messageIds)) return res.status(400).json({ ok: false });

    try {
        await Message.updateMany(
            { _id: { $in: messageIds } },
            { $addToSet: { readBy: userId } }
        );
        return res.json({ ok: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, error: "Internal error" });
    }
};