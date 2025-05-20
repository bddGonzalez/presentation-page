import CommentFormModal from "./CommentFormModal.js";
import type { _Comment } from "./CommentSection.js";

export default function Comment({
  comment,
  reply,
  postId,
  onSuccess,
  disableReplies,
}: {
  comment: _Comment;
  reply?: boolean;
  postId: number;
  onSuccess: () => void;
  disableReplies?: boolean;
}) {
  return (
    <article
      className={reply ? "comment reply-comment" : "comment"}
      id={"comment-" + comment.id}
    >
      <p>
        {comment.author} - {comment.createdAt.toLocaleDateString("es-ar")}
      </p>
      <p>{comment.body}</p>
      {disableReplies ? (
        false
      ) : (
        <span style={{ display: "flex", justifyContent: "end" }}>
          <CommentFormModal
            postId={postId}
            onSuccess={onSuccess}
            trigger="Reply"
            replyingTo={comment.id}
          />
        </span>
      )}
      {comment.replies ? (
        <div className="replies-container">
          {comment.replies.map((r, i) => (
            <Comment
              comment={r}
              reply
              key={i}
              postId={postId}
              onSuccess={onSuccess}
            />
          ))}
        </div>
      ) : (
        false
      )}
    </article>
  );
}
