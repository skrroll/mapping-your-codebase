import axios from "axios";

async function get_repo_data(data) {
  return await axios.post("http://127.0.0.1:8000/init/", data);
}

async function get_metrics(data) {
  return await axios.post("http://127.0.0.1:8000/metrics/", data);
}

export { get_repo_data, get_metrics };
