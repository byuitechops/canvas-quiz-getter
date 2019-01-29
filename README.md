# Canvas Quiz Getter
### *Package Name*: canvas-quiz-getter

This module is built to be used by Brigham Young University - Idaho and utilizes the standard `module.exports => (course, stepCallback)` signature.


## Purpose
Occassionally there is a need to change quiz titles. This module was created to change the titles of specific quizzes, but can be modified to change other quiz titles.


## How to Install
```
npm install git+https://github.com/byuitechops/canvas-quiz-getter.git
```


## Options

Options included in cli.js:
```bash
Canvas Domain: (byui)
The subaccount number you would like to run this on: (8)
Would you like to run it on all the accounts under that number?: (false)
Where would you like to store the report? (i.e. ../reports): (./reports)
```


## Outputs

After the module has finished, a CSV file will be downloaded that will contain the following fields for each course:

`Course Name|Course ID|Old Name|New Name|New Link|Errors`


## Process

The tool will get a list of all courses in a specified Canvas account. For each course, it will:

    - Retreive all quizzes
    - Check each quiz title against the list of quiz titles that need to be changed
    - Make a put request to Canvas, updating the quiz title to the correct one
    - Log the changes made

It will then output a CSV with all of the changes made. More info on the CSV found in the `Outputs` section of this README.
