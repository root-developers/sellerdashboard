import { legacy_createStore as createStore, combineReducers } from 'redux'
import { UserReducer } from "./Redux/reducers";

const initialState = {
  sidebarShow: true,
  theme: 'light',
}

const changeState = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      return { ...state, ...rest }
    default:
      return state
  }
}

// combine reducers
const rootReducer = combineReducers({
  ui: changeState,
  UserReducer: UserReducer
});

const store = createStore(rootReducer)
export default store
