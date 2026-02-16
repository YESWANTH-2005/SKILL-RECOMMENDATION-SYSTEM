import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const createToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

export const signup = async (req, res, next) => {
  try {
    const { name, email, password, knownSkills = [], interests = [] } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      knownSkills,
      interests,
    });

    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        knownSkills: user.knownSkills,
        interests: user.interests,
      },
      token: createToken(user),
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        knownSkills: user.knownSkills,
        interests: user.interests,
        savedSkills: user.savedSkills,
      },
      token: createToken(user),
    });
  } catch (error) {
    return next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
};
