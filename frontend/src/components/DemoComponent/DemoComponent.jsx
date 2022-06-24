import { Card, Elevation, Button, Spinner } from "@blueprintjs/core";
import "./DemoComponent.scss";
import React, { useState } from "react";
import { startOfWeek, endOfWeek } from "date-fns";
import { get_repo_data } from "../../api/api";
import FormChart from "../FormChart/FormChart";

// Demo component used to perform a survey
function DemoComponent() {
  const [data, setData] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [repoData, setRepoData] = useState({});
  const [weekList, setWeekList] = useState([]);
  const [monthList, setMonthList] = useState([]);

  const parseData = () => {
    // arbitrary data, just for demo, can be changed
    const post_data = {
      accessToken: "",
      repName: "twbs/bootstrap",
      bname: "main",
      startTime: new Date(2022, 1, 2),
      endTime: new Date(2022, 4, 21),
    };

    setLoading(true);
    get_repo_data(post_data).then((response) => {
      post_data.startTime = startOfWeek(post_data.endTime, { weekStartsOn: 1 });
      post_data.endTime = endOfWeek(post_data.endTime, { weekStartsOn: 1 });
      post_data.accessToken = "";
      setRepoData(post_data);
      setData(response.data.metrics);
      setWeekList(response.data.weekList);
      setMonthList(response.data.monthList);
      setLoaded(true);
      setLoading(false);
    });
  };

  return (
    <React.Fragment>
      {loaded === false && (
        <div className="DemoComponent">
          <Card className="demoCard" elevation={Elevation.TWO}>
            <h3>Mapping your codebase - demo</h3>
            <p>
              Hi everyone! This tool allows you to see the changes that happened
              to the codebase according to some of the metrics calculated from
              the version control system. This demo version takes data from a
              main branch of twbs/bootstrap repository since 1st February 2022
              until 22nd May 2022 . You can explore what changes have been made
              in this timeframe and how was the software development process.
            </p>
            <h4>How does the tool work?</h4>
            <p>
              The visualisation represents changes made to a file as a bubble.
              To show a visualisation you have to pick two metrics at the navbar
              that will represent bubble size and bubble color. If you want to
              know more about metrics you can click the help button on the
              navbar (with the "?" symbol). If you click on a bubble you will
              see metrics and details of a given file.
            </p>
            <p>
              I would really appreciate if you could take some time to fill out
              the survey. It would help me evaluate the tool and collect
              necessary feedback. Thank you so much!
            </p>
            <div className="buttons">
              <Button
                onClick={() =>
                  window.open("https://forms.gle/JSDH7tFag9hjida68", "_blank")
                }
              >
                Fill out survey
              </Button>
              <Button onClick={() => parseData()}>Check out the tool!</Button>
            </div>
            {loading === true && <Spinner />}
          </Card>
        </div>
      )}
      {loaded === true && (
        <FormChart
          repoData={repoData}
          data={data}
          weekList={weekList}
          monthList={monthList}
        />
      )}
    </React.Fragment>
  );
}

export default DemoComponent;
