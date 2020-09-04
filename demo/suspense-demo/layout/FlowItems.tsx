import React, { SFC, FC } from "react";
import cn from "classnames";

type Props = {
  style?: any;
  containerStyle?: any;
  className?: string;
  xsFlowReverse?: boolean;
  tighter?: boolean;
  tightest?: boolean;
  vCenter?: boolean;
  pushLast?: boolean;
};

const FlowItems: FC<Props> = ({ className = "", style = {}, containerStyle = {}, xsFlowReverse, tighter, tightest, vCenter, pushLast, children }) => {
  const cssClasses = {
    tighter,
    tightest,
    ["v-center"]: vCenter,
    ["push-last"]: pushLast,
    ["xs-pull-reverse"]: xsFlowReverse
  };

  return (
    <div className={cn("flow-items", className, cssClasses)} style={style}>
      <div style={containerStyle}>{children}</div>
    </div>
  );
};

export default FlowItems;
