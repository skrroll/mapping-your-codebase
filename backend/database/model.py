from sqlite3 import Date
from sqlalchemy.orm import relationship
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Table
from database.database import Base


# many-to-many relationship represented as a Table
branches_to_commits = Table(
    "branches_to_commits",
    Base.metadata,
    Column("branch_id", ForeignKey("branch.id"), primary_key=True),
    Column("commit_id", ForeignKey("commit.id"), primary_key=True),
)

# Models representing the data stored in the database
# For more information you can look into sqlalchemy docummentation
# https://docs.sqlalchemy.org/en/14/orm/tutorial.html

class Repository(Base):
    __tablename__ = "repository"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    startDate = Column(DateTime, nullable=False)
    endDate = Column(DateTime, nullable=False)
    commits = relationship("Commit", backref="repository")
    branches = relationship("Branch", backref="repository")
    pullRequests = relationship("PullRequest", backref="repository")


class Branch(Base):
    __tablename__ = "branch"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    repo = Column(Integer, ForeignKey("repository.id"))
    commits = relationship(
        "Commit", secondary=branches_to_commits, back_populates="branches"
    )


class Commit(Base):
    __tablename__ = "commit"
    id = Column(Integer, primary_key=True)
    sha = Column(String, unique=True, nullable=False)
    repo = Column(Integer, ForeignKey("repository.id"))
    additions = Column(Integer, nullable=False)
    deletions = Column(Integer, nullable=False)
    author = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)
    branches = relationship(
        "Branch", secondary=branches_to_commits, back_populates="commits"
    )
    files = relationship("File", backref="commit")


class File(Base):
    __tablename__ = "file"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    commit_id = Column(Integer, ForeignKey("commit.id"))
    additions = Column(Integer, nullable=False)
    deletions = Column(Integer, nullable=False)


class Metrics(Base):
    __tablename__ = "metrics"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    path = Column(String, nullable=False)
    repo = Column(Integer, ForeignKey("repository.id"))
    branch = Column(Integer, ForeignKey("branch.id"))
    startDate = Column(DateTime, nullable=False)
    endDate = Column(DateTime, nullable=False)
    commits_count = Column(Integer, nullable=False)
    contributors_count = Column(Integer, nullable=False)
    code_churn = Column(Integer, nullable=False)
    line_count = Column(Integer, nullable=False)
    pull_requests = Column(Integer, nullable=False)


class PullRequest(Base):
    __tablename__ = "pull_request"
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    repo = Column(Integer, ForeignKey("repository.id"))
    number = Column(Integer, nullable=False)
    created_at = Column(DateTime, nullable=False)
    merged_at = Column(DateTime, nullable=True)
    files_pr = relationship("FilePr", backref="pull_request")


class FilePr(Base):
    __tablename__ = "filepr"
    id = Column(Integer, primary_key=True)
    pull = Column(Integer, ForeignKey("pull_request.id"))
    filename = Column(String, nullable=False)
