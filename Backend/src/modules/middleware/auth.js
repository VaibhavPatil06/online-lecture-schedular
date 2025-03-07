// import UserModel from "../../model/NewModel/userModel.js";
import { verifyJwt } from "../../utils/auth.js";
import UserModel from "../adminUser/schema/admin-user.schema.js";

export const isAuth = async (req, res, next) => {
  try {
    if (!req?.context?.user && !req?.context?.admin) {
      res.status(401).json({
        message: "Please Logged in",
        success: false,
      });
      return;
    }
    next();
  } catch (error) {
    res.status(error.status).json({
      message: error.message,
    });
    return;
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    let context = {
      user: undefined,
      role: undefined,
      uuid: undefined,
    };
    console.log(req.context);
    if (!req?.context?.user) {
      res.status(401).json({
        message: "Please Logged in",
        success: false,
      });
      return;
    }
    const admin = await UserModel.findById(req.context.user)
      .select("_id role cookie access uuid")
      .lean();
    // get token from the db decode it and compare it with uuid

    const decodeToken = verifyJwt(admin?.cookie);

    if (decodeToken?.uuid !== req.context?.uuid) {
      res.status(201).send({ message: "Please loggedIn.", success: false });
      return;
    }

    if (!admin) {
      return res.status(400).json({
        message: "Admin not found",
        success: false,
      });
    }

    context = {
      user: admin?._id,
      role: admin?.role,
      uuid: admin?.uuid,
    };

    req.context = context;
    next();
  } catch (error) {
    res.status(error.status).json({
      message: error.message,
    });
    return;
  }
};

export const setContext = async (req, res, next) => {
  try {
    let context = {
      user: undefined,
      role: undefined,
      uuid: undefined,
    };
    if (req?.cookies.accessToken) {
      const user = verifyJwt(req.cookies.accessToken);
      context.user = user?.user;
      context.role = user?.role;
      context.uuid = user?.uuid || "unique id";
    }

    req.context = context;
    next();
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
