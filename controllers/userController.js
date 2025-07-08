import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function createUser(request, response) {
    if (request.body.role == "admin") {
        if (request.user != null) {
            if (request.user.role !== 'admin') {
                response.status(403).json({
                    message: 'you are not authorized to create an admin user'
                });
                return;
            }

        } else {
            response.status(403).json({
                message: 'you are not authorized to create an admin user'
            });
            return;
        }
    }

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
export function loginUser(request, response) {
    const email = request.body.email;
    const password = request.body.password;

    User.findOne({ email: email })
        .then((user) => {
            if (user == null) {
                response.status(404).json({
                    message: 'User not found'
                })
            }
            else {
                const isPasswordCorrect = bcrypt.compareSync(password, user.password)
                if (isPasswordCorrect) {
                    const token = jwt.sign(
                        {
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            role: user.role,
                            img: user.img
                        },
                        "cbc-batch-five#@2025"
                    )
                    response.json({
                        message: 'Login successful',
                        token: token,
                    })
                }
                else {
                    response.status(401).json({
                        message: 'Invalid password'
                    })
                }
            }
        }
        )
}
