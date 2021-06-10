const inquirer = require("inquirer")
const mysql = require("mysql2")
const cTable = require('console.table');


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Getback96!',
    database: 'week12'
});

let question = [{
    message: 'What do you want to do?',
    name: 'action',
    type: 'list',
    choices: ["View all departments", "View all roles", "View all employees",
        "add a department", "add a role", "add an employee", "update employee roles", "end"]
}];


function viewAllDepartments() {
    connection.query('SELECT * FROM departments', function (err, departments) {
        console.table(departments);
        start()
    });
}


function viewAllRoles() {
    connection.query('SELECT title, salary, name as Department FROM roles JOIN departments ON roles.department_id = departments.id', function (err, roles) {

        console.table(roles);
        start()
    })


}


function viewAllEmployees() {
    connection.query(`Select 
	    employee.first_name, employee.last_name, title, salary,
	    manager.first_name as manager from employees as employee
	    JOIN roles ON employee.role_id = roles.id

	    LEFT JOIN employees as manager ON
	    employee.manager_id = manager.id`, function (err, employees) {
        console.table(employees);
        start();
    });


}


function addDepartment() {
    inquirer.prompt([
        {
            name: 'department',
            message: 'Enter the department name:',
            type: 'input'
        }
    ])
        .then(answer => {
            connection.query('INSERT INTO departments (name) VALUES(?)', [answer.department])
            start()
        })
}


function addRole() {
    connection.query('SELECT * FROM departments', function (err, departments) {
        console.log(departments);
        const departmentsArr = [];
        departments.forEach(department => {
            departmentsArr.push(department.name);
        })
        inquirer.prompt([
            {
                name: 'title',
                message: 'Enter the job title:',
                type: 'input'
            },
            {
                name: "salary",
                message: "What is your salary",
                type: 'input',
            },
            {
                name: "department",
                message: 'Select the department this role belongs to',
                type: 'list',
                choices: departmentsArr
            }
        ])
            .then(answers => {
                let departmentId = 0;
                departments.forEach(department => {
                    if (department.name === answers.department) {
                        departmentId = department.id;
                    }
                })
                connection.query('INSERT INTO roles (title, salary, department_id) values(?, ?, ?)', [answers.title, answers.salary, departmentId])
                start();
            })
    })
}


function addEmployee() {
    connection.query('Select id, title from roles', function (err, roles) {
        const rolesArr = [];
        roles.forEach(role => {
            rolesArr.push(role.title);
        })
        connection.query('SELECT id, first_name FROM employees', function (err, managers) {
            const managersArr = [];
            managers.forEach(employee => {
                managersArr.push(employee.first_name);
            })
            managersArr.push('none');
            inquirer.prompt([
                {
                    name: 'first_name',
                    message: 'Enter your first name',
                    type: 'input'


                },
                {
                    name: 'last_name',
                    message: 'Enter your last name',
                    type: 'input'


                },
                {
                    name: "role",
                    message: 'Select your role',
                    type: 'list',
                    choices: rolesArr
                },
                {
                    name: "manager",
                    message: 'Select your manager',
                    type: 'list',
                    choices: managersArr
                }
            ])
                .then(answers => {
                    let roleId = 0;
                    roles.forEach(role => {
                        if (role.title === answers.role) {
                            roleId = role.id;
                        }
                    })
                    let managerId = null;
                    managers.forEach(manager => {
                        if (manager.first_name === answers.manager) {
                            managerId = manager.id;
                        }
                    })
                    connection.query('INSERT INTO employees (first_name, last_name, role_id, manager_id) values(?,?,?,?)'
                        , [answers.first_name, answers.last_name, roleId, managerId]);
                    start();
                })
        })








    })
}


function updateEmployee() {
    connection.query('Select id, title from roles', function (err, roles) {
        const rolesArr = [];
        roles.forEach(role => {
            rolesArr.push(role.title);
        })
        connection.query('SELECT id, first_name, last_name FROM employees', function (err, employees) {
            const employeesArr = [];
            employees.forEach(employee => {
                employeesArr.push(employee.first_name + ' ' + employee.last_name);
            })


            inquirer.prompt([


                {
                    name: "employee",
                    message: 'Who do you want to update?',
                    type: 'list',
                    choices: employeesArr
                }
            ])
                .then(answer => {
                    let employeeId = 0;
                    employees.forEach(employee => {
                        if (employee.first_name + ' ' + employee.last_name === answer.employee) {
                            employeeId = employee.id;
                        }
                    })
                    inquirer.prompt([


                        {
                            name: "role",
                            message: 'What is their new role?',
                            type: 'list',
                            choices: rolesArr
                        }
                    ])
                        .then(answer => {
                            roles.forEach(role => {
                                if (role.title === answer.role) {
                                    roleId = role.id;
                                }
                            })
                            connection.query('UPDATE employees SET role_id = ? WHERE id = ?'
                                , [roleId, employeeId]);
                            start();
                        })




                })
        })
    })




}



function start() {
    inquirer.prompt(question)
        .then(answer => {
            if (answer.action === "View all departments") {
                viewAllDepartments();
            } else if (answer.action === 'View all roles') {
                viewAllRoles();


            } else if (answer.action === 'View all employees') {
                viewAllEmployees();
            }
            else if (answer.action === 'add a role') {
                addRole();

            } else if (answer.action === 'add an employee') {
                addEmployee();
            }

            else if (answer.action === 'add a department') {
                addDepartment();
            } else if (answer.action === 'update employee roles') {
                updateEmployee();
            }

            else {
                console.log("Goodbye")
                connection.end();
            }

        })

}

connection.connect((err) => {
    if (err) throw err;
    start();
});

