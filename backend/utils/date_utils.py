from datetime import timedelta, datetime
from dateutil.relativedelta import relativedelta


def daterange(start_date, end_date):
    for i in range(int((end_date - start_date).days + 1)):
        yield start_date + timedelta(i)


def gitDateToDatetime(date):
    return datetime.strptime(date, "%a, %d %b %Y %H:%M:%S %Z")

# returns dates of a week of a given date
def getWeekDates(date):
    start = date - timedelta(days=date.weekday())
    end = start + timedelta(days=6)
    return {"start": start, "end": end}

# returns dates of a month of a given date
def getMonthDates(date):
    start = date - timedelta(days=(date.day)) + timedelta(days=1)
    end = start + relativedelta(months=1) - timedelta(days=1)
    return {"start": start, "end": end}
