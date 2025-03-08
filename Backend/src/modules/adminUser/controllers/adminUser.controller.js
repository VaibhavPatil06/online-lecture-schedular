import multer from "multer";
import { signJwt } from "../../../utils/auth.js";
import { decrypt } from "../../../utils/decryptPassword.js";
import UserModel from "../schema/admin-user.schema.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

export const me = async (req, res) => {
  try {
    const userDetails = await UserModel.findById(req.context?.user)
      .select("-password -cookie")
      .lean();
    res
      .status(201)
      .json({ data: userDetails, message: "user data", success: true });
  } catch (error) {
    console.error(error);
    res.status(404).send({ message: error, success: false });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Validate input
    if (!fullName || !email || !password || !role) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });
    }

    // Check if user exists
    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "email already exists!" });
    }

    // Decrypt password if necessary
    let finalPassword = password; // Assume plaintext unless encryption is used
    try {
      finalPassword = decrypt(password); // Decrypt if encrypted
    } catch (error) {
      console.error("Password decryption failed:", error.message);
      return res
        .status(400)
        .json({ success: false, message: "Invalid encrypted password" });
    }

    // Create new user
    const newUser = new UserModel({
      _id: new mongoose.Types.ObjectId(),
      fullName,
      email,
      password: finalPassword, // Store hashed password
      role: role || "instructor",
      createdAt: new Date(),
    });

    await newUser.save();

    return res
      .status(201)
      .json({ success: true, message: "User created successfully!" });
  } catch (error) {
    console.error("Error in registerUser:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(301).send({ message: "Missing inputs.", success: false });
      return;
    }

    const user = await UserModel.findOne({ email: email })
      .select("_id role password access")
      .lean();
    if (!user) {
      res.status(404).send({ message: "User not found.", success: false });
      return;
    }
    const decryptedPassword = decrypt(password);
    // compare password
    const isPasswordMatch = await bcrypt.compare(
      decryptedPassword,
      user.password
    );
    if (!isPasswordMatch) {
      res
        .status(404)
        .send({ message: "Invalid email or password.", success: false });
      return;
    }

    const uuid = uuidv4();

    // generate token
    const token = signJwt({
      user: user._id.toString(),
      uuid: uuid,
      role: user?.role || "admin",
    });

    const d = await UserModel.updateOne(
      {
        _id: user?._id.toString(),
      },
      {
        $set: {
          cookie: token,
          lastLoggedIn: new Date(),
        },
      }
    );

    res.cookie("accessToken", token, {
      maxAge: 2.592e9, // 30 days
      httpOnly: true, // More secure (set to false only for testing)
      secure: false, //  Set `false` in localhost, `true` in production
      sameSite: "Lax", //  Allows cross-origin cookies in localhost
    });

    res
      .status(200)
      .send({ message: "LoggedIn successful.", success: true, data: user });
  } catch (error) {
    res.status(404).send({ message: error.message, success: false });
    return;
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("accessToken", "", {
      maxAge: 3.154e10,
      httpOnly: true,
      expires: new Date(0),
    });

    await UserModel.updateOne(
      {
        _id: req?.context?.user,
      },
      {
        $set: {
          lastLoggedOut: new Date(),
          cookie: "",
        },
      }
    );
    res.status(200).send({
      message: "User logged out.",
      success: true,
    });
    return;
  } catch (error) {
    res.status(300).send({
      message: error.message,
      success: false,
    });
    return;
  }
};


export const getInstructors = async (req, res) => {
  try {
    // Query the database for users with the role of "instructor"
    const instructors = await UserModel.find({ role: "instructor" }).select(
      "-password -cookie" // Exclude sensitive fields
    );

    // If no instructors are found, return a 404 response
    if (!instructors || instructors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No instructors found",
      });
    }

    // Return the list of instructors
    res.status(200).json({
      success: true,
      data: instructors,
    });
  } catch (error) {
    console.error("Error fetching instructors:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};