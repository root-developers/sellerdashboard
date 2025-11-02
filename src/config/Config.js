const mainDomain = "https://kuality.co.in/";

const GetAccessToken = () => {
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;
  if (user) return user.token;

  return null;
};

const GetUserId = () => {
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  if (user) return user.userId;

  return null;
};

const Config = {
  AxiosConfig: {
    headers: {
      authorization: `${GetAccessToken()}`,
      id: GetUserId(),
    },
  },

  userType: {
    ADMIN: 'admin',
    BUYER: 'buyer',
    SELLER: 'seller',
  },
  domain: mainDomain,
  apiUrl: mainDomain + "api",
  sessionExpiredTime: 15, // in minutes
  idleTime: 15, // in mins
  
  productMapping: {
    1: "Sample 1",
    2: "Sample 2",
    3: "Sample 3",
    4: "Sample 4",
  },
};

export default Config;
