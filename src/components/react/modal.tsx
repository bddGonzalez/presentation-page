import "./modal.css";
import { useEffect, useRef, useState } from "react";

export default function Modal({
  isOpen,
  setIsOpen,
  trigger,
  children,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean | ((val: boolean) => boolean)) => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
}) {
  //   const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const modalOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        modalOverlayRef.current &&
        !modalRef.current?.contains(event.target as Node)
      )
        setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <div>
      <button onClick={() => setIsOpen(true)} className="trigger">
        {trigger}
      </button>
      {isOpen && (
        <div className="modal" ref={modalOverlayRef}>
          <div className="modal-content" ref={modalRef}>
            <span onClick={() => setIsOpen(false)} className="close">
              &times;
            </span>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
