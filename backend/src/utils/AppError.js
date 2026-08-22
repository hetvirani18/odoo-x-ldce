class AppError extends Error {
  constructor(message, code, statusCode) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

// Error code convention:
// 1xxxx — Common / general errors
// 2xxxx — Auth
// 3xxxx — Trip / Stop / Itinerary
// 4xxxx — City / Activity
// 5xxxx — Budget / Cost estimation
// 6xxxx — External service / provider errors

const ERRORS = {
  // Common (1xxxx)
  DATABASE_ERROR: new AppError("Database operation failed", 10001, 500),
  VALIDATION_ERROR: new AppError("Validation failed", 10002, 422),
  RESOURCE_NOT_FOUND: new AppError("Resource not found", 10003, 404),
  ROUTE_NOT_FOUND: new AppError("Route not found", 10004, 404),
  RATE_LIMIT_EXCEEDED: new AppError(
    "Too many requests, please try again later",
    10005,
    429,
  ),

  // Auth (2xxxx)
  NO_TOKEN_PROVIDED: new AppError(
    "No authentication token provided",
    20001,
    401,
  ),
  INVALID_AUTH_TOKEN: new AppError("Invalid authentication token", 20002, 401),
  EMAIL_ALREADY_EXISTS: new AppError("Email already registered", 20003, 409),
  INVALID_CREDENTIALS: new AppError("Invalid email or password", 20004, 401),
  RESET_TOKEN_INVALID: new AppError(
    "Password reset link is invalid",
    20005,
    400,
  ),
  RESET_TOKEN_EXPIRED: new AppError(
    "Password reset link has expired",
    20006,
    400,
  ),
  ADMIN_ONLY_ROUTE: new AppError("Admin access required", 20007, 403),

  // Trip / Stop (3xxxx)
  TRIP_NOT_FOUND: new AppError("Trip not found", 30001, 404),
  STOP_NOT_FOUND: new AppError("Stop not found", 30002, 404),
  TRIP_NOT_OWNED: new AppError("You do not own this trip", 30003, 403),
  INVALID_DATE_RANGE: new AppError("Invalid date range", 30004, 422),
  TRIP_NOT_PUBLIC: new AppError("Trip is not public or does not exist", 30005, 404),

  // City / Activity (4xxxx)
  CITY_NOT_FOUND: new AppError("City not found", 40001, 404),
  ACTIVITY_NOT_FOUND: new AppError("Activity not found", 40002, 404),
  ACTIVITY_NOT_IN_CITY: new AppError(
    "Activity does not belong to this city",
    40003,
    422,
  ),

  // Budget (5xxxx)
  BUDGET_CALC_FAILED: new AppError(
    "Failed to calculate trip budget",
    50001,
    500,
  ),

  // External services (6xxxx)
  CITY_PROVIDER_UNAVAILABLE: new AppError(
    "City search service unavailable",
    60001,
    502,
  ),
  ACTIVITY_PROVIDER_UNAVAILABLE: new AppError(
    "Activity search service unavailable",
    60002,
    502,
  ),
  PRICING_PROVIDER_UNAVAILABLE: new AppError(
    "Pricing service unavailable",
    60003,
    502,
  ),
  EMAIL_SEND_FAILED: new AppError("Failed to send email", 60004, 502),
};

module.exports = { AppError, ERRORS };
