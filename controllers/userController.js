import User from '../models/user.js';
import bcrypt from 'bcryptjs';


export async function createUser(request, response) {

    const hashedPassword = bcrypt.hashSync(request.body.password, 10);

    const user = new User({
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        password: hashedPassword,
        email: request.body.email,
        role: request.body.role,
    });

    await user.save()
        .then(() => {
            response.json({
                message: 'User created successfully',
                user: user
            });
        })
        .catch((error) => {
            console.error('Error creating user:', error);

            response.status(500).json({
                message: 'Error creating user',
                error: error
            });
        });
}