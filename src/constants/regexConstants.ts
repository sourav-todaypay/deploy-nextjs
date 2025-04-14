export const regexps = {
  website:
    /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})?/g,
  alphabetWithSpaces: new RegExp('^[A-Za-z ]+$'),
  alphabetWithoutSpaces: new RegExp('^\\s*[A-Za-z]+\\s*$'),
  phoneNumber: new RegExp(/^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/),
  alphaNumericWithSpaces: new RegExp(/^[A-Za-z0-9 ]+$/),
  employerIdentificationNumber: new RegExp(/^\d{9}$/),
  zipcode: new RegExp(/^\d{5}$/),
  email: new RegExp(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  ),
  dob: new RegExp(/(\d{2})-(\d{4})-(\d{2})/),
  phone_filter: new RegExp(/^\d{1,10}$/),
  decimalFloatToTwo: new RegExp(/^\d+(\.\d{1,2})?$/),
};
