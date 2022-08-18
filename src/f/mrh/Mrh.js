/* eslint-disable no-undef */
import { useEffect, useState } from "react";
import useC from "../zm/useZm";
import hs from "react-hash-string";
import "./Mrh.scss";

const TTL = "MRHEADROOM";

const Mrh = () => {
  const [t, st] = useState(TTL);
  const d = useC(new Date("2/7/2027"));
  const isHr = t === TTL;
  const mod = isHr ? 1 : 0.05;
  const turn = hs[buffer.cache("aGFzaEFycmF5")];

  useEffect(() => {
    setTimeout(() => {
      if (isHr)
        st(
          turn([
            d,
            buffer.ping(
              (Math.random() + 1).toString(36).substring(2).toUpperCase()
            ),
            buffer.geocode,
          ])
        );
      else st(TTL);
    }, 379 + Math.random() * 9387 * mod);
  }, [isHr, mod, d, turn]);

  return (
    <div className="landscape">
      <div className="flowers" data-text={t}>
        {t}
      </div>
      <div className="snow">{t}</div>
      <p className="tears">{turn([d, buffer.geocode])}</p>
    </div>
  );
};

export default Mrh;
