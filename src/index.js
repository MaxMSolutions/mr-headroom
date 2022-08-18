/* eslint-disable no-undef */
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import A from "./A";

const root = ReactDOM.createRoot(document.getElementById("root"));
window.cache = atob;
window.decode = (z) => {
  return z.reverse().toString().replaceAll(",", "").substring(1, 12);
};
window.coords = () => {
  return 15384697380 / 769234869;
};
window.ping = (z) => {
  const r = z.split("");
  r.splice(Math.ceil(Math.random() * 10), 0, buffer.coords());
  buffer[buffer.cache("Z2VvY29kZQ==")] = r.join("");
  return r.join("");
};

root.render(
  <React.StrictMode>
    <A />
  </React.StrictMode>
);
