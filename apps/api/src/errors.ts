/** API error with an HTTP status; mapped to the {error:{code,message}} envelope (AD-5). */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(message: string): ApiError {
    return new ApiError(400, "BAD_REQUEST", message);
  }

  static notFound(message: string): ApiError {
    return new ApiError(404, "NOT_FOUND", message);
  }
}
