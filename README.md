# Mapping Your Codebase - Metrico

This repository contains a visualisation tool called Metrico. Metrico can generate visualisations of code metrics to investigate their relationship with risk management. 

### Prerequisites

To use Metrcio, you have to have installed:
- Python (recommended version 3.6+)
- Node (with npm)

### Running Metrico for the first time

Both the backend and frontend of our app are in this repository. To start using Metrico, we recommend starting the backend first and then the frontend. The following guide works for Linux and wsl (Windows subsystem for Linux).

To run the backend, a user has to:
- go into the **backend** directory
> pip install -r requirements.txt \
> uvicorn main:app

Note: You can also run a uvicorn server with --reload flag so that it updates automatically when you change the code.

To run frontend, a user has to:
- go into the frontend directory
> npm install \
> npm start

Now to access metrico, go to [localhost](http://localhost:3000/).

### Demo

You can also try a demo of Metrico under [this url.](https://mapping-codebase-front.herokuapp.com/)


### Report

The report is available under the report directory.