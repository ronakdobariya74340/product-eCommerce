import jwt from 'jsonwebtoken';
import moment from 'moment';
import mongoose from 'mongoose';
import unique_string from "unique-string";


export const errorResponse = (msg = '', data = {}) => {
  var res = {status: 400, flag: 0};
  res.msg = msg.length == 0 ? 'Error' : msg;
  res.data = data;
  return res;
};

export const successResponse = (msg = '', data = {}) => {
  var res = {status: 200, flag: 1};
  res.msg = msg.length == 0 ? 'Success' : msg;
  res.data = data;
  return res;
};

export const validation_res = (msg = '', data = {}) => {
  var res = {flag: 2};
  res.msg = msg.length == 0 ? 'Validation Error' : msg;
  res.data = data;
  return res;
};

export const info_res = (msg = '', data = {}) => {
  var res = {flag: 3};
  res.msg = msg.length == 0 ? 'Info' : msg;
  res.data = data;
  return res;
};

export const in_valid_res = (msg = '', data = {}) => {
  var res = {status: 404, flag: 4};
  res.msg = msg.length == 0 ? 'In Valid Error' : msg;
  res.data = data;
  return res;
};

export const authErrorResponse = (msg = '', data = {}) => {
  var res = {status: 401, flag: 8};
  res.msg = msg.length == 0 ? 'Unauthorized Token' : msg;
  res.data = data;
  return res;
};

export const maintenance_error = (msg = '') => {
  var res = {flag: 9};
  res.msg = msg.length == 0 ? 'Service unavailable due to maintenance' : msg;
  return res;
};

export const log1 = msg => {
  const d = new Date ();
  console.log (
    '[' + d.toLocaleString () + ' ' + d.getMilliseconds () + '] :',
    msg
  );
};

// Kushwaha Bhavesh 2025-06-12
export const generateLoginToken = async payload => {
  try {
    const token = jwt.sign (payload, process.env.AUTHSECRET);

    return token;
  } catch (error) {
    log1 (['Error in generateLoginToken ----->', error]);
    return "";
  }
};

export const DateInHumanReadleFormat = date => {
  let currentDate = moment.utc ();
  const formattedCurretDatetime = currentDate.toISOString ();
  currentDate = moment (formattedCurretDatetime).utc ();
  const targetDate = moment (date).utc ();
  const secondDifference = currentDate.diff (targetDate, 'seconds');
  if (secondDifference < 60) {
    return `${secondDifference} ${'seconds ago'}`;
  } else if (secondDifference > 60 && secondDifference < 3600) {
    const minDifference = Math.floor (secondDifference / 60);
    return `${minDifference} ${'minutes ago'}`;
  } else if (secondDifference > 3600 && secondDifference < 86400) {
    const hourDifference = Math.floor (secondDifference / 3600);
    return `${hourDifference} ${'hours ago'}`;
  } else if (secondDifference > 86400 && secondDifference < 604800) {
    const dayDifference = Math.floor (secondDifference / 86400);
    return `${dayDifference} ${'days ago'}`;
  } else if (secondDifference > 604800 && secondDifference < 2592000) {
    const weeksDifference = Math.floor (secondDifference / 604800);
    return `${weeksDifference} ${weeksDifference > 1 ? `${'weeks'}` : `${'week'}`} ${'ago'}`;
  } else if (secondDifference > 2592000 && secondDifference < 31104000) {
    const yearDifference = Math.floor (secondDifference / 2592000);
    return `${yearDifference} ${yearDifference > 1 ? `${'month'}` : `${'months'}`} ${'ago'}`;
  } else if (secondDifference > 31104000) {
    const yearDifference = Math.floor (secondDifference / 31104000);
    return `${yearDifference} ${yearDifference > 1 ? `${'year'}` : `${'years'}`} ${'ago'}`;
  } else {
    const monthsDifference = Math.floor (secondDifference / 30);
    return `${monthsDifference} ${monthsDifference > 1 ? `${'months'}` : `${'month'}`} ${'ago'}`;
  }
};

// upload Image // Kushwaha Bhavesh 2025-06-24 
export const uploadImage = async ({file, path, prefix = 'image'}) => {
  if(!file.length) return [];
  
  let ImageArray = [];
  for (let i = 0; i < file.length; i++) {
    let file_name = file[i].name;
    let filename = `${prefix}_${unique_string()}_${file_name}`;

    file[i].mv (`${path}/${filename}`, err => {
      if (err) return errorResponse ('Failed to upload image.');
    });

    ImageArray.push (filename);
  }

  return ImageArray;
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
