import "./FormChart.scss";
import CirclePackingChart from "../CirclePackingChart/CirclePackingChart";
import React, { useRef } from "react";
import { useState } from "react";
import Form from "react-bootstrap/Form";
import { Button, RadioGroup, Radio } from "@blueprintjs/core";
import { parse_paths, normalizeVal } from "../../d3-utils/utils";
import { get_metrics } from "../../api/api";
import { prettifyDate } from "../../d3-utils/date-utils";
import { Link } from "react-router-dom";

function FormChart(props) {
  const choiceVal = useRef();
  const choiceCol = useRef();
  const [flag, setFlag] = useState(0);
  const [sourceData, setSourceData] = useState({});
  const [repoData, setRepoData] = useState({
    startTime: new Date(),
    endTime: new Date(),
  });
  const [dateRange, setDateRange] = useState("week");
  const [index, setIndex] = useState(0);
  const [activeList, setActiveList] = useState([
    { start: "2022-04-30T16:49:47+00:00", end: "2022-04-30T16:49:47+00:00" }, // placeholder dates, immediately changed
  ]);

  React.useEffect(() => {
    setActiveList(props.weekList);
    setIndex(props.weekList.length - 1);
    setSourceData(props.data);
    setRepoData(props.repoData);
  }, []);

  const options = [
    <option key="line_count" value="line_count">
      Added lines count
    </option>,
    <option key="contributors_count" value="contributors_count">
      Contributors count
    </option>,
    <option key="commits_count" value="commits_count">
      Commits count
    </option>,
    <option key="code_churn" value="code_churn">
      Code churn
    </option>,
    <option key="pull_requests" value="pull_requests">
      Pull requests per file
    </option>,
  ];

  const onButtonClick = (a) => {
    setFlag(a);
  };

  const onChangeDateBack = () => {
    setIndex(index - 1);
  };

  const onChangeDateForward = () => {
    setIndex(index + 1);
  };

  React.useEffect(() => {
    if (dateRange === "week") {
      setIndex(props.weekList.length - 1);
      setActiveList(props.weekList);
    } else {
      setIndex(props.monthList.length - 1);
      setActiveList(props.monthList);
    }
  }, [dateRange]);

  React.useEffect(() => {
    const postData = repoData;

    if (activeList[index] === undefined || repoData.repName === undefined)
      return;

    const dateStart = new Date(activeList[index].start);
    const dateEnd = new Date(activeList[index].end);
    postData.startTime = dateStart;
    postData.endTime = dateEnd;
    get_metrics(postData).then((response) => {
      setSourceData(response.data);
      setRepoData(postData);
    });
  }, [index, activeList]);

  function parseData(data) {
    const ret = [];

    for (var i = 0; i < data.length; i++) {
      ret.push({
        group: data[i]["path"],
        value: data[i][choiceVal.current.value],
        color: data[i][choiceCol.current.value],
        metrics: data[i],
      });
    }
    const minVal = Math.min(...ret.map((o) => o.value));
    const maxVal = Math.max(...ret.map((o) => o.value));

    var result = ret.map((x) => ({
      group: x.group,
      value: normalizeVal(x.value, maxVal, minVal),
      color: x.color,
      metrics: x.metrics,
    }));
    return result;
  }

  return (
    <div className="FormChart">
      <Form className="form">
        <Form.Group className="mb-3">
          <Form.Label className="label">
            Select values to be represented by bubble size:
          </Form.Label>
          <br />
          <Form.Select ref={choiceVal} className="form-box">
            {options}
          </Form.Select>
          <br />
          <Form.Label className="label">
            Select values to be represented by color:
          </Form.Label>
          <br />
          <Form.Select ref={choiceCol} className="form-box">
            {options}
          </Form.Select>
          <br />
          <br />
          <Link to="/help" target="_blank" rel="noopener noreferrer">
            <Button
              icon="help"
              minimal="true"
              large="true"
              className="helpButton"
            />
          </Link>
          <Button
            className="button"
            onClick={() => onButtonClick(2)}
            icon="heatmap"
            intent="success"
            size="large"
          >
            Apply Metrics
          </Button>
        </Form.Group>
        <div className="secondRow">
          <RadioGroup
            onChange={(e) => setDateRange(e.target.value)}
            selectedValue={dateRange}
            inline="true"
          >
            <Radio label="week" value="week" />
            <Radio label="month" value="month" />
          </RadioGroup>
          {index > 0 && (
            <Button
              onClick={() => onChangeDateBack()}
              className="arrow-buttons"
              icon="circle-arrow-left"
              minimal="true"
            ></Button>
          )}
          <span className="dates">
            {prettifyDate(new Date(activeList[index].start))} -{" "}
            {prettifyDate(new Date(activeList[index].end))}
          </span>
          {index + 1 < activeList.length && (
            <Button
              onClick={() => onChangeDateForward()}
              className="arrow-buttons"
              icon="circle-arrow-right"
              minimal="true"
            ></Button>
          )}
        </div>
      </Form>
      {flag === 2 && (
        <CirclePackingChart data={parse_paths(parseData(sourceData))} />
      )}
    </div>
  );
}

export default FormChart;
