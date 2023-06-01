import dotenv from 'dotenv';
dotenv.config();

const baseUrls:any = {
    development: "http://localhost:8080",
    test: "http://localhost:8080",
    qa: "http://localhost:8080",
    production :'http://localhost:8080',   
}
const emailUrls:any = {
    development: "http://localhost:8080",
    test: "http://localhost:8080",
    qa: "http://localhost:8080",
    production :'http://localhost:8080',   
}
const env:any = process.env.NODE_ENV || 'development';
export const config = {
    BASE_URL: baseUrls[env],
    EMAIL_URL: emailUrls[env],
    API_PREFIX: '/api/v1',
    UPLOAD_FILE_PATH:'./src/libs/fileUploader/uploads/',
    UPLOAD_FILE_SIZE: 10485760,  // in bytes
    SERVER_HTTPS: false,
}