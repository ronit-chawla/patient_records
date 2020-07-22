require('dotenv').config();
const express = require('express');
const router = express.Router({ mergeParams: true });
const Patient = require('../models/patient');
const Report = require('../models/report');
const isLoggedIn = require('../middleware');

router.get('/new', isLoggedIn, (req, res) => {});
