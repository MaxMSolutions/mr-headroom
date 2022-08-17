import { useEffect, useState } from "react";
import useC from "../zm/useZm";
import "./Mrh.scss";

const TTL = "MRHEADROOM";

const Mrh = () => {
  const [t, st] = useState(TTL);
  const d = useC(new Date("1/6/2027"));
  const isHr = t === TTL;
  const mod = isHr ? 1 : 0.05;

  useEffect(() => {
    setTimeout(() => {
      if (isHr)
        st(
          // eslint-disable-next-line no-undef
          buffer.store(
            (Math.random() + 1).toString(36).substring(2).toUpperCase()
          )
        );
      else st(TTL);
    }, 379 + Math.random() * 9387 * mod);
  }, [isHr, mod]);

  return (
    <div className="container">
      <div className="glitch" data-text={t}>
        {t}
      </div>
      <div className="glow">{t}</div>
      <p className="subtitle">{d}</p>
    </div>
  );
};

export default Mrh;
