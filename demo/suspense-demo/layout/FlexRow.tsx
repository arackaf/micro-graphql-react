import React from "react";
import cn from "classnames";

export default ({ className = "", style = {}, tighter = false, tightest = false, xsFlowReverse = false, children }) => (
  <div style={style} className={cn("flex-row", className, { tighter, tightest, ["xs-pull-reverse"]: xsFlowReverse })}>
    <div>{children}</div>
  </div>
);
