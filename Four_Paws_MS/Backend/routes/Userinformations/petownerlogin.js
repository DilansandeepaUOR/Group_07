const express=require('express');
const router=express.Router();
const db=require('../../db');
const bcrypt= require('bcrypt');
const validLogin=require('../../validations/loginvalidator');

router.use(express.json());
router.use(express.urlencoded({extended: true}));

router.use((req,res,next) => {
    console.log(`${req.method} request for '${req.url}'`);
    next();
});


