export function createUser(request, response) {
    const user = new User({
        firstname: request.body.firstname,
        lastname: request.body.lastname,
        password: request.body.password,
        email: request.body.email,
        role: request.body.role,
    });
}