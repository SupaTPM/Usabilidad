"use client";

import { useEffect, useState } from "react";
import { A11Y_CHANGE_EVENT } from "./apply";

function readShowHints(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.dataset.showHints === "on";
}

/** Indica si las ayudas de formulario deben mostrarse y anunciarse. */
export function useShowHints(): boolean {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(readShowHints());
    const onChange = () => setShow(readShowHints());
    window.addEventListener(A11Y_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(A11Y_CHANGE_EVENT, onChange);
  }, []);

  return show;
}
