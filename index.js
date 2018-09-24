const canvas = require('canvas-api-wrapper');
const d3 = require('d3-dsv')
const fs = require('fs');

async function getAllQuizzes(course) {
    let assignments = await canvas.get(`/api/v1/courses/${course.id}/quizzes`);
    console.log(`Got quizzes for ${course.name}`);

    let returnObjs = assignments.map(assignment => {
        return {
            'Course Name': course.name,
            'Course ID': course.id,
            'Assignment Name': assignment.name,
            'Link to Assignment': assignment.html_url,
        }
    });
    return returnObjs;
}

async function getAllCourses() {
    // get all courses from the Master Courses subaccount (i.e. 42)
    let courses = await canvas.get(`/api/v1/accounts/42/courses`, {
        sort: 'course_name',
        'include[]': 'subaccount'
    });

    // sort them alphabetically so I know where in the list the tool is at when running
    courses.sort((a, b) => {
        if (a.course_code > b.course_code) return 1;
        else if (a.course_code < b.course_code) return -1;
        else return 0;
    });

    // although we got everything under account 42, not
    // everything belongs to it since there are subaccounts
    courses = courses.filter(course => course.account_id === 42)
    return courses;
}

async function main() {
    // get all the courses
    let courses = await getAllCourses();
    // get the assignments for each course
    let assignments = [];
    for (let i = 0; i < courses.length; i++) {
        let logItem = await getAllQuizzes(courses[i]);
        assignments = assignments.concat(logItem);
    }
    console.log('Formating csv');
    /* Format and create the CSV file with the log data */
    var csvData = d3.csvFormat(assignments, ["Course Name", "Course ID", "Assignment Name", "Link to Assignment"]);
    console.log(csvData);
    
    // write it all to a file
    console.log('Writing File');
    fs.writeFileSync('Canvas-Master-Course-Quizzes.csv', csvData);
}

main();