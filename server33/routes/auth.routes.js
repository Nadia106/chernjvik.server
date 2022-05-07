const express = require("express");
// const bcrypt = require("bcryptjs");
const { check } = require("express-validator");
// const User = require("../models/User");
// const { generateUserData } = require("../utils/helpers");
const controller = require("../middleware/authController");
const tokenService = require("../services/token.service");
// const Role = require("../models/Role");
const auth = require("../middleware/auth.middleware");
const router = express.Router({ mergeParams: true });
const role = require("../middleware/roleMiddleware");

router.post(
  "/signUp",
  [
    check("email", "Некорректный email").isEmail(),
    check("password", "Минимальная длина пароля 8 символов").isLength({
      min: 8
    })
  ],
  controller.signUp
);
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({
//           error: {
//             message: "INVALID_DATA",
//             code: 400
//           }
//         });
//       }

//       const { email, password } = req.body;
//       const existingUser = await User.findOne({ email });
//       if (existingUser) {
//         return res.status(400).json({
//           error: {
//             message: "EMAIL_EXISTS",
//             code: 400
//           }
//         });
//       }

//       const hashedPassword = await bcrypt.hash(password, 12);
//       const userRole = await Role.findOne({value: "USER"})
//       const newUser = await User.create({
//         ...generateUserData(),
//         ...req.body,
//         password: hashedPassword,
//         roles: [userRole.value]
//       });
//       const tokens = tokenService.generate({ _id: newUser._id, roles: newUser.roles });
//       await tokenService.save(newUser._id, tokens.refreshToken);

//       res.status(201).send({ ...tokens, roles: [userRole.value], userId: newUser._id });
//     } catch (e) {
//       res.status(500).json({
//         message: "На сервере произошла ошибка, попробуйте позже."
//       });
//     }
//   }
// ]);

router.post(
  "/signInWithPassword",
  [
    check("email", "email некорректный").normalizeEmail().isEmail(),
    check("password", "пароль не может быть пустым").exists()
  ],
  controller.signInWithPassword
);
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({
//           error: {
//             message: "INVALID_DATA",
//             code: 400
//           }
//         });
//       }

//       const { email, password } = req.body;

//       const existingUser = await User.findOne({ email });

//       if (!existingUser) {
//         return res.status(400).send({
//           error: {
//             message: "EMAIL_NOT_FOUND",
//             code: 400
//           }
//         });
//       }

//       const isPasswordEqual = await bcrypt.compare(
//         password,
//         existingUser.password
//       );

//       if (!isPasswordEqual) {
//         return res.status(400).send({
//           error: {
//             message: "INVALID_PASSWORD",
//             code: 400
//           }
//         });
//       }

//       const tokens = tokenService.generate({
//         _id: existingUser._id,
//         roles: existingUser.roles
//       });
//       await tokenService.save(existingUser._id, tokens.refreshToken);

//       res.status(200).send({ ...tokens, userId: existingUser._id });
//     } catch (e) {
//       res.status(500).json({
//         message: "На сервере произошла ошибка, попробуйте позже."
//       });
//     }
//   }
// ]);
function isTokenInvalid(data, dbToken) {
  return !data || !dbToken || data._id !== dbToken?.user?.toString();
}

router.post("/token", async (req, res) => {
  try {
    const { refresh_token: refreshToken } = req.body;
    const data = tokenService.validateRefresh(refreshToken);
    const dbToken = await tokenService.findToken(refreshToken);

    if (isTokenInvalid(data, dbToken)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const tokens = await tokenService.generate({
      _id: data._id,
      roles: data.roles
    });
    //  и тут тоже как с рольями поступать
    await tokenService.save(data._id, tokens.refreshToken);

    res.status(200).send({ ...tokens, userId: data._id });
  } catch (e) {
    res.status(500).json({
      message: "На сервере произошла ошибка. Попробуйте позже"
    });
  }
});

router.get("/users", role(["USER", "ADMIN"]), controller.getUsers);

module.exports = router;
