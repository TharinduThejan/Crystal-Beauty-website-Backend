import mongoose from "mongoose";

const studentSchema = mongoose.Schema({
    name: String,
    age: Number,
    stream: String,
    email: String,
}
)
const Student = mongoose.model('Student', studentSchema)
export default Student;
