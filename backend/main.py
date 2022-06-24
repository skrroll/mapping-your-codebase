from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from utils.date_utils import getMonthDates, getWeekDates
from database.crud import (
    getBranch,
    getMetricsFromTime,
    getRepository,
)
from database.database import SessionLocal, engine
from mining import init_repo
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Depends, FastAPI
from pydantic import BaseModel
import time

import database.model as model

model.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = ["http://localhost:3000/", "https://mapping-codebase-front.herokuapp.com/"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
) # config for local execution, to execute publicly available server this has to be changed


# data model received from the frontend
class RepoData(BaseModel):
    repName: str
    accessToken: str
    bname: str
    startTime: datetime
    endTime: datetime


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"Welcome to": "Metrico"}

# handling init request
@app.post("/init/")
def init(data: RepoData, db: Session = Depends(get_db)):
    start = time.time()
    print(data.startTime)
    print(data.endTime)
    
    # initialise repository
    ret_metrics = init_repo(
        db, data.repName, data.bname, data.accessToken, data.startTime, data.endTime
    )
    
    # calculate the dates of weeks
    weekList = []
    currTime = data.startTime
    endWeek = getWeekDates(data.endTime)
    while currTime <= endWeek["end"]:
        week = getWeekDates(currTime)
        weekList.append(week)
        currTime += timedelta(days=7)

    # calculate the dates of months
    endMonth = getMonthDates(data.endTime)
    currTime = data.startTime
    monthList = []
    while currTime <= endMonth["end"]:
        month = getMonthDates(currTime)
        monthList.append(month)
        currTime += timedelta(days=30)
    ret = {"metrics": ret_metrics, "weekList": weekList, "monthList": monthList}
    end = time.time()
    print("Elapsed time: " + str(end - start))
    return ret


# handling metrics request
@app.post("/metrics/")
def metrics(data: RepoData, db: Session = Depends(get_db)):
    start = time.time()
    db_repo = getRepository(db, data.repName)
    db_branch = getBranch(db, data.bname, db_repo.id)
    print(data.startTime)
    print(data.endTime)
    ms = getMetricsFromTime(db, db_branch.id, db_repo.id, data.startTime, data.endTime)
    end = time.time()
    print("Elapsed time: " + str(end - start))
    return ms
