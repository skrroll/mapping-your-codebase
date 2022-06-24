import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import { useState, useRef } from "react";
import FormGroup from "react-bootstrap/esm/FormGroup";
import FormLabel from "react-bootstrap/esm/FormLabel";
import FormControl from "react-bootstrap/esm/FormControl";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import FormChart from "../FormChart/FormChart";
import { get_repo_data } from "../../api/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { startOfWeek, endOfWeek } from "date-fns";
import { Card, Elevation, Button, Spinner } from "@blueprintjs/core";
import "./CredentialsForm.scss";
function CredentialsForm() {
  const accessToken = useRef();
  const repName = useRef();
  const branchName = useRef();
  const rangeTime = useRef();
  const [data, setData] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [repoData, setRepoData] = useState({});
  const [weekList, setWeekList] = useState([]);
  const [monthList, setMonthList] = useState([]);

  const parseData = () => {
    const post_data = {
      accessToken: accessToken.current.value,
      repName: repName.current.value,
      bname: branchName.current.value,
      startTime: startDate,
      endTime: endDate,
    };
    setLoading(true);
    get_repo_data(post_data).then((response) => {
      post_data.startTime = startOfWeek(post_data.endTime, { weekStartsOn: 1 });
      post_data.endTime = endOfWeek(post_data.endTime, { weekStartsOn: 1 });
      post_data.accessToken = "";
      //console.log(response)
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
        <div className="CredentialsForm">
          <Card className="card" elevation={Elevation.TWO}>
            <Form>
              <FormGroup>
                <h1 className="title">Metrico</h1>
                <FormLabel className="labels">Github Access token</FormLabel>
                <FormControl
                  type="password"
                  placeholder="Enter access token"
                  ref={accessToken}
                ></FormControl>
                <FormLabel className="labels">Repository name</FormLabel>
                <FormControl
                  type="text"
                  placeholder="Github/github"
                  ref={repName}
                ></FormControl>
                <FormLabel className="labels">Branch name</FormLabel>
                <FormControl
                  type="text"
                  placeholder="Branch name"
                  ref={branchName}
                ></FormControl>
                <FormLabel className="labels">Range of time</FormLabel>
                <div className="dates">
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                  />
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                  />
                </div>
              </FormGroup>
              <Button onClick={() => parseData()}>Submit</Button>
              {loading && <Spinner />}
            </Form>
          </Card>
        </div>
      )}
      {loaded === true && (
        <FormChart
          repoData={repoData}
          data={data}
          minDate={startDate}
          maxDate={endDate}
          weekList={weekList}
          monthList={monthList}
        />
      )}
    </React.Fragment>
  );
}

export default CredentialsForm;
