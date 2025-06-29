import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
// import Student from './models/student.js';
import studentRouter from './routes/studentRouter.js';
import productRouter from './routes/productRouter.js';
import userRouter from './routes/userRoute.js';
// mongodb+srv://admin:123@cluster0.bjxqvw0.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0

const app = express();
app.use(bodyParser.json());
mongoose.connect('mongodb+srv://admin:123@cluster0.bjxqvw0.mongodb.net/dev?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

app.use('/students', studentRouter);

app.use('/products', productRouter);
app.use('/users', userRouter);

// app.get('/', (request, response) => {
//     Student.find()
//         .then((data) => {
//             response.json(data)
//         })

// });



// app.post('/', (request, response) => {
//     console.log(request.body);




//     const student = new Student({
//         name: request.body.name,
//         age: request.body.age,
//         stream: request.body.stream,
//         email: request.body.email
//     })

//     student.save()
//         .then(() => {
//             response.json({
//                 message: 'Student added successfully'
//             })
//         })
//         .catch(() => {
//             response.json({
//                 message: 'Error adding student'
//             })
//         })
// })

// app.put('/', (request, response) => {
//     console.log(request.body);
// });

// app.delete('/', (request, response) => {
//     console.log('This is delete request');
// });
function successfullyStarted() {
    console.log('Server is running successfully in port 3000');
}
app.listen(3000, successfullyStarted)