const getUser = () => {
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  if (user) {
    return user;
  }

  return null;  
};

const InitialState = {
  user: getUser(),
};

const UserReducer = (state = InitialState, action) => {
  if (action.type === "Save_User") {
    const newState = {
      user: action.payload,
    };

    localStorage.setItem("user", JSON.stringify(action.payload));

    return newState;
  }

  //Update
  else if (action.type === "Update_User") {
    const newState = {
      user: { ...state.user, ...action.payload },
    };

    localStorage.setItem("user", JSON.stringify(newState.user));

    return newState;
  }

  //logout
  else if (action.type === "Remove_User") {
    const newState = {
      user: null,
    };

    localStorage.removeItem("user");
    //window.location.href = "/";

    return newState;
  }

  return state;
};

export default UserReducer;
