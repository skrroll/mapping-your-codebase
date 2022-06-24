import { Card, Elevation } from "@blueprintjs/core";
import "./HelpComponent.scss";
// import { Icon } from "@blueprintjs/core";

function HelpComponent() {
  return (
    <div className="helpComponent">
      <Card className="helpCard" elevation={Elevation.TWO}>
        <h3>How does this work?</h3>
        <p>
          To recompute the chart after selecting metrics you have to click the
          button called "Apply Metrics".
        </p>
        <h4>Metrics</h4>
        <p>What do the metrics available in this tool actually mean?</p>
        <h5>Added lines count</h5>
        <p>
          Represents the number of lines added to a file in a given time period.
        </p>
        <h5>Code churn</h5>
        <p>
          Represents the difference of lines added and removed since to a file
          in a given period of time.
        </p>
        <h5>Contributors count</h5>
        <p>Describes how many people have commited to this file.</p>
        <h5>Commits count</h5>
        <p>Represenst how many commits have modified the file.</p>
        <h5>Pull requests per file</h5>
        <p>
          Describes how many pull requests have been open in a given time period
          that modified the file.
        </p>
      </Card>
    </div>
  );
}

export default HelpComponent;
