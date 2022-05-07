const User = require("../models/User");
const Role = require("../models/Role");
const chalk = require("chalk");
// const express = require("express");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { generateUserData } = require("../utils/helpers");
const tokenService = require("../services/token.service");

class authController {
  async signUp(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: {
            message: "INVALID_DATA",
            code: 400
          }
        });
      }

      const { email, password } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          error: {
            message: "EMAIL_EXISTS",
            code: 400
          }
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const userRole = await Role.findOne({ value: "USER" });
      const newUser = await User.create({
        ...generateUserData(),
        ...req.body,
        password: hashedPassword,
        roles: [userRole.value]
      });
      const tokens = tokenService.generate({
        _id: newUser._id,
        roles: newUser.roles
      });
      await tokenService.save(newUser._id, tokens.refreshToken);
      //вот тут как правильно сделать, роль не потеряется?
      res
        .status(201)
        .send({ ...tokens, roles: [userRole.value], userId: newUser._id });
    } catch (e) {
      res.status(500).json({
        message: "На сервере произошла ошибка, попробуйте позже."
      });
    }
  }

  async signInWithPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: {
            message: "INVALID_DATA",
            code: 400
          }
        });
      }

      const { email, password } = req.body;

      const existingUser = await User.findOne({ email });

      if (!existingUser) {
        return res.status(400).send({
          error: {
            message: "EMAIL_NOT_FOUND",
            code: 400
          }
        });
      }

      const isPasswordEqual = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (!isPasswordEqual) {
        return res.status(400).send({
          error: {
            message: "INVALID_PASSWORD",
            code: 400
          }
        });
      }

      const tokens = tokenService.generate({
        _id: existingUser._id,
        roles: existingUser.roles
      });
      await tokenService.save(existingUser._id, tokens.refreshToken);
      // и здесь тот же вопрос, все в порядке будет?
      res.status(200).send({ ...tokens, userId: existingUser._id });
    } catch (e) {
      res.status(500).json({
        message: "На сервере произошла ошибка, попробуйте позже."
      });
    }
  }

  async getUsers(req, res) {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({
        message: "На сервере произошла ошибка, попробуйте позже."
      });
    }
  }
}

module.exports = new authController();
