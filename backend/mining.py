from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from typing import List
from database.schemas import BranchBase, MetricsBase, RepositoryBase, Commit
from utils.date_utils import daterange, getMonthDates, getWeekDates
from database.crud import (
    addCommitsToDatabase,
    addPullsToDatabase,
    createBranch,
    createMetrics,
    createRepository,
    getCommitsBetweenDates,
    getMetricsFromTime,
    getRepository,
    updateRepositoryDates,
)
from github import Github, Repository
from metrics import (
    get_code_churn,
    get_commit_count,
    get_contributors,
    get_line_count,
    get_pull_requests_per_file,
)
import time


def get_repo(repName: str, accessToken: str):
    g = Github(accessToken)
    return g.get_repo(repName)


def loadDataFromApi(
    db: Session,
    repo: Repository.Repository,
    branch: str,
    startTime: datetime,
    endTime: datetime,
):
    # load data from api
    cs = repo.get_commits(
        sha=branch, since=startTime, until=(endTime + timedelta(days=1))
    )
    print("Commits: " + str(len(list(cs))))
    addCommitsToDatabase(db, repo.full_name, branch, cs)
    # get issues
    issues = repo.get_issues(state="all", since=startTime)
    print("Issues: " + str(len(list(issues))))
    # filter out pull requests for a given time period
    pulls = list(filter(lambda x: x.pull_request, issues))
    pulls = list(map(lambda x: x.as_pull_request(), pulls))
    pulls = list(
        filter(
            lambda x: x.created_at.date() < endTime.date()
            and (not x.merged or x.merged_at.date() > startTime.date()),
            pulls,
        )
    )
    print("Pulls: " + str(len(list(pulls))))
    addPullsToDatabase(db, repo.full_name, pulls)

# initalsie metrics for a given time period
def init_metrics(
    db: Session,
    repo: str,
    branch: str,
    gitRepo: Repository.Repository,
    startTime: datetime,
    endTime: datetime,
):
    # metrics over a week
    currTime = startTime
    endWeek = getWeekDates(endTime)
    while currTime <= endWeek["end"]:
        week = getWeekDates(currTime)
        commits = getCommitsBetweenDates(db, branch, repo, week["start"], week["end"])
        addMetricsToDatabase(
            db, repo, branch, commits, week["start"], week["end"]
        )
        currTime += timedelta(days=7)

    # metrics over a month
    currTime = startTime
    endMonth = getMonthDates(endTime)

    while currTime <= endMonth["end"]:
        month = getMonthDates(currTime)
        commits = getCommitsBetweenDates(db, branch, repo, month["start"], month["end"])
        addMetricsToDatabase(
            db, repo, branch, commits, month["start"], month["end"]
        )
        currTime += timedelta(days=30)

# calculates and adds metrics for a specific time period to database
def addMetricsToDatabase(
    db: Session,
    repo: str,
    branch: str,
    commits: List[Commit],
    startDate: datetime,
    endDate: datetime,
):
    print(startDate)
    print(endDate)
    contributors = get_contributors(commits)
    code_churn = get_code_churn(commits)
    line_count = get_line_count(commits)
    commits_count = get_commit_count(commits)
    pull_requests = get_pull_requests_per_file(db, repo, startDate, endDate)
    for (k, v) in contributors.items():
        temp = k.rsplit("/", 1)
        pulls = pull_requests.get(k)
        if not pulls:
            pulls = 0
        db_metrics = createMetrics(
            db,
            MetricsBase(
                repo=repo,
                branch=branch,
                path=k,
                name=temp[-1],
                startDate=startDate,
                endDate=endDate,
                commits_count=commits_count[k],
                contributors_count=v,
                code_churn=code_churn[k],
                line_count=line_count[k],
                pullRequests=pulls,
            ),
        )

# initialise repository
def init_repo(
    db: Session,
    repName: str,
    bname: str,
    accessToken: str,
    startTime: datetime,
    endTime: datetime,
):
    r = get_repo(repName, accessToken)

    db_repo = getRepository(db, repName)

    db_branch = None
    if not db_repo:
        # case when repository have not been initalised
        print("not repo")
        db_repo = createRepository(
            db, RepositoryBase(name=repName, startDate=startTime, endDate=endTime)
        )
        db_branch = createBranch(db, BranchBase(name=bname), db_repo.id)
        loadDataFromApi(db, r, db_branch.name, startTime, endTime)
        init_metrics(db, db_repo.id, db_branch.id, r, startTime, endTime)
    elif not (
        db_repo.startDate.date() <= startTime.date()
        and db_repo.endDate.date() >= endTime.date()
    ):
        # case repository have been initalised but the time period does not match
        print("repo")
        newStartDate = db_repo.startDate
        newEndDate = db_repo.endDate
        db_branch = createBranch(db, BranchBase(name=bname), db_repo.id)

        if db_repo.startDate.date() > startTime.date():
            loadDataFromApi(
                db, r, bname, startTime + timedelta(days=1), db_repo.startDate
            )
            newStartDate = startTime

        if db_repo.endDate.date() < endTime.date():
            loadDataFromApi(db, r, bname, db_repo.endDate, endTime - timedelta(days=1))
            newEndDate = endTime
        init_metrics(db, db_repo.id, db_branch.id, r, startTime, endTime)

        updateRepositoryDates(
            db, RepositoryBase(name=repName, startDate=newStartDate, endDate=newEndDate)
        )
    else:
        # case when repository have been initalised and time period matches
        db_branch = createBranch(db, BranchBase(name=bname), db_repo.id)

    week = getWeekDates(endTime)
    return getMetricsFromTime(db, db_branch.id, db_repo.id, week["start"], week["end"])
