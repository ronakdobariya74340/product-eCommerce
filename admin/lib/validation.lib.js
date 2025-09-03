import Validator from "validatorjs";
import { successResponse, errorResponse } from "./general.lib.js";

const valiadate_rules = {
   admin: {
      login: {
         password: "required",
         email: "required|email",
      },
      edit_user: {
         user_id: "required",
         status: "required",
         reason: "required_if:status,3|string"
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
      add_product: {
         name: "required|min:3",
         productCategoryId: "required",
         productPrice: "required",
      },
      product_details: {
         productId: "required",
      },
      edit_product: {
         product_id: "required",
         name: "required|min:3",
         productCategoryId: "required",
         productPrice: "required",
      },
      add_product_category: {
         name: "required|min:3",
      },
      product_category_details: {
         productCategoryId: "required",
      },
      edit_product_category: {
         productCategoryId: "required",
         name: "required|min:3",
      },
      add_product_banner: {
         name: "required|min:3",
      },
      product_banner_details: {
         productBannerId: "required",
      },
      edit_product_banner: {
         productBannerId: "required",
         name: "required|min:3",
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


