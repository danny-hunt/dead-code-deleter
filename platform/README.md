This is the platform that receives the code usage and stores it in a database. It also provides a web interface to view the code usage and can be used to trigger agent calls that remove unused code.

RECEIVE MESSAGE

metric message:

- repo
- function name
- file name
- start line number
- end line number
- call count since last message

receives metric[]

stores them in an aggregated

SHOW METRICS

repo data:
function by function breakdown
usage metrics function (name, file name):
name,
call count
line number
file name

    static tree of repo
    function tree
    line-by-line git blame (aggregated by function)

    static analysis function (name, file name):
        start line
        end line
        callers
        callees

Views:
Call graph
Rank your functions by call count / time
Authorship metric (who has written the most used code?)
^Leaderboard(?)
