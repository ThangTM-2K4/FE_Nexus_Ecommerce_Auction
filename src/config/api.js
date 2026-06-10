export const mockUsers = [
  {
    id: 1,
    email: "admin@gmail.com",
    phone: "0000000001",
    password: "123456",
    role: "ADMIN",
  },
  {
    id: 2,
    email: "staff@gmail.com",
    phone: "0000000002",
    password: "123456",
    role: "STAFF",
  },
  {
    id: 3,
    email: "seller@gmail.com",
    phone: "0000000003",
    password: "123456",
    role: "SELLER",
  },
  {
    id: 4,
    email: "buyer@gmail.com",
    phone: "0000000004",
    password: "123456",
    role: "BUYER",
  },
];

export const loginAPI = (login, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {

      const localUsers = JSON.parse(localStorage.getItem("mockUsers")) || [];
      const allUsers = [...mockUsers, ...localUsers];
      const user = allUsers.find(
        (u) =>
          (u.phone === login ||
            u.email === login) &&
          u.password === password
      );

      if (user) {
        resolve(user);
      } else {
        reject({
          message:
            "Tên đăng nhập hoặc mật khẩu không chính xác",
        });
      }
    }, 1000);
  });
};

  export const registerAPI = (
    userData
  ) => {
    return new Promise((resolve, reject) => {

      const localUsers =
        JSON.parse(
          localStorage.getItem("mockUsers")
        ) || [];

      const allUsers = [
        ...mockUsers,
        ...localUsers,
      ];

      const existedUser =
        allUsers.find(
          (u) =>
            u.email === userData.email ||
            u.phone === userData.phone
        );

      if (existedUser) {
        reject({
          message:
            "Email hoặc số điện thoại đã tồn tại",
        });

        return;
      }

      const newUser = {
        id: Date.now(),
        ...userData,
      };

      localUsers.push(newUser);

      localStorage.setItem(
        "mockUsers",
        JSON.stringify(localUsers)
      );

      resolve(newUser);

    });
  };
