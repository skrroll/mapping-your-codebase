import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import CredentialsForm from "./components/CredentialsForm/CredentialsForm";
import { Routes, Route } from "react-router-dom";
import HelpComponent from "./components/HelpComponent/HelpComponent";
import DemoComponent from "./components/DemoComponent/DemoComponent";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<CredentialsForm />}></Route>
        <Route path="/help" element={<HelpComponent />}></Route>
        {/* <Route path="/demo" element={<DemoComponent />}></Route> */}
      </Routes>
    </div>
  );
}

export default App;
