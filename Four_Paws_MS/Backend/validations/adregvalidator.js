const { z } = require("zod");

const empRegisterValidator = z.object({

  first_name: z.string().min(2, "Your first name must be at least 2 characters"),

  last_name: z.string().min(2, "Your last name must be at least 2 characters"),

  address: z.string().min(5, "Your address must be at least 5 characters"),

  phone_number: z.string().min(10, "Your phone number must be include at least 10 numbers"),

  email: z.string().email("Invalid Email format"),

  date_of_birth: z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of Birth must be in YYYY-MM-DD format")
  .transform((str) => new Date(str)) 
  .refine(date => !isNaN(date.getTime()), "Invalid date")
  .refine(date => date <= new Date(), "Date of Birth cannot be in the future"),

  gender: z.enum(["Male","Female","Other"], "Invalid gender"),

  role: z.enum(["Admin","Doctor","Assistant Doctor","Pharmacist","Pet Shopper"], "Invalid role"),

    password: z.string().min(8, "Password must be at least 8 characters")
  .max(30, "Password must be at most 30 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[\W_]/, "Password must contain at least one special character"),

});

const validEMPRegister= (req,res,next) => {
    const validationresult =empRegisterValidator.safeParse(req.body);

    if(!validationresult.success) {
        return res.status(400).json({error: validationresult.error.errors});
    }
    next();
  }

module.exports = validEMPRegister;


