from database.crud import getPullRequestsFromTime
from datetime import datetime
from sqlalchemy.orm import Session
from typing import List
from github import Commit, Repository


def get_pull_requests_per_file(
    db: Session, repo: Repository.Repository, startTime: datetime, endTime: datetime
):
    pulls = getPullRequestsFromTime(db, repo, startTime, endTime)
    # print(pulls)
    ret = {}
    for p in pulls:
        if p == None:
            continue
        files = p.files_pr
        for f in files:
            # print(f)
            try:
                ret[f.filename] = ret[f.filename] + 1
            except KeyError:
                ret[f.filename] = 1

    return ret


def get_contributors(commits: List[Commit.Commit]):
    ret = {}
    for c in commits:
        files = c.files
        for f in files:
            try:
                ret[f.name].add(c.author)
            except KeyError:
                ret[f.name] = {c.author}

    for (key, value) in ret.items():
        setVal = set(value)
        ret[key] = len(setVal)

    # print(ret)
    return ret


def get_code_churn(commits: List[Commit.Commit]):
    ret = {}
    for c in commits:
        files = c.files
        for f in files:
            try:
                ret[f.name] = ret[f.name] + f.additions - f.deletions
            except KeyError:
                ret[f.name] = f.additions - f.deletions

    # print(ret)
    return ret


def get_line_count(commits: List[Commit.Commit]):
    ret = {}
    for c in commits:
        files = c.files
        for f in files:
            try:
                ret[f.name] = ret[f.name] + f.additions
            except KeyError:
                ret[f.name] = f.additions
    # print(ret)
    return ret


def get_commit_count(commits: List[Commit.Commit]):
    ret = {}
    for c in commits:
        files = c.files
        for f in files:
            try:
                ret[f.name] = ret[f.name] + 1
            except KeyError:
                ret[f.name] = 1
    # print(ret)
    return ret
