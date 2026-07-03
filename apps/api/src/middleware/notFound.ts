import type { RequestHandler } from "express";

export const notFound: RequestHandler = (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `No route found for ${req.method} ${req.originalUrl}`
  });
};

