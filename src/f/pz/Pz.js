/* eslint-disable no-undef */
import { useState } from "react";
import "./Pz.scss";

const Pz = () => {
  const [w, sW] = useState(["SFVOVA==", "U0VFSw==", "U09MVkU="]);
  const isN = w[0] === "SFVOVA==";
  const handleClick = () => {
    sW(["M", "T", "I0"]);
  };
  const renderIt = (i) => {
    return !isN ? w[i] : buffer.cache(w[i]);
  };

  return (
    <div className="city">
      <div className="labyrinth show-edge">
        <div
          onClick={handleClick}
          className="labyrinth__wilderness labyrinth__wilderness--back"
        >
          {renderIt(0)}
        </div>
        <div
          onClick={handleClick}
          className="labyrinth__wilderness labyrinth__wilderness--right"
        >
          {renderIt(1)}
        </div>
        <div
          onClick={handleClick}
          className="labyrinth__wilderness labyrinth__wilderness--top"
        >
          {renderIt(2)}
        </div>
      </div>
    </div>
  );
};

export default Pz;
