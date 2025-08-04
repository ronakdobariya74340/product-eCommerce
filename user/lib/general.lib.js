import jwt from "jsonwebtoken";
import moment from "moment";
import UserToken from "../models/userToken.model.js";
import axios from "axios";
import mongoose from "mongoose";
import User from "../models/user.models.js";
import Constant from "../config/constant.js";
import ejs from "ejs"
import { sendMail } from "../utils/sendMail.helper.js";

export const errorResponse = (msg = "", data = {}) => {
    let res = { status: 400, flag: 0 };
    res.msg = msg.length == 0 ? "Error" : msg;
    res.data = data;
    return res;
};
  
export const successResponse = (msg = "", data = {}) => {
    let res = { status: 200, flag: 1 };
    res.msg = msg.length == 0 ? "Success" : msg;
    res.data = data;
    return res;
};
  
export const validation_res = (msg = "", data = {}) => {
    let res = { flag: 2 };
    res.msg = msg.length == 0 ? "Validation Error" : msg;
    res.data = data;
    return res;
};
  
export const info_res = (msg = "", data = {}) => {
    let res = { flag: 3 };
    res.msg = msg.length == 0 ? "Info" : msg;
    res.data = data;
    return res;
};
  
export const in_valid_res = (msg = "", data = {}) => {
    let res = { status: 404, flag: 4 };
    res.msg = msg.length == 0 ? "In Valid Error" : msg;
    res.data = data;
    return res;
};
  
export const authErrorResponse = (msg = "", data = {}) => {
    let res = { status: 401, flag: 8 };
    res.msg = msg.length == 0 ? "Unauthorized Token" : msg;
    res.data = data;
    return res;
};
  
export const maintenance_error = (msg = "") => {
    let res = { flag: 9 };
    res.msg = msg.length == 0 ? "Service unavailable due to maintenance" : msg;
    return res;
};
  
export const log1 = (msg) => {
    const d = new Date();
    console.log("[" + d.toLocaleString() + " " + d.getMilliseconds() + "] :", msg);
};

export const generateLoginToken = async (payload, req) => {
    try {

        if(payload == null || payload == undefined) {
            return errorResponse("Payload is required for generating token", {});
        }

        let ip = req.ip;
        if(!ip){
            return errorResponse("invalid ip");
        };
        ip = ip.split(":").pop(); // Get the last part of the IP address
        let location = await ip2location(ip);
        if (location.flag !== 1) {
            log1(["Error fetching location for IP ----->", location.msg]);
            return errorResponse("Unable to fetch location for IP address", {});
        }
        let country = location.data.country_code 
        const userAgent = req.get("User-Agent");

        let userData = await User.findOne({_id: payload._id})
        if(userData && userData.loginToken?.length >= Constant.MAX_DEVICE_LOGIN_LIMIT){
            const token = userData?.loginToken.shift()
            await userData.save()
            await UserToken.deleteOne({token: token})
        }

        const token = jwt.sign(payload, process.env.AUTHSECRET, { expiresIn: "1d" });
        const data = {
            userid: ObjectId(payload._id),
            device: req.ua?.deviceType,
            deviceModal: req.ua?.deviceModel,
            browser: req.ua?.browser,
            deviceVendor: req.ua?.deviceVendor,
            os: req.ua?.os,
            token: token,
            ip: ip,
            location: country,
            status: 1,
            userAgent: userAgent
        }

        const result = await new UserToken(data).save();
        userData.loginToken?.push(token)
        await userData.save()

        if (!result) return errorResponse("Failed to generate login token", {});

        return token;
    } catch (error) {
        log1(["Error in generateLoginToken ----->", error]);
        return errorResponse("", {});
    }
};

export const generateRandomNumber = async (length) => {
    let characters = "0123456789";
    let charactersLength = characters.length;
    let str = "";
    for (let i = 0; i < length; i++) {
        str += characters.charAt(Math.floor(Math.random() * charactersLength));
    };
    return str;
};

export const DateInHumanReadleFormat = (date) => {
	let currentDate = moment.utc();
	const formattedCurretDatetime = currentDate.toISOString();
	currentDate = moment(formattedCurretDatetime).utc();
	const targetDate = moment(date).utc();
	const secondDifference = currentDate.diff(targetDate, 'seconds');
	if (secondDifference < 60) {
		return `${secondDifference} ${'seconds ago'}`;
	} else if (secondDifference > 60 && secondDifference < 3600) {
		const minDifference = Math.floor(secondDifference / 60);
		return `${minDifference} ${'minutes ago'}`;
	} else if (secondDifference > 3600 && secondDifference < 86400) {
		const hourDifference = Math.floor(secondDifference / 3600);
		return `${hourDifference} ${'hours ago'}`;
	} else if (secondDifference > 86400 && secondDifference < 604800) {
		const dayDifference = Math.floor(secondDifference / 86400);
		return `${dayDifference} ${'days ago'}`;
	} else if (secondDifference > 604800 && secondDifference < 2592000) {
		const weeksDifference = Math.floor(secondDifference / 604800);
		return `${weeksDifference} ${weeksDifference > 1 ? `${'weeks'}` : `${'week'}`} ${'ago'}`;
	} else if (secondDifference > 2592000 && secondDifference < 31104000) {
		const yearDifference = Math.floor(secondDifference / 2592000);
		return `${yearDifference} ${yearDifference > 1 ? `${'month'}` : `${'months'}`} ${'ago'}`;
	} else if (secondDifference > 31104000) {
		const yearDifference = Math.floor(secondDifference / 31104000);
		return `${yearDifference} ${yearDifference > 1 ? `${'year'}` : `${'years'}`} ${'ago'}`;
	} else {
		const monthsDifference = Math.floor(secondDifference / 30);
		return `${monthsDifference} ${monthsDifference > 1 ? `${'months'}` : `${'month'}`} ${'ago'}`;
	};
};

export const ip2location = async (ip) => {
    let data = {
      country_name: 'Not Found',
    };
    let res;
  
    if (process.env.APP_ENV == 'local') {
      res = errorResponse("", data);
      return res;
    }
    try {
      let url = `http://www.geoplugin.net/json.gp?ip=${ip}`;
      let response = await axios.get(url, { headers: { Accept: 'application/json' } });
  
      let location = response.data;
  
      data.country_name = location.geoplugin_countryName;
      data.country_code = location.geoplugin_countryCode;
      data.city = location.geoplugin_city;
      data.region = location.geoplugin_region;
      data.lat = location.geoplugin_latitude;
      data.long = location.geoplugin_longitude;
  
      res = successResponse("", data);
    } catch (error) {
      log1(["Error fetching ip2location ----->", error]);
      res = errorResponse("", data);
    }
    return res;
}

export const ObjectId = (id) => {
    return new mongoose.Types.ObjectId(id);
}

export const generateRandomCode = (length = 8) => {
    return Math.random().toString(36).substr(2, length).toUpperCase();
};

export const dateFormatByTimezone = (date) => {
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    const formattedDate = formatter.format(date) + " IST";

    return formattedDate
};

export const getDeviceLabel = (userAgent) => {
    if (/iPhone/i.test(userAgent)) return "iPhone";
    if (/iPad/i.test(userAgent)) return "iPad";
    if (/Android/i.test(userAgent)) return "Android";
    if (/Windows/i.test(userAgent)) return "Windows";
    if (/Macintosh/i.test(userAgent)) return "Mac";

    return "Unknown";
}

export const formatDeviceAndIp = (userAgent, ip) => {
    const device = getDeviceLabel(userAgent);
    return `${device}/${ip}`;
};