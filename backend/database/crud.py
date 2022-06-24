from datetime import datetime
from typing import Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from utils.date_utils import gitDateToDatetime
from database.model import (
    Branch,
    PullRequest,
    Repository,
    Commit,
    File,
    Metrics,
    FilePr,
)
import database.schemas as schemas


def getRepository(db: Session, name: str):
    return db.query(Repository).filter(Repository.name == name).first()


def getBranch(db: Session, name: str, repo: int):
    return db.query(Branch).filter(Branch.name == name, Branch.repo == repo).first()


def getBranches(db: Session, repo: int):
    return db.query(Repository.branches).filter(Repository.id == repo).all()


def getCommit(db: Session, sha: str, repo: int):
    return db.query(Commit).filter(Commit.sha == sha, Commit.repo == repo).first()


def getAllCommitsFromRepo(db: Session, repo: int):
    return db.query(Commit).filter(Commit.repo == repo).all()


def getCommitsFromBranch(db: Session, branch: int, repo: int):
    q = (
        db.query(Commit)
        .join(Commit.branches)
        .filter(Branch.id == branch, Commit.repo == repo)
    )
    return q.all()


def getCommitsFromDay(db: Session, branch: int, repo: int, date: datetime):
    q = db.query(Commit).filter(
        Commit.repo == repo,
        Commit.branches.any(id=branch),
        func.DATE(Commit.created_at) == date.date(),
    )
    return q.all()


def getCommitsBetweenDates(
    db: Session, branch: int, repo: int, date1: datetime, date2: datetime
):
    return (
        db.query(Commit)
        .filter(
            Commit.repo == repo,
            Commit.branches.any(id=branch),
            func.DATE(Commit.created_at) >= date1.date(),
            func.DATE(Commit.created_at) <= date2.date(),
        )
        .all()
    )


def getFile(db: Session, commit_id: int, filename: str):
    return (
        db.query(File)
        .filter(File.name == filename, File.commit_id == commit_id)
        .first()
    )


def getMetrics(
    db: Session,
    name: str,
    branch: int,
    repo: int,
    startDate: datetime,
    endDate: datetime,
):
    return (
        db.query(Metrics)
        .filter(
            Metrics.name == name,
            Metrics.branch == branch,
            Metrics.repo == repo,
            func.DATE(Metrics.startDate) == startDate.date(),
            func.DATE(Metrics.endDate) == endDate.date(),
        )
        .first()
    )


def getMetricsFromTime(
    db: Session, branch: int, repo: int, startDate: datetime, endDate: datetime
):
    return (
        db.query(Metrics)
        .filter(
            Metrics.branch == branch,
            Metrics.repo == repo,
            func.DATE(Metrics.startDate) == startDate.date(),
            func.DATE(Metrics.endDate) == endDate.date(),
        )
        .all()
    )


def getAllMetrics(db: Session, branch: int, repo: int):
    return (
        db.query(Metrics).filter(Metrics.branch == branch, Metrics.repo == repo).all()
    )


def getPullRequest(db: Session, repo: int, number: int):
    return (
        db.query(PullRequest)
        .filter(PullRequest.number == number, PullRequest.repo == repo)
        .first()
    )


def getPullRequestsFromTime(
    db: Session, repo: int, startTime: datetime, endTime: datetime
):
    return (
        db.query(PullRequest)
        .filter(
            PullRequest.repo == repo,
            PullRequest.created_at < endTime,
            (PullRequest.merged_at.is_(None)) | (PullRequest.merged_at > startTime),
        )
        .all()
    )


def getPulls(db: Session, repo: int):
    return db.query(PullRequest).filter(PullRequest.repo == repo).all()


def getFilePr(db: Session, pull: int, filename: str):
    return (
        db.query(FilePr)
        .filter(FilePr.pull == pull, FilePr.filename == filename)
        .first()
    )


def updateRepositoryDates(db: Session, repo: schemas.RepositoryBase):
    db_repo = getRepository(db, repo.name)
    db_repo.startDate = repo.startDate
    db_repo.endDate = repo.endDate
    db.commit()
    db.refresh(db_repo)
    return db_repo


def createRepository(db: Session, repo: schemas.RepositoryBase):
    db_repo = getRepository(db, repo.name)
    if not db_repo:
        # print("repo")
        db_repo = Repository(
            id=None, name=repo.name, startDate=repo.startDate, endDate=repo.endDate
        )
        db.add(db_repo)
        db.commit()
        db.refresh(db_repo)
    return db_repo


def createBranch(db: Session, branch: schemas.BranchBase, repo_id: int):
    db_branch = getBranch(db, branch.name, repo_id)
    if not db_branch:
        # print("branch")
        db_branch = Branch(id=None, name=branch.name, repo=repo_id)
        db.add(db_branch)
        db.commit()
        db.refresh(db_branch)
    return db_branch


def createCommit(db: Session, commit: schemas.CommitBase, repo_id: int):
    db_commit = getCommit(db, commit.sha, repo_id)
    if not db_commit:
        # print("commit")
        db_commit = Commit(
            id=None,
            sha=commit.sha,
            additions=commit.additions,
            deletions=commit.deletions,
            author=commit.author,
            created_at=commit.created_at,
            repo=repo_id,
        )
        db.add(db_commit)
        db.commit()
        db.refresh(db_commit)
    return db_commit


def createFile(db: Session, file: schemas.FileBase, commit_id: int):
    db_file = getFile(db, commit_id, file.name)
    if not db_file:
        # print("file")
        db_file = File(
            id=None,
            name=file.name,
            additions=file.additions,
            deletions=file.deletions,
            commit_id=commit_id,
        )
        db.add(db_file)
        db.commit()
        db.refresh(db_file)
    return db_file


def createMetrics(db: Session, metrics: schemas.MetricsBase):
    db_m = getMetrics(
        db,
        metrics.name,
        metrics.branch,
        metrics.repo,
        metrics.startDate,
        metrics.endDate,
    )
    if not db_m:
        db_m = Metrics(
            id=None,
            repo=metrics.repo,
            branch=metrics.branch,
            name=metrics.name,
            path=metrics.path,
            startDate=metrics.startDate,
            endDate=metrics.endDate,
            commits_count=metrics.commits_count,
            contributors_count=metrics.contributors_count,
            code_churn=metrics.code_churn,
            line_count=metrics.line_count,
            pull_requests=metrics.pullRequests,
        )
        db.add(db_m)
        db.commit()
        db.refresh(db_m)
    return db_m


def createPullRequest(db: Session, schema: schemas.PullRequestBase):
    db_pr = getPullRequest(db, schema.repo, schema.number)
    if not db_pr:
        db_pr = PullRequest(
            id=None,
            title=schema.title,
            number=schema.number,
            repo=schema.repo,
            created_at=schema.created_at,
            merged_at=schema.merged_at,
        )
        db.add(db_pr)
        db.commit()
        db.refresh(db_pr)
    return db_pr


def createFilePr(db: Session, schema: schemas.FilePrBase):
    db_fpr = getFilePr(db, schema.pull_request, schema.filename)
    if not db_fpr:
        db_fpr = FilePr(id=None, filename=schema.filename, pull=schema.pull_request)
        db.add(db_fpr)
        db.commit()
        db.refresh(db_fpr)
    return db_fpr


def addCommitsToDatabase(db: Session, repo: str, branch: str, commits: Any):
    db_repo = getRepository(db, repo)
    db_branch = createBranch(db, schemas.BranchBase(name=branch), db_repo.id)
    retCommits = []
    fileCount = 0
    for c in commits:
        commit = schemas.CommitBase(
            sha=c.sha,
            additions=c.stats.additions,
            deletions=c.stats.deletions,
            author=c.author.login,
            created_at=gitDateToDatetime(c.last_modified),
        )
        db_commit = createCommit(db, commit, db_repo.id)
        for f in c.files:
            file = schemas.FileBase(
                name=f.filename, additions=f.additions, deletions=f.deletions
            )
            db_file = createFile(db, file, db_commit.id)
        fileCount += len(list(c.files))
        db_branch.commits.append(db_commit)
        db.commit()
        retCommits.append(db_commit)
    print(fileCount)
    return retCommits


def addPullsToDatabase(db: Session, repo: str, pulls: Any): # pulls should be a List of Pull Request objects from git API
    db_repo = getRepository(db, repo)
    fileCountPr = 0
    for p in pulls:
        pull = schemas.PullRequestBase(
            title=p.title,
            number=p.number,
            repo=db_repo.id,
            created_at=p.created_at,
            merged_at=p.merged_at,
        )
        db_pull = createPullRequest(db, pull)
        files = p.get_files()
        for f in files:
            file = schemas.FilePrBase(pull_request=db_pull.id, filename=f.filename)
            db_file = createFilePr(db, file)
            fileCountPr += len(list(files))
    print(fileCountPr)
    db.commit()
