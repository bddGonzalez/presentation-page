import type { FormEvent } from "react";
import { useState } from "react";
import Modal from "../react/modal";
import { actions } from "astro:actions";

export default function CommentFormModal({
  postId,
  onSuccess,
  trigger,
  replyingTo,
}: {
  postId: number;
  onSuccess: () => void;
  trigger: string;
  replyingTo?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const _onSuccess = () => {
    onSuccess();
    setIsOpen(false);
  };

  const onSubmit = (formSubmit: FormEvent<HTMLFormElement>) => {
    formSubmit.preventDefault();
    const form = document.querySelector("form");
    if (form) {
      const formData = new FormData(form);
      formData.append("postId", postId.toString());
      if (replyingTo !== undefined && replyingTo >= 0)
        formData.append("replyingTo", replyingTo.toString());
      actions
        .addComment(formData)
        .then((v) =>
          v.error
            ? document
                .getElementsByClassName("error")[0]
                .replaceChildren(
                  "An error occured, name can't be longer than 20 characters. Otherwise, try again later"
                )
            : _onSuccess()
        );
    }
  };

  return (
    <Modal trigger={trigger} {...{ isOpen, setIsOpen }}>
      <form
        onSubmit={onSubmit}
        style={{
          marginTop: "25px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
        autoComplete="off"
      >
        <label>
          Name
          <input required type="text" name="author" style={{ width: "100%" }} />
        </label>
        <label>
          Comment
          <textarea required name="body" style={{ width: "100%" }}></textarea>
        </label>
        <button
          style={{
            backgroundColor: "var(--emphasis-color)",
            padding: "1rem",
          }}
        >
          Submit
        </button>
        <p className="error"></p>
      </form>
    </Modal>
  );
}
