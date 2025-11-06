// src/components/ProductPage/ProductComment.tsx

export type CommentShape = {
    id: string;
    authorName: string;
    authorEmail?: string | null;
    text: string;
    rating?: number;
    createdAt: string; // ISO string
};

export default function ProductComment({ comment }: { comment: CommentShape }) {
    const date = new Date(comment.createdAt);
    const formatted = date.toLocaleString();

    return (
        <div className="bg-panel p-4 rounded-md border border-black/6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center text-sm font-semibold text-black">
                            {comment.authorName?.[0]?.toUpperCase() ?? "U"}
                        </div>
                        <div>
                            <div className="text-sm font-medium text-black">{comment.authorName}</div>
                            <div className="text-xs text-gray-400">{formatted}</div>
                        </div>
                    </div>
                </div>

                {/* Rating badge */}
                <div className="text-sm">
                    {typeof comment.rating === "number" ? (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-black/6 rounded">
                            <span className="font-semibold text-sm">{comment.rating}</span>
                            <span className="text-xs text-gray-500">/5</span>
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="mt-3 text-sm text-gray-600">{comment.text}</div>
        </div>
    );
}
