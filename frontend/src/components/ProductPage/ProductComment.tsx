// src/components/Product/ProductComment.tsx
import { formatDistanceToNow } from "date-fns";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/Auth/AuthContext";
import type { ReactNode } from "react";

export type CommentShape = {
    id: string;
    authorName?: string | null;
    authorEmail?: string | null;
    text: string;
    createdAt: string; // ISO
};

export default function ProductComment({
                                           comment,
                                           onDelete,
                                           children,
                                       }: {
    comment: CommentShape;
    onDelete?: (id: string) => void;
    children?: ReactNode;
}) {
    const { user } = useAuth();

    const isMine = user?.email && comment.authorEmail === user.email;

    return (
        <div className="flex gap-3 items-start p-3 border-b border-white/6">
            <Avatar className="w-10 h-10">
                <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-black">{(comment.authorEmail && comment.authorEmail[0]?.toUpperCase()) || "U"}</AvatarFallback>
                </Avatar>
            </Avatar>

            <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="text-sm font-semibold">{comment.authorName || comment.authorEmail || "Anonymous"}</div>
                        <div className="text-xs text-gray-400">{comment.authorEmail}</div>
                    </div>

                    <div className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </div>
                </div>

                <p className="mt-2 text-sm text-gray-500">{comment.text}</p>

                <div className="mt-2 flex gap-2">
                    {isMine && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete && onDelete(comment.id)}
                            className="text-xs"
                        >
                            Delete
                        </Button>
                    )}

                    {children}
                </div>
            </div>
        </div>
    );
}
