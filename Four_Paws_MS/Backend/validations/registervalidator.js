const { z } = require("zod");

const userRegisterValidator = z.object({

  name: z.string().min(2, "Your name must be at least 2 characters"),

  address: z.string().min(5, "Your address must be at least 5 characters"),

  phone: z.string().min(10, "Your phone number must be include at least 10 numbers"),

  email: z.string().email("Invalid Email format"),

  petName: z.string().max(50, "Pet name must be at most 50 characters").regex(/^[A-Za-z\s]+$/, "Pet name must only contain letters and spaces"),

  petAge: z.string()
  .regex(/^\d+$/, "Pet age must be a number") 
  .transform(Number) 
  .refine(age => age > 0, "Pet age must be a positive number"),

  petType: z.enum(["dog", "cat", "cow","other"], "Invalid pet type"),

  confirmPassword: z.string().min(8, "Password must be at least 8 characters")
  .max(30, "Password must be at most 30 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[\W_]/, "Password must contain at least one special character"),

});

const validRegister= (req,res,next) => {
    const validationresult =userRegisterValidator.safeParse(req.body);

    if(!validationresult.success) {
        return res.status(400).json({error: validationresult.error.errors});
    }
    next();
  }

module.exports = validRegister;


