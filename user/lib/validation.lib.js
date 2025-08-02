import Validator from "validatorjs";
import { successResponse, errorResponse } from "./general.lib.js";

const valiadate_rules = {
   user: {
      exclusiveAccessToken: {
         access_code: "required",
      },
      register: {
         username: "required",
         email: "required|email",
         password: "required|min:6|max:16",
      },
      verifyOtp: {
         otp: "required|min:6|max:6",
         token:"required",
      },
      login: {
         password: "required|min:6|max:16",
         email: "required|email",
      },
      resetPassOTP:{
         email: "required|email",
      },
      changePassword:{
         password: "required|min:6|max:16",
         otp: "required|min:6|max:6",
      },
      edit_user: {
         user_id: "required",
         status: "required",
      },
      delete_user: {
         user_id: "required",
      },
      update_settings: {
         login_secret_token: "required",
         maintenance_mode: "required",
      },
      update_passwords: {
         new_password: "required|min:6",
         confirm_password: "required|same:new_password",
      },
      addFreePack: {
         celebrityId: "required",
         membershipId: "required",
         totalEntries: "required|min:1",
      },
      makePayment: {
         paymentMethod: "required",
         totalPaymentAmount: "required",
      },
   },
};

/**
 * this function is validate the validation rlues
 */
export const custom_validation = (data, rules, customMessages = {}) => {
   let validation = new Validator(data, get_rules(rules), customMessages);

   if (validation.fails()) {
      let error = "";
      for (let key in validation.errors.errors) {
         error = validation.errors.errors[key][0];
      }
      return errorResponse(error);
   }
   return successResponse("Success");
};

export const get_rules = (rules) => {
   let rule = rules.split(".");
   return valiadate_rules[rule[0]][rule[1]];
};


