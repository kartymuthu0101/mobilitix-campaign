const jwt = require("jsonwebtoken");

const statusCodes = require("../../helpers/constants/httpStatusCodes");

const unAuthorizedResponse = {
    status: statusCodes.HTTP_UNAUTHORIZED,
    message: "unauthorized.",
};

const invalidTokenResponse = {
    status: statusCodes.HTTP_UNAUTHORIZED,
    message: "Invalid token."
}

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req?.headers?.["authorization"];

        if (!authHeader) {
            return res.status(statusCodes.HTTP_UNAUTHORIZED).json(invalidTokenResponse);
        }

        const token = authHeader.includes("Bearer") ? authHeader.split(" ")[1] : authHeader;

        jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
            if (err) {
                return res.status(statusCodes.HTTP_UNAUTHORIZED).json(unAuthorizedResponse);
            }
            req.user = user;
            next();
        });

    } catch (err) {
        console.log("error msgs", err.message);
        return res.status(statusCodes.HTTP_UNAUTHORIZED).json(unAuthorizedResponse);
    }
}

const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        console.log("req.user", req.user?.permissions)
      const permissions = req.user?.permissions || [];
  
      if (!permissions.includes(requiredPermission)) {
        return res.status(statusCodes.HTTP_UNAUTHORIZED).json(unAuthorizedResponse);
      }
  
      next();
    };
  };

module.exports = {
    verifyToken,
    checkPermission
}