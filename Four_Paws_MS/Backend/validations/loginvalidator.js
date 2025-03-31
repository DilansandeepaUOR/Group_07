const {z} =require('zod');

const userLoginValidator=z.object({
    email: z.string().email('Invalid Email'),
    password: z.string().min(8).max(30)
});

const validLogin= (req, res, next) => {
    const validationresult=userLoginValidator.safeParse(req.body);

    if(!validationresult.success) {
        return res.status(400).json({ error: validationresult.error.errors });
    }

    next();
}

module.exports = validLogin;