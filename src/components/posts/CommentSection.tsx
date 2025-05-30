import { actions } from "astro:actions";
import { useEffect, useState } from "react";

import _Comment from "./Comment";
import CommentFormModal from "./CommentFormModal";

export type _Comment = {
  body: string;
  author: string;
  id: number;
  createdAt: Date;
  updatedAt: Date | null;
  postId: number | null;
  replies?: _Comment[];
};

type DbReturnType = {
  Comment: {
    postId: number | null;
    id: number;
    author: string;
    body: string;
    createdAt: Date;
    updatedAt: Date | null;
  };
  CommentReply: {
    id: number;
    originalCommentId: number;
    comment: number;
  } | null;
};

export default function CommentSection({ postId }: { postId: number }) {
  const [rawComments, setRawComments] = useState<DbReturnType[]>([]);
  const comments: _Comment[] = [];

  const tempComments: { [key: number]: _Comment[] } = {};

  const updateComments = () => {
    actions.getComments(postId).then((v) => setRawComments(v.data ?? []));
  };

  useEffect(() => {
    updateComments();
  }, [postId]);

  if (rawComments.length) {
    for (const { Comment, CommentReply } of rawComments) {
      if (!CommentReply) comments.push(Comment);
      else {
        if (!tempComments[CommentReply.originalCommentId])
          tempComments[CommentReply.originalCommentId] = [];

        tempComments[CommentReply.originalCommentId].push(Comment);
      }
    }
  }

  const parseReplies = (
    comments: _Comment[],
    tempComments: { [key: number]: _Comment[] }
  ): _Comment[] =>
    comments.map((comment) =>
      tempComments[comment.id]
        ? {
            ...comment,
            replies: parseReplies(tempComments[comment.id], tempComments),
          }
        : comment
    );

  const parsedComments = parseReplies(comments, tempComments);

  return (
    <section id="comment-section">
      <h2>Comments</h2>
      <CommentFormModal
        postId={postId}
        onSuccess={updateComments}
        trigger="Add a comment"
      />

      {parsedComments.map((comment, i) => (
        <_Comment
          comment={comment}
          key={i}
          postId={postId}
          onSuccess={updateComments}
        />
      ))}
    </section>
  );
}
