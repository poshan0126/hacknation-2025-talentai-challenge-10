import { combineReducers } from 'redux';
import placeholderReducer from './placeholder-slice';

const RootReducer = combineReducers({
  placeholder: placeholderReducer,
});

export default RootReducer;
