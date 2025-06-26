import Student from "../models/student.js"



export function getStudent(request, response) {
    Student.find()
        .then((data) => {
            response.json(data);
        })
        .catch((error) => {
            response.status(500).json({ message: 'Error retrieving students', error });
        });

}
export function saveStudent(request, response) {
    console.log(request.body);

    const student = new Student({
        name: request.body.name,
        age: request.body.age,
        stream: request.body.stream,
        email: request.body.email
    });

    student.save()
        .then(() => {
            response.json({
                message: 'Student added successfully'
            });
        })
        .catch(() => {
            response.json({
                message: 'Error adding student'
            });
        });
}