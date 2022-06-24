import "./ErrorComponent.scss";
// import { Icon } from "@blueprintjs/core";

function ErrorComponent() {
  return (
    <div className="bp4-non-ideal-state error-component">
      <div className="bp4-non-ideal-state-visual">
        {/* <Icon icon="git-branch" iconSize={48} intent="none" color={"#393E46"}/> */}
      </div>
      <div className="bp4-non-ideal-state-text">
        <h4 className="bp4-heading">
          Not enough commits to create a visualisation
        </h4>
        <div>Create new commits to see a graph</div>
      </div>
    </div>
  );
}

export default ErrorComponent;
