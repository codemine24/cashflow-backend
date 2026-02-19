import cookiePerser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import httpStatus from "http-status";
import globalErrorHandler from "./app/middlewares/global-error-handler";
import notFoundHandler from "./app/middlewares/not-found-handler";
import router from "./app/routes";
import swaggerRoutes from "./app/routes/swagger.routes";

const app: Application = express();

// third party middleware configuration
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookiePerser());
app.use(
  cors({
    origin: [
      "http://localhost:8081",
      "http://localhost:3000",
      "https://dashboard.techtongbd.com",
    ],
    credentials: true,
  }),
);

// test server
app.get("/", (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "Techtong server is working fine",
  });
});

// main routes
app.use("/api/v1", router);

app.use("/api-docs", swaggerRoutes);

// handle error
app.use(globalErrorHandler);
app.use(notFoundHandler);

export default app;
