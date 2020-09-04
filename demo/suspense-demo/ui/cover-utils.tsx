import React from "react";

import "./bookCoverComponentStyles.css";

export const NoCoverSmall = () => (
  <div className="no-cover-small">
    <div>No Cover</div>
  </div>
);

export const NoCoverMedium = () => (
  <div className="no-cover-medium">
    <div>No Cover</div>
  </div>
);

export const CoverSmall = ({ url }) =>
  url ? <img style={{ display: "block" }} src={url} /> : <NoCoverSmall />;

export const CoverMedium = ({ url }) =>
  url ? <img style={{ display: "block" }} src={url} /> : <NoCoverMedium />;
