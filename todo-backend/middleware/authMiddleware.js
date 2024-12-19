// const express = require('express');
// // const ToDo = require('../models/task'); // Import the ToDo model correctly
// // const router = express.Router();
// const crypto = require('crypto');

// const SECRET_KEY = "a3f5c1eaa2834c1f92f0568abed83b4b9f0fcd8a7e5cbfed4fbd01dc5762c8ab"; // Replace with a secure key

// // Middleware to verify the token
// function verifyAuthToken(req) {
//   const authorizationHeader = req.headers['authorization'];
  
//   console.log("Authorization Header:", authorizationHeader);  // Log the authorization header

//   if (authorizationHeader) {
//       const authHeader = authorizationHeader.split('.');
//       console.log("Auth Header Parts:", authHeader);  // Log the parts of the token (before and after the dot)

//       if (authHeader.length !== 3) {
//           console.log("Token structure is incorrect. Expected 3 parts, but got:", authHeader.length);
//           return {
//               status: false,
//               message: "Invalid Token Structure"
//           };
//       }

//       const expectedHash = crypto.createHmac('sha256', SECRET_KEY).update(authHeader[0]).digest('hex');
//       console.log("Expected Hash:", expectedHash);  // Log the expected hash value

//       if (authHeader[1] !== expectedHash) {
//           console.log("Token is invalid: Hash mismatch");  // Log when the hash doesn't match
//           return {
//               status: false,
//               message: "Invalid Token"
//           };
//       } else {
//           console.log("Token hash matches, checking expiration...");

//           if (Date.now() > parseInt(authHeader[2])) {
//               console.log("Token is expired");  // Log when the token has expired
//               return {
//                   status: false,
//                   message: "Token Expired"
//               };
//           } else {
//               console.log("Token is valid");  // Log when the token is valid
//               return {
//                   status: true,
//                   message: ""
//               };
//           }
//       }
//   } else {
//       console.log("Authorization header not found");  // Log when the token is not provided
//       return {
//           status: false,
//           message: "Token not available"
//       };
//   }
// }


// module.exports = verifyAuthToken;
