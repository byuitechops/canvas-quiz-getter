const canvas = require('canvas-api-wrapper');
const d3 = require('d3-dsv')
const fs = require('fs');
const path = require('path');

async function getAllQuizzes(course) {
    let quizzes = await canvas.get(`/api/v1/courses/${course.id}/quizzes`);
    console.log(`Got quizzes for ${course.name}`);
    return quizzes;
}
async function fixQuizzes(course, quizzes) {

    let quizzesToChange = [{
        oldTitle: 'W03 _ActivityType_: Mid-Semester Instructor Feedback',
        newTitle: 'W03 Student Feedback to Instructor'
    }, {
        oldTitle: 'W03 Quiz: Mid-Semester Instructor Feedback',
        newTitle: 'W03 Student Feedback to Instructor'
    }, {
        oldTitle: 'W05 _ActivityType_: Mid-Semester Instructor Feedback',
        newTitle: 'W05 Student Feedback to Instructor'
    }, {
        oldTitle: 'W05 ActivityType_: Mid-Semester Instructor Feedback',
        newTitle: 'W05 Student Feedback to Instructor'
    }, {
        oldTitle: 'W05 Feedback: Mid-Semester Instructor',
        newTitle: 'W05 Student Feedback to Instructor'
    }, {
        oldTitle: 'W05 Quiz: Mid-Semester Instructor Feedback',
        newTitle: 'W05 Student Feedback to Instructor'
    }, {
        oldTitle: 'W05 Mid-Semester Instructor Feedback',
        newTitle: 'W05 Student Feedback to Instructor'
    }, {
        oldTitle: 'W12 End-of-Semester Instructor Feedback',
        newTitle: 'W12 Student Evaluation of Instructor'
    }, {
        oldTitle: '12 End-of-Semester Instructor Feedback',
        newTitle: 'W12 Student Evaluation of Instructor'
    }];

    let quizLogs = [];
    for (let i = 0; i < quizzesToChange.length; i++) {
        // find the old quizzes
        let found = quizzes.filter(quiz => quiz.title === quizzesToChange[i].oldTitle);

        // if any old quizzes were found
        if (found.length > 0) {
            // catch the errors
            let errors = [];
            if (found.length > 1) {
                errors.push(`More than one ${quizzesToChange[i].oldTitle} found`);
                console.error(`More than one ${quizzesToChange[i].oldTitle} found`);
            }

            // change the titles in canvas
            let updatedQuiz;
            if (found.length > 0) {
                updatedQuiz = await canvas.put(`/api/v1/courses/${course.id}/quizzes/${found[0].id}`, {
                    'quiz[title]': quizzesToChange[i].newTitle
                });
                console.log(`Changed ${course.id} ${quizzesToChange[i].oldTitle} name to ${quizzesToChange[i].newTitle}`);
            }

            // return the log for the csv
            quizLogs.push({
                'Course Name': course.name,
                'Course ID': course.id,
                'Old Name': found[0].title,
                'New Name': updatedQuiz.title,
                'New Link': updatedQuiz.html_url,
                'Errors': JSON.stringify(errors)
            });
        }
    }

    return quizLogs;
}

async function getAllCourses(userInput) {
    // get all courses from the Master Courses subaccount (i.e. 42)
    let courses = await canvas.get(`/api/v1/accounts/${userInput.subaccount}/courses`, {
        sort: 'course_name',
        'include[]': 'subaccount',
        // search_term: 'seth childers'
    });

    // sort them alphabetically so I know where in the list the tool is at when running
    courses.sort((a, b) => {
        if (a.course_code > b.course_code) return 1;
        else if (a.course_code < b.course_code) return -1;
        else return 0;
    });

    // although we got everything under account 42, not
    // everything belongs to it since there are subaccounts
    if (userInput.includeNestedAccounts === true) {
        courses = courses.filter(course => course.account_id === userInput.subaccount);
    }
    return courses;
}

async function main(userInput) {
    // Pathway is not a subdomain
    canvas.subdomain = userInput.domain;

    // get all the courses
    let courses = await getAllCourses(userInput);
    // get the assignments for each course
    let quizLogs = [];
    for (let i = 0; i < courses.length; i++) {
        let quizzes = await getAllQuizzes(courses[i]);
        let logItem = await fixQuizzes(courses[i], quizzes);
        quizLogs = quizLogs.concat(logItem);
    }

    /* Format and create the CSV file with the log data */
    console.log('Formating csv');
    var csvData = d3.csvFormat(quizLogs, [
        "Course Name",
        "Course ID",
        "Old Name",
        "New Name",
        "New Link",
        "Errors"
    ]);

    // if the specified path doesn't exist, make it
    if (!fs.existsSync(path.resolve(userInput.saveDirectory))) {
        fs.mkdirSync(path.resolve(userInput.saveDirectory));
    }
    // write it all to a file
    console.log('Writing File');
    fs.writeFileSync(path.resolve(userInput.saveDirectory, 'changeLog.csv'), csvData);
}

module.exports = {
    main
};