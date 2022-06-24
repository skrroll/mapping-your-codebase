from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel


class FileBase(BaseModel):
    name: str
    additions: int
    deletions: int


class File(FileBase):
    id: int
    commit_id: int


class CommitBase(BaseModel):
    sha: str
    additions: int
    deletions: int
    author: str
    created_at: datetime


class Commit(CommitBase):
    id: int
    repo: int
    files: List[File]


class BranchBase(BaseModel):
    name: str


class Branch(BranchBase):
    id: int
    repo: int
    commits: List[Commit]


class RepositoryBase(BaseModel):
    name: str
    startDate: datetime
    endDate: datetime


class Repository(RepositoryBase):
    id: int
    branches: List[Branch]
    commits: List[Commit]


class MetricsBase(BaseModel):
    repo: int
    branch: int
    name: str
    path: str
    startDate: datetime
    endDate: datetime
    commits_count: int
    contributors_count: int
    code_churn: int
    line_count: int
    pullRequests: int


class Metrics(MetricsBase):
    id: int


class FilePrBase(BaseModel):
    pull_request: int
    filename: str


class FilePr(FilePrBase):
    id: int


class PullRequestBase(BaseModel):
    title: str
    number: int
    repo: int
    created_at: datetime
    merged_at: Optional[datetime]


class PullRequest(PullRequestBase):
    id: int
    files_pr: List[FilePr]


def commitToSchema(commit):
    files = map(lambda f: fileToSchema(f), commit.files)
    return Commit(
        id=None,
        sha=commit.sha,
        additions=commit.additions,
        deletions=commit.deletions,
        author=commit.author,
        created_at=commit.created_at,
        repo=None,
        files=files,
    )


def fileToSchema(file):
    return File(
        name=file.filenam,
        additions=file.addtions,
        deletions=file.deletions,
        id=None,
        commit_id=None,
    )
