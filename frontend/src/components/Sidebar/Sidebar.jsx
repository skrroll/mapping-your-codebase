import "./Sidebar.scss";
import React, { useState } from "react";
import { useSelector } from "react-redux";

const sidebarMetricsForElem = [
  "path",
  "line_count",
  "contributors_count",
  "commits_count",
  "code_churn",
  "pull_requests",
  "startDate",
  "endDate",
];

function Sidebar() {
  const circleData = useSelector((state) => state.selectedCircle.value);
  const [sidebarData, setSidebarData] = useState([]);
  const [sidebarTitle, setSidebarTitle] = useState("");
  React.useEffect(() => {
    if (circleData == null) return;

    const sidebar_data = [];
    var i = 0;
    if (circleData.children) {
      circleData.children.forEach((d) => {
        if (i < 25) {
          sidebar_data.push(
            <li className="list-elem" key={"child " + d.name}>
              {d.name}
            </li>
          );
          i++;
        }
      });

      if (i === 25) {
        sidebar_data.push(
          <li className="list-elem" key={"child " + 25}>
            ... and more
          </li>
        );
      }
    } else {
      for (const [k, v] of Object.entries(circleData.metrics)) {
        if (sidebarMetricsForElem.includes(k)) {
          sidebar_data.push(
            <li className="list-elem" key={k}>
              {k}: {v}
            </li>
          );
        }
      }
    }

    setSidebarTitle(circleData["name"]);
    setSidebarData(sidebar_data);
  }, [circleData]);

  return (
    <div className={circleData !== null ? "Sidebar active" : "Sidebar"}>
      <h3>{sidebarTitle}</h3>
      <ul className="list">{sidebarData !== undefined ? sidebarData : null}</ul>
    </div>
  );
}

export default Sidebar;
