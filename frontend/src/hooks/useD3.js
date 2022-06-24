import React from "react";
import * as d3 from "d3";

const useD3 = (renderChart, deps) => {
  const ref = React.useRef();

  React.useEffect(() => {
    renderChart(d3.select(ref.current));
    return () => {};
  }, [deps]);
  return ref;
};

export { useD3 };
