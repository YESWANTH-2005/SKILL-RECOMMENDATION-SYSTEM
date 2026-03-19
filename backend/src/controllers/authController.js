import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const ACCESS_TOKEN_TTL = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_TOKEN_TTL = process.env.JWT_REFRESH_EXPIRES_IN || "14d";

const createAccessToken = (user) =>
  jwt.sign({ id: user._id, email: user.email, type: "access" }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });

const createRefreshToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, type: "refresh", tokenVersion: user.tokenVersion || 0 },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL }
  );

const getRefreshExpiry = () => {
  const fallbackDays = 14;
  const configured = Number(process.env.JWT_REFRESH_EXPIRES_DAYS || fallbackDays);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + configured);
  return expiresAt;
};

const createAuthPayload = async (user) => {
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: getRefreshExpiry(),
  });

  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }

  await user.save();

  return {
    token: accessToken,
    accessToken,
    refreshToken,
  };
};

export const signup = async (req, res, next) => {
  try {
    const { name, email, password, knownSkills = [], interests = [] } = req.validatedBody || req.body;

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

    const authPayload = await createAuthPayload(user);

    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        knownSkills: user.knownSkills,
        interests: user.interests,
      },
      ...authPayload,
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody || req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const authPayload = await createAuthPayload(user);

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        knownSkills: user.knownSkills,
        interests: user.interests,
        savedSkills: user.savedSkills,
      },
      ...authPayload,
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

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.validatedBody || req.body;

    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    if (payload.type !== "refresh") {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const tokenExists = user.refreshTokens.some((item) => item.token === refreshToken);
    if (!tokenExists || payload.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ message: "Refresh token expired" });
    }

    user.refreshTokens = user.refreshTokens.filter((item) => item.token !== refreshToken);
    const authPayload = await createAuthPayload(user);

    return res.status(200).json(authPayload);
  } catch (error) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.validatedBody || req.body;
    const user = await User.findById(req.user.id);

    if (refreshToken) {
      user.refreshTokens = user.refreshTokens.filter((item) => item.token !== refreshToken);
    } else {
      user.refreshTokens = [];
      user.tokenVersion += 1;
    }

    await user.save();
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return next(error);
  }
};
