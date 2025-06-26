export function createUser(request, response) {
    const user = new User({
        firstname: request.body.firstname,
        lastname: request.body.lastname,
        password: request.body.password,
        email: request.body.email,
        role: request.body.role,
    });
    user.save()
        .then(() => {
            response.json({
                message: 'User created successfully',
                user: user
            });
        })
        .catch((error) => {
            response.status(500).json({
                message: 'Error creating user',
                error: error
            });
        });
}