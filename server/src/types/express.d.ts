import { Request } from "express";
import { FileArray, UploadedFile } from "express-fileupload";

declare module "express-serve-static-core" {
  interface Request {
    files?: FileArray | undefined;
  }
}
