import jwt from 'jsonwebtoken'

const publicKey = Buffer.from(process.env.PUBLIC_KEY, "base64").toString(
    "ascii"
  );
  const privateKey = Buffer.from(process.env.PRIVATE_KEY, "base64").toString(
    "ascii"
);

export function jwtValid(token) {
    var isValid = false;
    jwt.verify(token, publicKey, (error, decode) => {
      if (error?.name === "TokenExpiredError") {
        isValid = true;
      } else {
        isValid = false;
      }
    });
    return isValid;
  }

export function signJwt(object, options) {
    return jwt.sign(object, privateKey, {
      ...(options && options),
      algorithm: "RS256"
      // expiresIn:"10s"
    });
  }

export function verifyJwt(token){
    try {
      const decoded = jwt.verify(token, publicKey);
      return decoded;
    } catch (error) {
      return null;
    }
  }
